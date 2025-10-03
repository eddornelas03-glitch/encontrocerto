import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile, User, View } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { AdModal } from '../components/AdModal';
import { useAuth } from '../context/AuthContext';

interface ExploreProps {
    onNewMatch: (profile: UserProfile) => void;
    setView: (view: View) => void;
}

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.946 1.55l-.29 1.087a21.531 21.531 0 00-1.683.926l-1.056-.422a1.875 1.875 0 00-2.032.588l-1.405 2.435a1.875 1.875 0 00.588 2.76l.95.694a21.032 21.032 0 000 1.816l-.95.694a1.875 1.875 0 00-.588 2.76l1.405 2.435a1.875 1.875 0 002.032.588l1.056-.422a21.531 21.531 0 001.683.926l.29 1.087c.247.887 1.029 1.55 1.946 1.55h1.844c.917 0 1.699-.663 1.946-1.55l.29-1.087a21.531 21.531 0 001.683-.926l1.056.422a1.875 1.875 0 002.032-.588l1.405-2.435a1.875 1.875 0 00-.588-2.76l-.95-.694a21.032 21.032 0 000-1.816l.95-.694a1.875 1.875 0 00.588-2.76l-1.405-2.435a1.875 1.875 0 00-2.032-.588l-1.056.422a21.531 21.531 0 00-1.683-.926l-.29-1.087a1.875 1.875 0 00-1.946-1.55h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

const filterProfile = (profile: UserProfile, currentUser: User): boolean => {
    const prefs = currentUser.preferences;

    if (currentUser.profile.interesseEm !== 'Todos') {
        if (currentUser.profile.interesseEm === 'Homens' && profile.gender !== 'Homem') return false;
        if (currentUser.profile.interesseEm === 'Mulheres' && profile.gender !== 'Mulher') return false;
    }

    if (profile.age < prefs.idadeMinima || profile.age > prefs.idadeMaxima) return false;
    if (profile.distanceFromUser > prefs.distanciaMaxima) return false;

    if (prefs.fumanteDesejado.length > 0 && !prefs.fumanteDesejado.includes('Indiferente')) {
        // FIX: Explicitly handle 'Prefiro não dizer' to narrow the type for the `.includes` check and prevent a TypeScript error.
        if (profile.fumante === 'Prefiro não dizer') return false;
        if (!prefs.fumanteDesejado.includes(profile.fumante)) return false;
    }

    if (prefs.consumoAlcoolDesejado.length > 0 && !prefs.consumoAlcoolDesejado.includes('Indiferente')) {
        // FIX: Explicitly handle 'Prefiro não dizer' to narrow the type for the `.includes` check and prevent a TypeScript error.
        if (profile.consumoAlcool === 'Prefiro não dizer') return false;
        if (!prefs.consumoAlcoolDesejado.includes(profile.consumoAlcool)) return false;
    }
    
    if (prefs.petsDesejado !== 'Indiferente' && profile.pets !== prefs.petsDesejado) return false;

    return true;
};

const calculateCompatibility = (profile: UserProfile, currentUser: User): number => {
    let score = 0;
    let total = 0;

    const userInterests = new Set(currentUser.profile.interests);
    const profileInterests = new Set(profile.interests);
    const sharedInterests = [...userInterests].filter(i => profileInterests.has(i));
    
    total += 3; // Interests are very important
    score += 3 * (sharedInterests.length / Math.max(1, userInterests.size));

    total++;
    if (profile.relationshipGoal === currentUser.profile.relationshipGoal) score++;
    
    total++;
    // FIX: Check for 'Prefiro não dizer' to avoid a type error with '.includes'.
    if (currentUser.preferences.consumoAlcoolDesejado.includes('Indiferente') || (profile.consumoAlcool !== 'Prefiro não dizer' && currentUser.preferences.consumoAlcoolDesejado.includes(profile.consumoAlcool))) score++;

    total++;
    // FIX: Check for 'Prefiro não dizer' to avoid a type error with '.includes'.
    if (currentUser.preferences.fumanteDesejado.includes('Indiferente') || (profile.fumante !== 'Prefiro não dizer' && currentUser.preferences.fumanteDesejado.includes(profile.fumante))) score++;
    
    total++;
    if (currentUser.preferences.petsDesejado === profile.pets || currentUser.preferences.petsDesejado === 'Indiferente') score++;

    const baseScore = total > 0 ? (score / total) * 100 : 50;
    const finalScore = 50 + (baseScore / 2); // Scale to be between 50 and 100 for better feeling

    return Math.min(99, Math.round(finalScore));
};


export const Explore: React.FC<ExploreProps> = ({ onNewMatch, setView }) => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showAd, setShowAd] = useState(false);

    const loadAndFilterProfiles = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const { data: allProfiles } = await supabase.fetchExploreProfiles();
        if (allProfiles) {
            const filtered = allProfiles.filter(p => filterProfile(p, user));
            const scored = filtered.map(p => ({
                ...p,
                compatibility: calculateCompatibility(p, user)
            })).sort((a, b) => b.compatibility - a.compatibility); // Sort by highest compatibility

            setProfiles(scored);
        }
        
        setCurrentIndex(0);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        loadAndFilterProfiles();
    }, [loadAndFilterProfiles]);

    const handleSwipe = (direction: 'left' | 'right' | 'super') => {
        if (currentIndex >= profiles.length) return;
        
        if (direction === 'super') {
            setShowAd(true);
            return; // Wait for ad to finish
        }

        const currentProfile = profiles[currentIndex];

        // The ProfileCard handles its own animation. We just wait for it to finish
        // before removing it from the DOM by updating the index.
        setTimeout(() => {
            if (direction === 'right') {
                // Simulate a match 40% of the time for compatible profiles
                if (currentProfile.compatibility > 65 && Math.random() < 0.4) {
                    onNewMatch(currentProfile);
                }
            }
            setCurrentIndex(prevIndex => prevIndex + 1);
        }, 300);
    };
    
    const handleAdClose = (watched: boolean) => {
        setShowAd(false);
        if (watched && currentIndex < profiles.length) {
            const currentProfile = profiles[currentIndex];
            // Super likes always result in a match in this mock
            onNewMatch(currentProfile);
            setCurrentIndex(prevIndex => prevIndex + 1);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="flex flex-col justify-center items-center h-full text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
                    <p className="mt-4 text-lg">Filtrando perfis para você...</p>
                 </div>
            );
        }

        if (profiles.length === 0 || currentIndex >= profiles.length) {
             return (
                 <div className="flex flex-col justify-center items-center h-full text-center text-white px-6">
                    <h2 className="text-2xl font-bold">Nenhum perfil encontrado!</h2>
                    <p className="mt-2 text-gray-300">Tente ajustar seus filtros de busca para encontrar mais pessoas.</p>
                     <button onClick={() => setView('edit-profile')} className="mt-6 bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors">
                        Ajustar Filtros
                    </button>
                 </div>
            );
        }

        return profiles.slice(currentIndex).reverse().map((profile, index) => {
            const isTopCard = index === profiles.slice(currentIndex).length - 1;
           return (
               <div key={profile.id}>
                   <ProfileCard
                       profile={profile}
                       onSwipe={handleSwipe}
                       isTopCard={isTopCard}
                   />
               </div>
           );
       });
    }
    
    return (
        <div className="relative w-full h-full flex-grow">
            <header className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Explorar</h1>
                <button onClick={() => setView('edit-profile')} className="text-white p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20" aria-label="Ajustar filtros">
                    <SettingsIcon />
                </button>
            </header>
            {renderContent()}
            {showAd && <AdModal onClose={handleAdClose} />}
        </div>
    );
};