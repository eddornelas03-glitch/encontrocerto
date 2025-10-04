import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import type { UserProfile, View } from './types';
import { Landing } from './pages/Landing';
import { BottomNav } from './components/BottomNav';
import { MatchModal } from './components/MatchModal';
import { supabase } from './services/supabaseService';
import { CookieConsent } from './components/CookieConsent';

// Lazy load components for code splitting
const Login = lazy(() =>
  import('./components/Login').then((module) => ({ default: module.Login })),
);
const Register = lazy(() =>
  import('./components/Register').then((module) => ({ default: module.Register })),
);
const FakeGoogleLogin = lazy(() =>
  import('./pages/FakeGoogleLogin').then((module) => ({
    default: module.FakeGoogleLogin,
  })),
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
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
  </div>
);

const App: React.FC = () => {
  const { session, user, loading } = useAuth();
  const [view, setView] = useState<View>('explore');
  const [authView, setAuthView] = useState<
    'landing' | 'login' | 'register' | 'google-login'
  >('landing');

  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [hasNewMatch, setHasNewMatch] = useState(false);
  const [matchToChat, setMatchToChat] = useState<UserProfile | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (
    choice: 'accepted' | 'declined' | 'customized',
  ) => {
    localStorage.setItem('cookieConsent', choice);
    setShowCookieConsent(false);
    if (choice === 'customized') {
      console.log('User chose to customize cookie settings.');
    }
  };

  const onChatOpened = useCallback(() => {
    setMatchToChat(null);
  }, []);

  useEffect(() => {
    if (session) {
      const fetchInitialMatches = async () => {
        const { data } = await supabase.fetchPublicProfiles(3);
        if (data) {
          setMatches(data);
        }
      };
      fetchInitialMatches();
    }
  }, [session]);

  useEffect(() => {
    if (view === 'matches') {
      setHasNewMatch(false);
    }
  }, [view]);

  const handleNewMatch = useCallback((profile: UserProfile) => {
    setMatches((prev) => [profile, ...prev]);
    setNewMatch(profile);
    setHasNewMatch(true);
  }, []);

  const closeMatchModal = useCallback(() => {
    setNewMatch(null);
  }, []);

  const openChatFromMatch = useCallback(() => {
    if (newMatch) {
      setMatchToChat(newMatch);
      setView('chat');
    }
    setNewMatch(null);
  }, [newMatch]);

  const handleGoogleLoginSuccess = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleTestLogin = async () => {
    await supabase.auth.signInForTesting();
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingFallback />;
    }

    if (!session || !user) {
      let AuthComponent;
      const handleBackToLanding = () => setAuthView('landing');
      switch (authView) {
        case 'google-login':
          AuthComponent = <FakeGoogleLogin onSuccess={handleGoogleLoginSuccess} />;
          break;
        case 'login':
          AuthComponent = (
            <Login
              onNavigateToRegister={() => setAuthView('register')}
              onNavigateToGoogleLogin={() => setAuthView('google-login')}
              onBackToLanding={handleBackToLanding}
            />
          );
          break;
        case 'register':
          AuthComponent = (
            <Register
              onNavigateToLogin={() => setAuthView('login')}
              onNavigateToGoogleLogin={() => setAuthView('google-login')}
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

    // Logged in user view
    let ComponentToRender;
    switch (view) {
      case 'explore':
        ComponentToRender = <Explore onNewMatch={handleNewMatch} setView={setView} />;
        break;
      case 'matches':
      case 'chat':
        ComponentToRender = (
          <Matches
            initialMatches={matches}
            currentView={view}
            setView={setView}
            matchToChat={matchToChat}
            onChatOpened={onChatOpened}
          />
        );
        break;
      case 'my-profile':
        ComponentToRender = <MyProfile setView={setView} />;
        break;
      case 'edit-profile':
        ComponentToRender = (
          <EditProfile
            onCancel={() => setView('my-profile')}
            onSave={() => {
              setView('my-profile');
            }}
          />
        );
        break;
      default:
        ComponentToRender = <Explore onNewMatch={handleNewMatch} setView={setView} />;
    }

    return (
      <div className="h-full w-full flex flex-col bg-gray-900">
        <main className="flex-grow relative overflow-y-auto">
          <Suspense fallback={<LoadingFallback />}>{ComponentToRender}</Suspense>
        </main>
        <BottomNav
          currentView={view}
          setCurrentView={setView}
          hasNewMatch={hasNewMatch}
        />
      </div>
    );
  };

  const containerClass = session
    ? 'h-full w-full max-w-md md:max-w-2xl mx-auto relative overflow-hidden shadow-2xl'
    : 'h-full w-full relative';

  return (
    <div className="h-screen w-screen bg-gray-900 font-sans">
      <div className={containerClass}>
        {renderContent()}
        {newMatch && user && (
          <MatchModal
            match={newMatch}
            currentUserImage={user.profile.images[0]}
            onClose={closeMatchModal}
            onSendMessage={openChatFromMatch}
          />
        )}
        {showCookieConsent && <CookieConsent onConsent={handleConsent} />}
      </div>
    </div>
  );
};

export default App;
