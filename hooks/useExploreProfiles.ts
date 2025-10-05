import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile, User, UserPreferences } from '../types';
import { useAuth } from '../context/AuthContext';

const filterProfile = (profile: UserProfile, currentUser: User): boolean => {
  const prefs = currentUser.preferences;

  if (currentUser.profile.interesseEm !== 'Todos') {
    if (
      currentUser.profile.interesseEm === 'Homens' &&
      profile.gender !== 'Homem'
    )
      return false;
    if (
      currentUser.profile.interesseEm === 'Mulheres' &&
      profile.gender !== 'Mulher'
    )
      return false;
  }

  if (prefs.generoDesejado !== 'Todos') {
    if (prefs.generoDesejado === 'Homens' && profile.gender !== 'Homem')
      return false;
    if (prefs.generoDesejado === 'Mulheres' && profile.gender !== 'Mulher')
      return false;
  }

  if (prefs.nomeDesejado && prefs.nomeDesejado.trim() !== '') {
    if (
      !profile.isPubliclySearchable ||
      !profile.apelido
        .toLowerCase()
        .includes(prefs.nomeDesejado.trim().toLowerCase())
    ) {
      return false;
    }
  }

  if (
    prefs.cidadeDesejada &&
    prefs.cidadeDesejada !== 'Indiferente' &&
    prefs.estadoDesejado &&
    prefs.estadoDesejado !== 'Indiferente'
  ) {
    if (
      profile.city.toLowerCase() !== prefs.cidadeDesejada.toLowerCase() ||
      profile.state.toLowerCase() !== prefs.estadoDesejado.toLowerCase()
    ) {
      return false;
    }
  } else {
    if (profile.distanceFromUser > prefs.distanciaMaxima) return false;
  }

  if (profile.age < prefs.idadeMinima || profile.age > prefs.idadeMaxima)
    return false;
  if (profile.altura < prefs.alturaMinima || profile.altura > prefs.alturaMaxima)
    return false;

  if (
    prefs.objetivoDesejado.length > 0 &&
    !prefs.objetivoDesejado.includes('Indiferente')
  ) {
    if (!prefs.objetivoDesejado.includes(profile.relationshipGoal))
      return false;
  }

  if (
    prefs.fumanteDesejado.length > 0 &&
    !prefs.fumanteDesejado.includes('Indiferente')
  ) {
    if (
      profile.fumante === 'Prefiro não dizer' ||
      !prefs.fumanteDesejado.includes(profile.fumante)
    )
      return false;
  }

  if (
    prefs.consumoAlcoolDesejado.length > 0 &&
    !prefs.consumoAlcoolDesejado.includes('Indiferente')
  ) {
    if (
      profile.consumoAlcool === 'Prefiro não dizer' ||
      !prefs.consumoAlcoolDesejado.includes(profile.consumoAlcool)
    )
      return false;
  }

  if (
    prefs.porteFisicoDesejado.length > 0 &&
    !prefs.porteFisicoDesejado.includes('Indiferente')
  ) {
    if (
      profile.porteFisico === 'Prefiro não dizer' ||
      !prefs.porteFisicoDesejado.includes(profile.porteFisico)
    )
      return false;
  }

  if (prefs.petsDesejado !== 'Indiferente' && profile.pets !== prefs.petsDesejado)
    return false;

  if (prefs.pcdDesejado !== 'Indiferente') {
    if (profile.pcd === 'Prefiro não dizer' || profile.pcd !== prefs.pcdDesejado)
      return false;
  }

  if (
    prefs.signoDesejado.length > 0 &&
    !prefs.signoDesejado.includes('Indiferente') &&
    !prefs.signoDesejado.includes(profile.signo)
  )
    return false;

  if (
    prefs.religiaoDesejada.length > 0 &&
    !prefs.religiaoDesejada.includes('Indiferente') &&
    !prefs.religiaoDesejada.includes(profile.religiao)
  )
    return false;

  return true;
};

const calculateCompatibility = (
  profile: UserProfile,
  currentUser: User,
): number => {
  let score = 0;
  let total = 0;

  const userInterests = new Set(currentUser.profile.interests);
  const profileInterests = new Set(profile.interests);
  const sharedInterests = [...userInterests].filter((i) =>
    profileInterests.has(i),
  );

  total += 3;
  score += 3 * (sharedInterests.length / Math.max(1, userInterests.size));

  total++;
  if (
    currentUser.preferences.objetivoDesejado.length === 0 ||
    currentUser.preferences.objetivoDesejado.includes('Indiferente') ||
    currentUser.preferences.objetivoDesejado.includes(profile.relationshipGoal)
  ) {
    score++;
  }

  total++;
  if (
    currentUser.preferences.consumoAlcoolDesejado.includes('Indiferente') ||
    (profile.consumoAlcool !== 'Prefiro não dizer' &&
      currentUser.preferences.consumoAlcoolDesejado.includes(
        profile.consumoAlcool,
      ))
  )
    score++;

  total++;
  if (
    currentUser.preferences.fumanteDesejado.includes('Indiferente') ||
    (profile.fumante !== 'Prefiro não dizer' &&
      currentUser.preferences.fumanteDesejado.includes(profile.fumante))
  )
    score++;

  total++;
  if (
    currentUser.preferences.petsDesejado === profile.pets ||
    currentUser.preferences.petsDesejado === 'Indiferente'
  )
    score++;

  const baseScore = total > 0 ? (score / total) * 100 : 50;
  const finalScore = 50 + baseScore / 2;

  return Math.min(99, Math.round(finalScore));
};

export const useExploreProfiles = (
  onNewMatch: (profile: UserProfile) => void,
) => {
  const { user, updateUser } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [allAvailableProfiles, setAllAvailableProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadAndFilterProfiles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data: allProfiles } = await supabase.fetchExploreProfiles();
    if (allProfiles) {
      setAllAvailableProfiles(allProfiles);
      const filtered = allProfiles.filter((p) => filterProfile(p, user));
      const scored = filtered
        .map((p) => ({
          ...p,
          compatibility: calculateCompatibility(p, user),
        }))
        .sort((a, b) => b.compatibility - a.compatibility);

      setProfiles(scored);
    }

    setCurrentIndex(0);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadAndFilterProfiles();
  }, [loadAndFilterProfiles]);

  const handleSwipe = useCallback(
    (profile: UserProfile, direction: 'left' | 'right' | 'super') => {
      // The ProfileCard handles its own animation. We just wait for it to finish
      // before removing it from the DOM by updating the index.
      setTimeout(() => {
        if (direction === 'right') {
          // Simulate a match 40% of the time for compatible profiles
          if (profile.compatibility > 65 && Math.random() < 0.4) {
            onNewMatch(profile);
          }
        } else if (direction === 'super') {
          // Super likes always result in a match in this mock
          onNewMatch(profile);
        }
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 400);
    },
    [onNewMatch],
  );

  const handleSaveFilters = (newPreferences: UserPreferences) => {
    if (user) {
      updateUser({ ...user, preferences: newPreferences });
    }
  };

  const currentProfile = profiles[currentIndex];
  const remainingProfiles = profiles.slice(currentIndex);
  const noMoreProfiles = !isLoading && (profiles.length === 0 || currentIndex >= profiles.length);

  return {
    user,
    isLoading,
    currentProfile,
    remainingProfiles,
    noMoreProfiles,
    allAvailableProfiles,
    handleSwipe,
    handleSaveFilters,
  };
};