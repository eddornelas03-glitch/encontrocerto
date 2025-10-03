import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { AdModal } from '../components/AdModal';


interface ExploreProps {
    onNewMatch: (profile: UserProfile) => void;
}

export const Explore: React.FC<ExploreProps> = ({ onNewMatch }) => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | 'super' | null>(null);
    const [showAd, setShowAd] = useState(false);

    const loadProfiles = useCallback(async () => {
        setIsLoading(true);
        const { data } = await supabase.fetchExploreProfiles();
        setProfiles(data || []);
        setCurrentIndex(0);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);

    const handleSwipe = (direction: 'left' | 'right' | 'super') => {
        if (currentIndex >= profiles.length) return;
        
        if (direction === 'super') {
            setShowAd(true);
            return; // Wait for ad to finish
        }

        const currentProfile = profiles[currentIndex];

        setSwipeAnimation(direction);

        setTimeout(() => {
            if (direction === 'right') {
                // Simulate a match 40% of the time
                if (Math.random() < 0.4) {
                    onNewMatch(currentProfile);
                }
            }
            setCurrentIndex(prevIndex => prevIndex + 1);
            setSwipeAnimation(null);
        }, 300);
    };
    
    const handleAdClose = (watched: boolean) => {
        setShowAd(false);
        if (watched && currentIndex < profiles.length) {
            const currentProfile = profiles[currentIndex];
            setSwipeAnimation('super');
             setTimeout(() => {
                // Super likes always result in a match in this mock
                onNewMatch(currentProfile);
                setCurrentIndex(prevIndex => prevIndex + 1);
                setSwipeAnimation(null);
            }, 300);
        }
    };

    if (isLoading && profiles.length === 0) {
        return (
             <div className="flex flex-col justify-center items-center h-full text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
                <p className="mt-4 text-lg">Encontrando perfis para você...</p>
             </div>
        );
    }

    if (currentIndex >= profiles.length) {
         return (
             <div className="flex flex-col justify-center items-center h-full text-center text-white px-4">
                <h2 className="text-2xl font-bold">Por enquanto é só!</h2>
                <p className="mt-2 text-gray-300">Estamos encontrando mais matches em potencial para você. Volte mais tarde!</p>
             </div>
        );
    }
    
    return (
        <div className="relative w-full h-full flex-grow">
            {profiles.slice(currentIndex).reverse().map((profile, index) => {
                 const isTopCard = index === profiles.slice(currentIndex).length - 1;
                 let cardClass = "transition-transform duration-300 ease-in-out";
                 if(isTopCard && swipeAnimation === 'left') {
                    cardClass += ' -translate-x-full -rotate-12 opacity-0';
                 } else if (isTopCard && swipeAnimation === 'right') {
                    cardClass += ' translate-x-full rotate-12 opacity-0';
                 } else if (isTopCard && swipeAnimation === 'super') {
                    cardClass += ' translate-y-[-100%] opacity-0 scale-110';
                 }

                return (
                    <div key={profile.id} className={cardClass}>
                        <ProfileCard
                            profile={profile}
                            onSwipe={handleSwipe}
                            isTopCard={isTopCard}
                        />
                    </div>
                );
            })}
            {showAd && <AdModal onClose={handleAdClose} />}
        </div>
    );
};