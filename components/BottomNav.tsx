import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  hasNewMatch: boolean;
  setHasNewMatch: (hasMatch: boolean) => void;
}

const ExploreIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={`w-8 h-8 ${isActive ? 'text-red-500' : 'text-gray-400'}`}
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="currentColor"
    />
    <path
      d="M8.5 12C9.87827 9.83333 10.5674 8.75 12 7C13.4326 8.75 14.1217 9.83333 15.5 12"
      stroke={isActive ? 'white' : '#111827'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="7" r="1.5" fill={isActive ? 'white' : '#111827'} />
  </svg>
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-7 h-7 ${isActive ? 'text-red-500' : 'text-gray-400'}`}
  >
    <path
      fillRule="evenodd"
      d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.15 48.901 48.901 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z"
      clipRule="evenodd"
    />
  </svg>
);

const UserIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-7 h-7 ${isActive ? 'text-red-500' : 'text-gray-400'}`}
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
      clipRule="evenodd"
    />
  </svg>
);

export const BottomNav: React.FC<BottomNavProps> = ({
  hasNewMatch,
  setHasNewMatch,
}) => {
  const location = useLocation();
  const views: {
    path: string;
    title: string;
    icon: React.FC<{ isActive: boolean }>;
  }[] = [
    { path: '/explore', title: 'Explorar', icon: ExploreIcon },
    { path: '/matches', title: 'Matches', icon: ChatIcon },
    { path: '/my-profile', title: 'Meu Perfil', icon: UserIcon },
  ];

  return (
    <nav className="z-20 bg-gray-900/80 backdrop-blur-sm shrink-0">
      <div className="w-full h-20 flex justify-around items-center border-t border-gray-700">
        {views.map(({ path, title, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={() => {
                if (path === '/matches') {
                  setHasNewMatch(false);
                }
              }}
              className="relative flex flex-col items-center gap-1 text-gray-400 transition-colors duration-300 hover:text-red-500"
              title={title}
              data-tour-id={`${path.substring(1)}-nav`}
            >
              <Icon isActive={isActive} />
              <span
                className={`text-xs ${
                  isActive ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {title}
              </span>
              {path === '/matches' && hasNewMatch && (
                <span className="absolute -top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
