// ================================================
// 🔧 CONFIGURAÇÃO SUPABASE (Compatível com AI Studio e Vercel)
// ================================================

// As credenciais do Supabase são carregadas a partir de variáveis de ambiente
// definidas em index.html para centralizar a configuração.
const supabaseUrl = window.process.env.SUPABASE_URL;
const supabaseAnonKey = window.process.env.SUPABASE_ANON_KEY;

import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile, UserPreferences } from '../types';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL e Chave Anônima devem ser definidas corretamente em index.html',
  );
}

// Inicializa o cliente
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/*
================================================================================
IMPORTANTE: Configuração do Banco de Dados para Matches e Perfis Completos
================================================================================
Para que o sistema de matches e o salvamento de perfis funcionem corretamente,
você PRECISA executar o seguinte código SQL no seu editor SQL do Supabase
(Database -> SQL Editor -> New query).

----------------------------- INÍCIO DO CÓDIGO SQL -----------------------------

-- 1. Tabela para registrar os swipes (curtidas/rejeições)
CREATE TABLE IF NOT EXISTS public.swipes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  swiper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  swiped_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  swipe_type TEXT NOT NULL, -- pode ser 'like', 'dislike', 'super'
  CONSTRAINT swipes_unique_pair UNIQUE (swiper_id, swiped_id)
);

-- 2. Tabela para armazenar os matches
CREATE TABLE IF NOT EXISTS public.matches (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  CONSTRAINT matches_unique_pair UNIQUE (user1_id, user2_id)
);

-- 3. Habilitar Row Level Security (RLS) para as novas tabelas (se ainda não estiver)
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança para a tabela 'swipes'
DROP POLICY IF EXISTS "Users can insert their own swipes" ON public.swipes;
CREATE POLICY "Users can insert their own swipes"
ON public.swipes FOR INSERT
WITH CHECK (auth.uid() = swiper_id);

DROP POLICY IF EXISTS "Users can read their own swipes" ON public.swipes;
CREATE POLICY "Users can read their own swipes"
ON public.swipes FOR SELECT
USING (auth.uid() = swiper_id);

-- 5. Políticas de Segurança para a tabela 'matches'
DROP POLICY IF EXISTS "Users can read their own matches" ON public.matches;
CREATE POLICY "Users can read their own matches"
ON public.matches FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);


-- 6. Função do Banco de Dados para processar o swipe e verificar se deu match (RPC)
-- Esta função garante que a verificação de match aconteça de forma segura e atômica.
CREATE OR REPLACE FUNCTION handle_swipe(
    p_swiper_id UUID,
    p_swiped_id UUID,
    p_swipe_type TEXT
)
RETURNS JSONB AS $$
DECLARE
    is_match BOOLEAN := FALSE;
    swiped_profile_data JSONB;
BEGIN
    -- Insere o swipe, ignorando se já existir um swipe entre os dois.
    INSERT INTO public.swipes (swiper_id, swiped_id, swipe_type)
    VALUES (p_swiper_id, p_swiped_id, p_swipe_type)
    ON CONFLICT (swiper_id, swiped_id) DO NOTHING;

    -- Se for 'like' ou 'super', verifica se o outro usuário também curtiu.
    IF p_swipe_type = 'like' OR p_swipe_type = 'super' THEN
        SELECT EXISTS (
            SELECT 1
            FROM public.swipes
            WHERE swiper_id = p_swiped_id
            AND swiped_id = p_swiper_id
            AND (swipe_type = 'like' OR swipe_type = 'super')
        ) INTO is_match;
    END IF;

    -- Se deu match, insere o registro na tabela 'matches'.
    IF is_match THEN
        INSERT INTO public.matches (user1_id, user2_id)
        VALUES (
            LEAST(p_swiper_id, p_swiped_id),
            GREATEST(p_swiper_id, p_swiped_id)
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;

    -- Se deu match, retorna os dados do perfil do usuário que recebeu o swipe.
    IF is_match THEN
        SELECT row_to_json(p)
        FROM public.profiles p
        WHERE p.id = p_swiped_id
        INTO swiped_profile_data;
    ELSE
        swiped_profile_data := NULL;
    END IF;
    
    RETURN jsonb_build_object('is_match', is_match, 'profile', swiped_profile_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Adicionar colunas de geolocalização à tabela 'profiles'
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude float8,
ADD COLUMN IF NOT EXISTS longitude float8;

-- 8. Adicionar TODAS as colunas de perfil que estão faltando
-- Execute este bloco de uma vez no seu editor SQL do Supabase.
-- Ele adiciona as colunas apenas se elas ainda não existirem, sendo seguro de executar.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age int,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS images text[],
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS relationshipGoal text,
  ADD COLUMN IF NOT EXISTS compatibility int,
  ADD COLUMN IF NOT EXISTS isPubliclySearchable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS showLikes boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS distanceFromUser real,
  ADD COLUMN IF NOT EXISTS altura int,
  ADD COLUMN IF NOT EXISTS porteFisico text,
  ADD COLUMN IF NOT EXISTS fumante text,
  ADD COLUMN IF NOT EXISTS consumoAlcool text,
  ADD COLUMN IF NOT EXISTS interesseEm text,
  ADD COLUMN IF NOT EXISTS diasPreferenciais text[],
  ADD COLUMN IF NOT EXISTS horariosPreferenciais text[],
  ADD COLUMN IF NOT EXISTS numLikes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signo text,
  ADD COLUMN IF NOT EXISTS religiao text,
  ADD COLUMN IF NOT EXISTS pets text,
  ADD COLUMN IF NOT EXISTS idiomas text[],
  ADD COLUMN IF NOT EXISTS disponibilidade text,
  ADD COLUMN IF NOT EXISTS pcd text,
  ADD COLUMN IF NOT EXISTS pcdTipo text,
  ADD COLUMN IF NOT EXISTS preferences jsonb;

-- 9. Renomear a coluna 'nickname' para 'apelido' se ela ainda existir.
-- A aplicação usa 'apelido' internamente para consistência.
-- O comando abaixo tenta renomear a coluna. Se falhar (porque 'apelido' já existe
-- ou 'nickname' não existe), ele será ignorado sem causar erro.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='nickname')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='apelido') THEN
    ALTER TABLE public.profiles RENAME COLUMN nickname TO apelido;
  END IF;
END $$;

-- 10. Atualizar perfis existentes com valores padrão para novas colunas não nulas
-- Isso evita problemas com perfis antigos que não possuem esses campos.
UPDATE public.profiles
SET
  images = COALESCE(images, '{}'::text[]),
  interests = COALESCE(interests, '{}'::text[]),
  idiomas = COALESCE(idiomas, '{}'::text[]),
  isPubliclySearchable = COALESCE(isPubliclySearchable, false),
  showLikes = COALESCE(showLikes, true),
  numLikes = COALESCE(numLikes, 0);

------------------------------ FIM DO CÓDIGO SQL -------------------------------
*/

