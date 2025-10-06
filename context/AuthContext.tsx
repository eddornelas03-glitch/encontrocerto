import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { supabase, mapProfileFromDb } from '../services/supabaseService';
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profileData = await supabase.fetchFullUserProfile(session.user.id);
        if (profileData) {
          const fullUser: User = {
            id: session.user.id,
            email: session.user.email!,
            profile: mapProfileFromDb(profileData),
            preferences: profileData.preferences || defaultUserPreferences,
          };
          setUser(fullUser);
          setSession({ user: fullUser });
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