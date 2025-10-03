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

const TrophyIcon = ({isActive}: {isActive: boolean}) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
        <path fillRule="evenodd" d="M15.625 1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V3.14l-4.502 4.501a.75.75 0 01-1.06 0L4.75 3.061v2.689a.75.75 0 01-1.5 0V2.25a.75.75 0 01.75-.75h11.625z" clipRule="evenodd" />
        <path d="M3.938 8.719a.75.75 0 01.187 1.05l-1.5 2.25A.75.75 0 011.875 12h1.651a.75.75 0 010 1.5H1.875a.75.75 0 01-.563-1.281l1.5-2.25a.75.75 0 011.126-.188zM20.062 8.719a.75.75 0 00-.187 1.05l1.5 2.25a.75.75 0 00.563.281h1.651a.75.75 0 000-1.5h-1.651a.75.75 0 00-.563 1.281l-1.5-2.25a.75.75 0 00-1.126-.188z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6z" clipRule="evenodd" />
    </svg>
);


export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, hasNewMatch }) => {
    
    const views: { name: View, title: string, icon: React.FC<{isActive: boolean}> }[] = [
        { name: 'explore', title: 'Explorar', icon: FireIcon },
        { name: 'matches', title: 'Matches', icon: ChatIcon },
        { name: 'top-of-week', title: 'Top da Semana', icon: TrophyIcon },
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