// ================================================
// 🚀 Função de Cadastro
// ================================================
const signUp = async ({
  email,
  password,
  options,
}: {
  email: string;
  password?: string;
  options?: { data?: { [key: string]: any } };
}) => {
  try {
    const { data: authData, error: authError } =
      await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            apelido: options?.data?.name || 'Novo Usuário',
          },
        },
      });

    if (authError) {
      console.error('Erro no cadastro:', authError.message);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return {
        data: null,
        error: { message: 'Usuário não retornado pelo Supabase.' },
      };
    }

    // Verifica se o perfil já existe
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    // Se não existir, cria o perfil
    if (!existingProfile) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: authData.user.id,
          apelido: options?.data?.name || 'Novo Usuário',
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError.message);
        return { data: authData, error: profileError };
      }
    }

    return { data: authData, error: null };
  } catch (err: any) {
    console.error('Erro inesperado no cadastro:', err);
    return { data: null, error: err };
  }
};

// ================================================
// 🚪 Login de teste
// ================================================
const signInForTesting = async () => {
  return supabaseClient.auth.signInWithPassword({
    email: 'teste@encontrocerto.com',
    password: 'password123',
  });
};

// ================================================
// 👤 Criação de perfil para login com Google/OAuth
// ================================================
async function createProfileForNewUser(
  user: SupabaseUser,
): Promise<UserProfile | null> {
  const displayName =
    user.user_metadata.full_name ||
    user.user_metadata.name ||
    'Novo Usuário';

  // Verifica se já existe o perfil
  const { data: existingProfile } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error } = await supabaseClient.from('profiles').insert({
      id: user.id,
      apelido: displayName,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Erro ao criar perfil OAuth:', error.message);
      return null;
    }
  }

  const { data, error: fetchError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    console.error('Erro ao buscar perfil recém-criado:', fetchError.message);
    return null;
  }

  if (data) data.name = data.apelido;
  return data as UserProfile;
}

