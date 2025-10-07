import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { AdModal } from '../components/AdModal';
import { FilterModal } from '../components/FilterModal';
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
    <path
      fillRule="evenodd"
      d="M11.078 2.25c-.917 0-1.699.663-1.946 1.55l-.292.966a.75.75 0 00.231.815l.73 1.02a.75.75 0 01-.23 1.05l-1.096.73a.75.75 0 00-.231.815l.292.966c.247.887 1.029 1.55 1.946 1.55h3.844c.917 0 1.699-.663 1.946-1.55l.292-.966a.75.75 0 00-.231-.815l-.73-1.02a.75.75 0 01.23-1.05l1.096-.73a.75.75 0 00.231-.815l-.292-.966a1.99 1.99 0 00-1.946-1.55h-3.844zM12 8.25a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V9A.75.75 0 0112 8.25z"
      clipRule="evenodd"
    />
    <path
      d="M18.75 9.75a.75.75 0 000-1.5h-.563c-.66-0-1.219-.559-1.219-1.219v-.563a.75.75 0 00-1.5 0v.563c0 .66.559 1.219 1.219 1.219h.563zM5.25 9.75a.75.75 0 010-1.5h.563c.66 0 1.219-.559 1.219-1.219v-.563a.75.75 0 011.5 0v.563c0 .66-.559 1.219-1.219 1.219H5.25z"
    />
    <path
      fillRule="evenodd"
      d="M9 12.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM6.75 15.75a.75.75 0 000-1.5h-.563c-.66 0-1.219.559-1.219 1.219v.563a.75.75 0 001.5 0v-.563c0-.66.559-1.219 1.219-1.219h.563zM18.75 15.75a.75.75 0 000-1.5h-.563c-.66 0-1.219.559-1.219 1.219v.563a.75.75 0 001.5 0v-.563c0-.66.559-1.219 1.219-1.219h.563z"
      clipRule="evenodd"
    />
    <path
      d="M12.75 17.25a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V18a.75.75 0 01.75-.75z"
    />
    <path
      fillRule="evenodd"
      d="M11.078 21.75c-.917 0-1.699-.663-1.946-1.55l-.292-.966a.75.75 0 00-.231-.815l-.73-1.02a.75.75 0 01.23-1.05l1.096-.73a.75.75 0 00.231-.815l-.292-.966a1.99 1.99 0 011.946-1.55h3.844c.917 0 1.699.663 1.946 1.55l.292.966a.75.75 0 00.231.815l.73 1.02a.75.75 0 01-.23 1.05l-1.096.73a.75.75 0 00-.231.815l.292.966c-.247.887-1.029 1.55-1.946 1.55h-3.844z"
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

  const onSwipe = useCallback(
    (direction: 'left' | 'right' | 'super') => {
      const currentProfile = remainingProfiles[0];
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
    const currentProfile = remainingProfiles[0];
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
        {remainingProfiles.map((profile, index) => {
          const isTopCard = index === 0;
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
        }).reverse()}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex-grow bg-gray-900">
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Explorar</h1>
        <div className="flex items-center gap-2">
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
    </div>
  );
};

export default Explore;
