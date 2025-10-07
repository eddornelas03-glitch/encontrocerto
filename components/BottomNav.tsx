import React from 'react';
import { NavLink } from 'react-router-dom';

interface BottomNavProps {
  hasNewMatch: boolean;
  setHasNewMatch: (hasMatch: boolean) => void;
}

const ExploreIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-7 h-7 transition-colors ${
      isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'
    }`}
  >
    <path
      fillRule="evenodd"
      d="M12.963 2.286a.75.75 0 00-1.071 1.052A3.75 3.75 0 0115.75 6H18a.75.75 0 000-1.5h-2.25a2.25 2.25 0 00-2.25-2.25.75.75 0 00-1.052-1.071zM12 6a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM3.75 6A2.25 2.25 0 006 8.25H8.25a.75.75 0 000-1.5H6A3.75 3.75 0 019.75 3h.003a.75.75 0 00.707-1.033A3.75 3.75 0 016.75 1.5a.75.75 0 00-1.49.146A2.25 2.25 0 003.75 6z"
      clipRule="evenodd"
    />
    <path
      d="M12 12.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm0-7.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 5.25zM15.75 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM4.5 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM14.47 15.53a.75.75 0 10-1.06-1.06l-2.12 2.12-2.12-2.12a.75.75 0 00-1.06 1.06l2.12 2.12-2.12 2.12a.75.75 0 101.06 1.06l2.12-2.12 2.12 2.12a.75.75 0 101.06-1.06l-2.12-2.12 2.12-2.12z"
    />
  </svg>
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-7 h-7 transition-colors ${
      isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'
    }`}
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
    className={`w-7 h-7 transition-colors ${
      isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'
    }`}
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
        {views.map(({ path, title, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => {
              if (path === '/matches') {
                setHasNewMatch(false);
              }
            }}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 text-gray-400 group h-full w-full ${
                isActive ? 'text-red-500' : ''
              }`
            }
            title={title}
            data-tour-id={`${path.substring(1)}-nav`}
          >
            {({ isActive }) => (
              <>
                <Icon isActive={isActive} />
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'
                  }`}
                >
                  {title}
                </span>
                {path === '/matches' && hasNewMatch && (
                  <span className="absolute top-3 right-[calc(50%-24px)] block h-3 w-3 rounded-full bg-red-500 border-2 border-gray-900 animate-pulse"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