// ================================================
// ❤️ Funções de Swipe e Match
// ================================================
async function getSwipedUserIds(userId: string): Promise<string[]> {
    const { data, error } = await supabaseClient
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId);

    if (error) {
      console.error('Erro ao buscar swipes:', error.message);
      return [];
    }
    return data.map(item => item.swiped_id);
}

async function handleSwipeAndCheckForMatch(
    swiperId: string,
    swipedId: string,
    swipeType: 'like' | 'dislike' | 'super'
  ): Promise<{ is_match: boolean; profile: UserProfile | null }> {
    const { data, error } = await supabaseClient
      .rpc('handle_swipe', {
        p_swiper_id: swiperId,
        p_swiped_id: swipedId,
        p_swipe_type: swipeType,
      });

    if (error) {
      console.error('Erro ao processar o swipe via RPC:', error);
      if (error.code === '42883') {
          console.warn("Função RPC 'handle_swipe' não encontrada no Supabase. O sistema de match não funcionará. Por favor, crie a função no seu editor SQL do Supabase seguindo as instruções.");
      }
      return { is_match: false, profile: null };
    }
    
    const result = data as { is_match: boolean; profile: UserProfile | null };
    if (result.profile) {
        result.profile.name = (result.profile as any).apelido || result.profile.name;
    }
    return result;
}

async function getMatchesForUser(userId: string): Promise<UserProfile[]> {
    const { data: matchRecords, error: matchError } = await supabaseClient
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (matchError) {
      console.error('Erro ao buscar registros de match:', matchError);
      return [];
    }
    
    if (!matchRecords || matchRecords.length === 0) {
      return [];
    }

    const matchedUserIds = matchRecords.map(record => 
      record.user1_id === userId ? record.user2_id : record.user1_id
    );

    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('id', matchedUserIds);

    if (profileError) {
      console.error('Erro ao buscar perfis dos matches:', profileError);
      return [];
    }
    
    return (profiles as any[]).map(p => ({ ...p, name: p.apelido || p.name })) as UserProfile[];
}


// ================================================
// 📦 Exporta funções Supabase
// ================================================
export const supabase = {
  client: supabaseClient,
  auth: supabaseClient.auth,
  signUp,
  signInForTesting,
  createProfileForNewUser,
  getSwipedUserIds,
  handleSwipeAndCheckForMatch,
  getMatchesForUser,

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', error.message);
      return null;
    }

    if (data) data.name = data.apelido;
    return data as UserProfile;
  },

  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile> & { preferences: UserPreferences },
  ): Promise<UserProfile | null> {
    const dbData: { [key: string]: any } = { ...profileData };
    if (dbData.name) {
      dbData.apelido = dbData.name;
      delete dbData.name;
    }

    const { data, error } = await supabaseClient
      .from('profiles')
      .update(dbData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error.message);
      return null;
    }

    if (data) data.name = data.apelido;
    return data as UserProfile;
  },

  async fetchExploreProfiles(currentUserId: string) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .not('id', 'eq', currentUserId)
      .limit(50);

    if (error) {
      console.error('Erro ao buscar perfis para explorar:', error.message);
      return { data: [], error };
    }

    const mappedData = data.map((p) => ({ ...p, name: p.apelido }));
    return { data: mappedData, error: null };
  },

  async fetchPublicProfiles(limit: number = 8) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('isPubliclySearchable', true)
      .limit(limit);

    if (error) return { data: [], error };

    const mappedData = data.map((p) => ({ ...p, name: p.apelido }));
    return { data: mappedData, error: null };
  },

  async updateUserLocation(
    userId: string,
    coords: { latitude: number; longitude: number },
  ) {
    const { error } = await supabaseClient
      .from('profiles')
      .update({ latitude: coords.latitude, longitude: coords.longitude })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar localização:', error.message);
    }
    return { error };
  },
};