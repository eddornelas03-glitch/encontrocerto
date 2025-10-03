import React from 'react';
// FIX: The 'View' type is defined in '../types', not '../App'.
import type { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  hasMatches: boolean;
  onLogout: () => void;
}

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A9.75 9.75 0 0110.302 6c-1.148 0-2.223.236-3.22.672A.75.75 0 006 7.322V21a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75V7.322a.75.75 0 00-.834-.672A9.753 9.753 0 0113.698 6c0-1.63.49-3.155 1.336-4.435a.75.75 0 00-.07-1.279z" clipRule="evenodd" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.15 48.901 48.901 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);


export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, hasMatches, onLogout }) => {
    const iconColor = (view: View) => currentView === view ? 'text-pink-500' : 'text-gray-400';

    return (
        <nav className="absolute bottom-0 left-0 right-0 z-20 bg-gray-900/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto h-20 flex justify-around items-center border-t border-gray-700">
                <button onClick={onLogout} className="text-gray-400 transition-colors duration-300 hover:text-pink-500" title="Sair">
                    <LogoutIcon />
                </button>
                {/* FIX: Argument of type '"swipe"' is not assignable to parameter of type 'View'. Changed to 'explore'. */}
                <button onClick={() => setCurrentView('explore')} className={`transition-colors duration-300 ${iconColor('explore')}`} title="Explorar">
                    <FireIcon />
                </button>
                <button onClick={() => setCurrentView('matches')} className={`relative transition-colors duration-300 ${iconColor('matches')}`} title="Matches">
                    <ChatIcon />
                    {hasMatches && <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-pink-500 border-2 border-white"></span>}
                </button>
            </div>
        </nav>
    );
};