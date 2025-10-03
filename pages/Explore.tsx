import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile, User, View, UserPreferences } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { AdModal } from '../components/AdModal';
import { FilterModal } from '../components/FilterModal';
import { useAuth } from '../context/AuthContext';

interface ExploreProps {
    onNewMatch: (profile: UserProfile) => void;
    setView: (view: View) => void;
}

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.14,12.74c0.03-0.3,0.06-0.6,0.06-0.91s-0.03-0.61-0.06-0.91l2.11-1.65c0.19-0.15,0.24-0.42,0.12-0.64l-2-3.46c-0.12-0.22-0.39-0.3-0.61-0.22l-2.49,1c-0.52-0.4-1.08-0.73-1.69-0.98l-0.38-2.65C14.17,2.13,13.92,2,13.64,2h-4c-0.27,0-0.52,0.13-0.63,0.36L8.62,5.02C8,5.27,7.44,5.6,6.92,6.01L4.43,5.01C4.21,4.92,3.94,5,3.82,5.22l-2,3.46c-0.12,0.22-0.07,0.49,0.12,0.64l2.11,1.65C4.03,11.3,4,11.61,4,11.92s0.03,0.61,0.06,0.91l-2.11,1.65c-0.19,0.15-0.24,0.42-0.12,0.64l2,3.46c0.12,0.22,0.39,0.3,0.61,0.22l2.49-1c0.52,0.4,1.08,0.73,1.69,0.98l0.38,2.65c0.11,0.23,0.36,0.36,0.63,0.36h4c0.27,0,0.52-0.13,0.63-0.36l0.38-2.65c0.61-0.25,1.17-0.59,1.69-0.98l2.49,1c0.22,0.08,0.49,0,0.61-0.22l2-3.46c0.12-0.22,0.07-0.49-0.12-0.64L19.14,12.74z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S13.93,15.5,12,15.5z"/>
    </svg>
);

const filterProfile = (profile: UserProfile, currentUser: User): boolean => {
    const prefs = currentUser.preferences;

    // Filter by who the current user is interested in (from their own profile)
    if (currentUser.profile.interesseEm !== 'Todos') {
        if (currentUser.profile.interesseEm === 'Homens' && profile.gender !== 'Homem') return false;
        if (currentUser.profile.interesseEm === 'Mulheres' && profile.gender !== 'Mulher') return false;
    }
    
    // Filter by the desired gender preference from filters
    if (prefs.generoDesejado !== 'Todos') {
        if (prefs.generoDesejado === 'Homens' && profile.gender !== 'Homem') return false;
        if (prefs.generoDesejado === 'Mulheres' && profile.gender !== 'Mulher') return false;
    }

    // Name search (only works for public profiles)
    if (prefs.nomeDesejado && prefs.nomeDesejado.trim() !== '') {
        if (!profile.isPubliclySearchable || !profile.apelido.toLowerCase().includes(prefs.nomeDesejado.trim().toLowerCase())) {
            return false;
        }
    }

    if (profile.age < prefs.idadeMinima || profile.age > prefs.idadeMaxima) return false;
    if (profile.distanceFromUser > prefs.distanciaMaxima) return false;
    if (profile.altura < prefs.alturaMinima || profile.altura > prefs.alturaMaxima) return false;

    if (prefs.fumanteDesejado.length > 0 && !prefs.fumanteDesejado.includes('Indiferente')) {
        if (profile.fumante === 'Prefiro não dizer' || !prefs.fumanteDesejado.includes(profile.fumante)) return false;
    }

    if (prefs.consumoAlcoolDesejado.length > 0 && !prefs.consumoAlcoolDesejado.includes('Indiferente')) {
        if (profile.consumoAlcool === 'Prefiro não dizer' || !prefs.consumoAlcoolDesejado.includes(profile.consumoAlcool)) return false;
    }
    
    if (prefs.porteFisicoDesejado.length > 0 && !prefs.porteFisicoDesejado.includes('Indiferente')) {
        if (profile.porteFisico === 'Prefiro não dizer' || !prefs.porteFisicoDesejado.includes(profile.porteFisico)) return false;
    }
    
    if (prefs.petsDesejado !== 'Indiferente' && profile.pets !== prefs.petsDesejado) return false;

    if (prefs.signoDesejado.length > 0 && !prefs.signoDesejado.includes('Indiferente') && !prefs.signoDesejado.includes(profile.signo)) return false;

    if (prefs.religiaoDesejada.length > 0 && !prefs.religiaoDesejada.includes('Indiferente') && !prefs.religiaoDesejada.includes(profile.religiao)) return false;

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
    const { user, updateUser } = useAuth();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showAd, setShowAd] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [keyboardSwipe, setKeyboardSwipe] = useState<'left' | 'right' | 'super' | 'reset' | null>(null);

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

    const handleSwipe = useCallback((direction: 'left' | 'right' | 'super') => {
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
            setKeyboardSwipe(null);
        }, 400);
    }, [currentIndex, onNewMatch, profiles]);
    
    const handleAdClose = (watched: boolean) => {
        setShowAd(false);
        if (watched && currentIndex < profiles.length) {
            const currentProfile = profiles[currentIndex];
            // Super likes always result in a match in this mock
            onNewMatch(currentProfile);
             setTimeout(() => {
                setCurrentIndex(prevIndex => prevIndex + 1);
                setKeyboardSwipe(null);
            }, 400);
        } else {
            // Ad was cancelled, trigger a reset animation on the card
            setKeyboardSwipe('reset');
            // After animation, clear the trigger state
            setTimeout(() => setKeyboardSwipe(null), 400);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent actions if a modal is open, loading, or another swipe is in progress
            if (showAd || showFilters || keyboardSwipe || isLoading || currentIndex >= profiles.length) {
                return;
            }

            if (e.key === 'ArrowRight') {
                setKeyboardSwipe('right');
            } else if (e.key === 'ArrowLeft') {
                setKeyboardSwipe('left');
            } else if (e.key === 'ArrowUp') {
                setKeyboardSwipe('super');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showAd, showFilters, keyboardSwipe, isLoading, currentIndex, profiles.length]);


    const handleSaveFilters = (newPreferences: UserPreferences) => {
        if (user) {
            updateUser({ ...user, preferences: newPreferences });
        }
        setShowFilters(false);
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
                     <button onClick={() => setShowFilters(true)} className="mt-6 bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors">
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
                       triggerSwipe={isTopCard ? keyboardSwipe : null}
                       currentUserPreferences={user!.preferences}
                   />
               </div>
           );
       });
    }
    
    return (
        <div className="relative w-full h-full flex-grow">
            <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Explorar</h1>
                <button onClick={() => setShowFilters(true)} className="text-white p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20" aria-label="Ajustar filtros">
                    <SettingsIcon />
                </button>
            </header>
            {renderContent()}
            {showAd && <AdModal onClose={handleAdClose} />}
            {showFilters && user && <FilterModal key={user.preferences.distanciaMaxima} onClose={() => setShowFilters(false)} onSave={handleSaveFilters} />}
        </div>
    );
};