import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { UserProfile } from './types';
import { Landing } from './pages/Landing';
import { BottomNav } from './components/BottomNav';
import { MatchModal } from './components/MatchModal';
import { supabase } from './services/supabaseService';

// Lazy load components for code splitting
const Login = lazy(() =>
  import('./components/Login').then((module) => ({ default: module.Login })),
);
const Register = lazy(() =>
  import('./components/Register').then((module) => ({ default: module.Register })),
);
const Explore = lazy(() =>
  import('./pages/Explore').then((module) => ({ default: module.Explore })),
);
const Matches = lazy(() =>
  import('./pages/Matches').then((module) => ({ default: module.Matches })),
);
const MyProfile = lazy(() =>
  import('./pages/MyProfile').then((module) => ({ default: module.MyProfile })),
);
const EditProfile = lazy(() =>
  import('./pages/EditProfile').then((module) => ({
    default: module.EditProfile,
  })),
);

const LoadingFallback: React.FC = () => (
  <div
    className="h-full w-full flex justify-center items-center bg-gray-900"
    role="status"
    aria-label="Carregando conteúdo"
  >
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
  </div>
);

const isProfileComplete = (profile: UserProfile | undefined): boolean => {
  if (!profile) return false;
  return !!profile.gender && !!profile.interesseEm;
};


const App: React.FC = () => {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>(
    'landing',
  );

  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [hasNewMatch, setHasNewMatch] = useState(false);

  useEffect(() => {
    if (user && !isProfileComplete(user.profile)) {
        navigate('/edit-profile');
    }
  }, [user, navigate]);

  const handleNewMatch = useCallback((profile: UserProfile) => {
    setNewMatch(profile);
    setHasNewMatch(true);
  }, []);

  const closeMatchModal = useCallback(() => {
    setNewMatch(null);
  }, []);

  const openChatFromMatch = useCallback(() => {
    if (newMatch) {
      navigate(`/matches/${newMatch.id}`);
    }
    setNewMatch(null);
  }, [newMatch, navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Erro no login com Google:', error);
      alert(
        `Ocorreu um erro ao tentar o login com Google: ${error.message}\n\nPor favor, verifique se o provedor Google está ATIVADO E SALVO no seu painel do Supabase.`,
      );
    }
  };

  const handleTestLogin = async () => {
    await supabase.signInForTesting();
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingFallback />;
    }

    if (!session || !user) {
      let AuthComponent;
      const handleBackToLanding = () => setAuthView('landing');
      switch (authView) {
        case 'login':
          AuthComponent = (
            <Login
              onNavigateToRegister={() => setAuthView('register')}
              onGoogleLogin={handleGoogleLogin}
              onBackToLanding={handleBackToLanding}
            />
          );
          break;
        case 'register':
          AuthComponent = (
            <Register
              onNavigateToLogin={() => setAuthView('login')}
              onGoogleLogin={handleGoogleLogin}
              onBackToLanding={handleBackToLanding}
            />
          );
          break;
        case 'landing':
        default:
          return (
            <Landing
              onNavigateToLogin={() => setAuthView('login')}
              onNavigateToRegister={() => setAuthView('register')}
              onNavigateToTest={handleTestLogin}
            />
          );
      }
      return <Suspense fallback={<LoadingFallback />}>{AuthComponent}</Suspense>;
    }

    // Redirect if profile is incomplete
    if (!isProfileComplete(user.profile) && window.location.hash !== '#/edit-profile') {
        return <Navigate to="/edit-profile" replace />;
    }

    // Logged in user view
    return (
      <div className="h-full w-full flex flex-col bg-gray-900">
        <main className="flex-grow relative overflow-y-auto no-scrollbar">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/explore" element={<Explore onNewMatch={handleNewMatch} />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:matchId" element={<Matches />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="*" element={<Navigate to="/explore" />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav hasNewMatch={hasNewMatch} setHasNewMatch={setHasNewMatch} />
      </div>
    );
  };

  const containerClass = session
    ? 'h-full w-full max-w-md md:max-w-2xl mx-auto relative overflow-hidden shadow-2xl bg-gray-900'
    : 'h-full w-full relative';

  return (
    <div className="h-screen w-screen bg-gray-800 font-sans">
      <div className={containerClass}>
        {renderContent()}
        {newMatch && user && (
          <MatchModal
            onClose={closeMatchModal}
            onSendMessage={openChatFromMatch}
            match={newMatch} 
          />
        )}
      </div>
    </div>
  );
};

export default App;