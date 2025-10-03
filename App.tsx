import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import type { UserProfile, View } from './types';
import { Landing } from './pages/Landing';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Explore } from './pages/Explore';
import { Matches } from './pages/Matches';
import { MyProfile } from './pages/MyProfile';
import { EditProfile } from './pages/EditProfile';
import { TopOfWeek } from './pages/TopOfWeek';
import { BottomNav } from './components/BottomNav';
import { MatchModal } from './components/MatchModal';
import { supabase } from './services/supabaseService';

const App: React.FC = () => {
    const { session, user, loading, updateUser } = useAuth();
    const [view, setView] = useState<View>('explore');
    const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
    
    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
    const [hasNewMatch, setHasNewMatch] = useState(false);

    useEffect(() => {
        // Mock fetching initial matches for logged in user
        if (session) {
            const fetchInitialMatches = async () => {
                // In a real app, you'd fetch this from your backend
                const { data } = await supabase.fetchPublicProfiles(3);
                if (data) {
                    setMatches(data);
                }
            };
            fetchInitialMatches();
        }
    }, [session]);
    
    const handleNewMatch = (profile: UserProfile) => {
        setMatches(prev => [profile, ...prev]);
        setNewMatch(profile);
        setHasNewMatch(true);
    };

    const closeMatchModal = () => {
        setNewMatch(null);
    };

    const openChatFromMatch = () => {
        setNewMatch(null);
        setView('matches');
        // The Matches component will handle navigating to the chat window
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="h-full w-full flex justify-center items-center bg-gray-900">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            );
        }

        if (!session || !user) {
            switch (authView) {
                case 'login':
                    return <Login onNavigateToRegister={() => setAuthView('register')} />;
                case 'register':
                    return <Register onNavigateToLogin={() => setAuthView('login')} />;
                case 'landing':
                default:
                    return <Landing onNavigateToLogin={() => setAuthView('login')} onNavigateToRegister={() => setAuthView('register')} />;
            }
        }

        // Logged in user view
        let ComponentToRender;
        switch (view) {
            case 'explore':
                ComponentToRender = <Explore onNewMatch={handleNewMatch} />;
                break;
            case 'matches':
            case 'chat':
                ComponentToRender = <Matches initialMatches={matches} currentView={view} setView={setView} />;
                if (view === 'matches') setHasNewMatch(false); // Clear notification when viewing matches list
                break;
            case 'my-profile':
                ComponentToRender = <MyProfile setView={setView} />;
                break;
            case 'edit-profile':
                ComponentToRender = <EditProfile onCancel={() => setView('my-profile')} onSave={() => {
                    // This is where you would persist data and then switch the view
                    setView('my-profile');
                }}/>;
                break;
            case 'top-of-week':
                ComponentToRender = <TopOfWeek />;
                break;
            default:
                ComponentToRender = <Explore onNewMatch={handleNewMatch} />;
        }
        
        return (
            <div className="h-full w-full flex flex-col bg-gray-900">
                <main className="flex-grow relative overflow-y-auto">
                    {ComponentToRender}
                </main>
                <BottomNav currentView={view} setCurrentView={setView} hasNewMatch={hasNewMatch} />
            </div>
        );
    };

    return (
        <div className="h-screen w-screen bg-gray-900 font-sans">
            <div className="h-full w-full max-w-md mx-auto relative overflow-hidden shadow-2xl">
                {renderContent()}
                {newMatch && user && (
                    <MatchModal 
                        match={newMatch} 
                        currentUserImage={user.profile.images[0]}
                        onClose={closeMatchModal} 
                        onSendMessage={openChatFromMatch}
                    />
                )}
            </div>
        </div>
    );
};

export default App;