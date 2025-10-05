import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { AdModal } from '../components/AdModal';
import { FilterModal } from '../components/FilterModal';
import { AppTour } from '../components/AppTour';
import { useExploreProfiles } from '../hooks/useExploreProfiles';

interface ExploreProps {
  onNewMatch: (profile: UserProfile) => void;
}

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M19.14,12.74c0.03-0.3,0.06-0.6,0.06-0.91s-0.03-0.61-0.06-0.91l2.11-1.65c0.19-0.15,0.24-0.42,0.12-0.64l-2-3.46c-0.12-0.22-0.39-0.3-0.61-0.22l-2.49,1c-0.52-0.4-1.08-0.73-1.69-0.98l-0.38-2.65C14.17,2.13,13.92,2,13.64,2h-4c-0.27,0-0.52,0.13-0.63,0.36L8.62,5.02C8,5.27,7.44,5.6,6.92,6.01L4.43,5.01C4.21,4.92,3.94,5,3.82,5.22l-2,3.46c-0.12,0.22-0.07,0.49,0.12,0.64l2.11,1.65C4.03,11.3,4,11.61,4,11.92s0.03,0.61,0.06,0.91l-2.11,1.65c-0.19,0.15-0.24,0.42-0.12,0.64l2,3.46c0.12,0.22,0.39,0.3,0.61,0.22l2.49-1c0.52,0.4,1.08,0.73,1.69,0.98l0.38,2.65c0.11,0.23,0.36,0.36,0.63,0.36h4c0.27,0,0.52-0.13,0.63,0.36l0.38-2.65c0.61-0.25,1.17-0.59,1.69-0.98l2.49,1c0.22,0.08,0.49,0,0.61-0.22l2-3.46c0.12-0.22,0.07-0.49-0.12-0.64L19.14,12.74z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S13.93,15.5,12,15.5z" />
  </svg>
);

const TourIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-1.423-2.593-1.852-4.016-.962a.75.75 0 00.706 1.258c.465-.233.996-.034 1.229.431.233.465.034.996-.431 1.229a.75.75 0 00-.706 1.258c1.423.89 3.126.46 4.016-.962a.75.75 0 00-1.258-.706zM12 15.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0v-.008a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export const Explore: React.FC<ExploreProps> = ({ onNewMatch }) => {
  const {
    user,
    isLoading,
    remainingProfiles,
    noMoreProfiles,
    allAvailableProfiles,
    handleSwipe,
    handleSaveFilters,
  } = useExploreProfiles(onNewMatch);

  const [showAd, setShowAd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [keyboardSwipe, setKeyboardSwipe] = useState<
    'left' | 'right' | 'super' | 'reset' | null
  >(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const onSwipe = useCallback(
    (direction: 'left' | 'right' | 'super') => {
      const currentProfile = remainingProfiles[remainingProfiles.length - 1];
      if (!currentProfile) return;

      if (direction === 'super') {
        setShowAd(true);
        return; // Wait for ad to finish
      }

      handleSwipe(currentProfile, direction);
      setKeyboardSwipe(null);
    },
    [remainingProfiles, handleSwipe],
  );

  const handleAdClose = (watched: boolean) => {
    setShowAd(false);
    const currentProfile = remainingProfiles[remainingProfiles.length - 1];
    if (watched && currentProfile) {
      handleSwipe(currentProfile, 'super');
      setKeyboardSwipe(null);
    } else {
      setKeyboardSwipe('reset');
      setTimeout(() => setKeyboardSwipe(null), 400);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        showAd ||
        showFilters ||
        keyboardSwipe ||
        isLoading ||
        noMoreProfiles
      ) {
        return;
      }

      if (e.key === 'ArrowRight') setKeyboardSwipe('right');
      else if (e.key === 'ArrowLeft') setKeyboardSwipe('left');
      else if (e.key === 'ArrowUp') setKeyboardSwipe('super');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAd, showFilters, keyboardSwipe, isLoading, noMoreProfiles]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          <p className="mt-4 text-lg">Filtrando perfis para você...</p>
        </div>
      );
    }

    if (noMoreProfiles) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center text-white px-6">
          <h2 className="text-2xl font-bold">Nenhum perfil encontrado!</h2>
          <p className="mt-2 text-gray-300">
            Tente ajustar seus filtros de busca para encontrar mais pessoas.
          </p>
          <button
            onClick={() => setShowFilters(true)}
            className="mt-6 bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors"
          >
            Ajustar Filtros
          </button>
        </div>
      );
    }

    return (
      <div data-tour-id="explore-card-stack" className="absolute inset-0">
        {remainingProfiles.reverse().map((profile, index) => {
          const isTopCard = index === remainingProfiles.length - 1;
          return (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSwipe={onSwipe}
              isTopCard={isTopCard}
              triggerSwipe={isTopCard ? keyboardSwipe : null}
              currentUserPreferences={user!.preferences}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex-grow">
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Explorar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTourActive(true)}
            className="text-white p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 animate-pulse-glow"
            aria-label="Tour pelo App"
          >
            <TourIcon />
          </button>
          <button
            data-tour-id="explore-filters-btn"
            onClick={() => setShowFilters(true)}
            className="text-white p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20"
            aria-label="Ajustar filtros"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>
      {renderContent()}
      {showAd && <AdModal onClose={handleAdClose} />}
      {showFilters && user && (
        <FilterModal
          key={user.preferences.distanciaMaxima}
          onClose={() => setShowFilters(false)}
          onSave={(prefs) => {
            handleSaveFilters(prefs);
            setShowFilters(false);
          }}
          allProfiles={allAvailableProfiles}
        />
      )}
      {isTourActive && <AppTour onClose={() => setIsTourActive(false)} />}
    </div>
  );
};