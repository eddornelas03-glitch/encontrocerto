import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { supabase as supabaseService, mapProfileFromDb } from '../services/supabaseService';
import { supabase as supabaseClient } from '../src/integrations/supabase/client';
import type { Session, User, UserProfile, UserPreferences } from '../types';

// Default preferences for new or incomplete profiles
const defaultUserPreferences: UserPreferences = {
  distanciaMaxima: 100,
  idadeMinima: 18,
  idadeMaxima: 99,
  alturaMinima: 140,
  alturaMaxima: 220,
  porteFisicoDesejado: ['Indiferente'],
  fumanteDesejado: ['Indiferente'],
  consumoAlcoolDesejado: ['Indiferente'],
  generoDesejado: 'Todos',
  signoDesejado: ['Indiferente'],
  religiaoDesejada: ['Indiferente'],
  petsDesejado: 'Indiferente',
  pcdDesejado: 'Indiferente',
  disponibilidadeDesejada: [],
  nomeDesejado: '',
  objetivoDesejado: ['Indiferente'],
  estadoDesejado: 'Indiferente',
  cidadeDesejada: 'Indiferente',
  enableMessageSuggestions: true,
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseService.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        let profileData = await supabaseService.fetchFullUserProfile(session.user.id);

        // If user is authenticated but has no profile, create a default one
        if (!profileData) {
          console.log(`No profile found for user ${session.user.id}, creating one.`);
          const { data: newProfile, error } = await supabaseClient
            .from('profiles')
            .insert({
              id: session.user.id,
              nickname: session.user.user_metadata.apelido || session.user.email?.split('@')[0] || 'Novo Usuário',
              interested_in: session.user.user_metadata.interested_in || 'Todos',
              // Sensible defaults
              age: 18,
              bio: 'Bem-vindo(a) ao Encontro Certo! Edite seu perfil para começar.',
              city: 'Não informado',
              state: 'XX',
              interests: [],
              photos: [],
              relationshipgoal: 'Não tenho certeza',
              height: 170,
              body_type: 'Prefiro não dizer',
              smokes: 'Prefiro não dizer',
              drinks: 'Prefiro não dizer',
              zodiac_sign: 'Indiferente',
              religion: 'Indiferente',
              pets: 'Não',
              languages: ['Português'],
              disability: 'Prefiro não dizer',
              showlikes: true,
              show_in_public_search: true,
            })
            .select()
            .single();
          
          if (error) {
            console.error("Failed to create profile for existing user:", error);
          } else {
            profileData = newProfile;
          }
        }

        if (profileData) {
          const fullUser: User = {
            id: session.user.id,
            email: session.user.email!,
            profile: mapProfileFromDb(profileData),
            preferences: profileData.preferences || defaultUserPreferences,
          };
          setUser(fullUser);
          setSession({ user: fullUser });
        } else {
          // If profile still doesn't exist (e.g., creation failed), treat as logged out
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabaseService.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    setSession((prevSession) =>
      prevSession ? { ...prevSession, user: updatedUser } : null,
    );
  }, []);

  const value = {
    session,
    user,
    loading,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};