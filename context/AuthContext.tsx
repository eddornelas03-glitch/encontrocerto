import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { supabase } from '../services/supabaseService';
import type { Session, User, UserProfile } from '../types';
import { defaultUserPreferences } from '../constants';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: () => {},
  updateUser: async () => {},
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      if (session?.user) {
        let profile = await supabase.getUserProfile(session.user.id);

        // Se o perfil não existir, é um novo usuário OAuth. Crie um perfil para ele.
        if (!profile) {
          profile = await supabase.createProfileForNewUser(session.user);
        }

        if (profile) {
          // 1. Define o usuário imediatamente com os dados de perfil existentes.
          const fullUser: User = {
            id: session.user.id,
            email: session.user.email!,
            profile,
            preferences: profile.preferences || defaultUserPreferences,
          };
          setUser(fullUser);
          setSession({ user: fullUser });

          // 2. Em seguida, tenta obter e atualizar a localização em segundo plano.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;

                // Atualiza o DB em segundo plano
                supabase.updateUserLocation(session.user!.id, {
                  latitude,
                  longitude,
                });

                // Atualiza o estado do contexto para que o app use a localização imediatamente
                setUser((prevUser) => {
                  if (!prevUser) return null;
                  const updatedProfile = {
                    ...prevUser.profile,
                    latitude,
                    longitude,
                  };
                  return {
                    ...prevUser,
                    profile: updatedProfile as UserProfile,
                  };
                });
                setSession((prevSession) => {
                  if (!prevSession) return null;
                  const updatedProfile = {
                    ...prevSession.user.profile,
                    latitude,
                    longitude,
                  };
                  const updatedUser = {
                    ...prevSession.user,
                    profile: updatedProfile as UserProfile,
                  };
                  return { ...prevSession, user: updatedUser };
                });
              },
              (error) => {
                // O app continua funcionando mesmo que o usuário negue a permissão
                console.warn(`Erro ao obter localização: ${error.message}`);
              },
            );
          } else {
            console.warn('Geolocalização não é suportada por este navegador.');
          }
        } else {
          // Caso onde o usuário existe no auth, mas o perfil não e a criação falhou
          console.error(
            `Falha ao buscar ou criar perfil para o usuário ${session.user.id}`,
          );
          await supabase.auth.signOut(); // Desloga o usuário para evitar estado inconsistente
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
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const updateUser = useCallback(async (updatedUser: User) => {
    // Atualiza o estado local imediatamente para responsividade da UI
    setUser(updatedUser);
    setSession((prevSession) =>
      prevSession ? { ...prevSession, user: updatedUser } : null,
    );
    // Persiste as mudanças no Supabase
    await supabase.updateUserProfile(updatedUser.id, {
      ...updatedUser.profile,
      preferences: updatedUser.preferences,
    });
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