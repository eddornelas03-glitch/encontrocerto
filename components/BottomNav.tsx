import React from 'react';
import type { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  hasNewMatch: boolean;
}

const FireIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.23V18a.75.75 0 00.75.75h16.5A.75.75 0 0021 18V7.23zM12 21a.75.75 0 00.75-.75V15a.75.75 0 00-1.5 0v5.25A.75.75 0 0012 21zM9 12.75A.75.75 0 009.75 12h4.5a.75.75 0 000-1.5h-4.5A.75.75 0 009 12.75z" />
    </svg>
);

const ChatIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.15 48.901 48.901 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
    </svg>
);

const UserIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon = ({isActive}: {isActive: boolean}) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
        <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
        <path d="M5.26 17.242a.75.75 0 10-1.06-1.06 7.5 7.5 0 00-1.964 5.344.75.75 0 00.75.75h.001c.49 0 .96-.186 1.32-.517l.041-.041a.75.75 0 00-1.06-1.061l-.041.041a.517.517 0 01-.32.119 6.028 6.028 0 011.64-4.524z" />
    </svg>
);


export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, hasNewMatch }) => {
    
    const views: { name: View, title: string, icon: React.FC<{isActive: boolean}> }[] = [
        { name: 'explore', title: 'Explorar', icon: FireIcon },
        { name: 'matches', title: 'Matches', icon: ChatIcon },
        { name: 'image-generator', title: 'Gerador AI', icon: SparklesIcon },
        { name: 'my-profile', title: 'Meu Perfil', icon: UserIcon },
    ];

    return (
        <nav className="z-20 bg-gray-900/80 backdrop-blur-sm shrink-0">
            <div className="max-w-md mx-auto h-20 flex justify-around items-center border-t border-gray-700">
                {views.map(({ name, title, icon: Icon }) => (
                    <button key={name} onClick={() => setCurrentView(name)} className="relative flex flex-col items-center gap-1 text-gray-400 transition-colors duration-300 hover:text-pink-500" title={title}>
                        <Icon isActive={currentView === name} />
                         <span className={`text-xs ${currentView === name ? 'text-pink-500' : 'text-gray-400'}`}>{title}</span>
                         {name === 'matches' && hasNewMatch && <span className="absolute -top-1 right-1 block h-3 w-3 rounded-full bg-pink-500 border-2 border-white"></span>}
                    </button>
                ))}
            </div>
        </nav>
    );
};