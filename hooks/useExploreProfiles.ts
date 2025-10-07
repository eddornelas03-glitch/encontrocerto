import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile, User, UserPreferences } from '../types';
import { useAuth } from '../context/AuthContext';

/**
 * Calcula a distância em quilômetros entre duas coordenadas geográficas usando a fórmula de Haversine.
 * @param coords1 Coordenadas do primeiro ponto { lat, lon }.
 * @param coords2 Coordenadas do segundo ponto { lat, lon }.
 * @returns A distância em quilômetros.
 */
const haversineDistance = (
  coords1: { lat: number; lon: number },
  coords2: { lat: number; lon: number },
): number => {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
  const dLon = (coords2.lon - coords1.lon) * (Math.PI / 180);
  const lat1 = coords1.lat * (Math.PI / 180);
  const lat2 = coords2.lat * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const filterProfile = (profile: UserProfile, currentUser: User): boolean => {
  const prefs = currentUser.preferences;

  // --- START: Mutual Interest & Orientation Check ---
  // A base de qualquer match: o interesse precisa ser mútuo.
  const myGender = currentUser.profile.gender;
  const myOrientation = currentUser.profile.interesseEm;
  const mySearchFilter = prefs.generoDesejado;

  const theirGender = profile.gender;
  const theirOrientation = profile.interesseEm;

  // Se alguma informação crucial de orientação estiver faltando, o perfil não pode ser compatível.
  if (!myGender || !myOrientation || !theirGender || !theirOrientation) {
      return false;
  }

  // 1. A orientação DELES precisa ser compatível com o MEU gênero.
  if (theirOrientation !== 'Todos') {
    if (theirOrientation === 'Homens' && myGender !== 'Homem') return false;
    if (theirOrientation === 'Mulheres' && myGender !== 'Mulher') return false;
  }

  // 2. A MINHA orientação precisa ser compatível com o gênero DELES.
  if (myOrientation !== 'Todos') {
    if (myOrientation === 'Homens' && theirGender !== 'Homem') return false;
    if (myOrientation === 'Mulheres' && theirGender !== 'Mulher') return false;
  }

  // 3. O MEU FILTRO DE BUSCA ATUAL precisa ser compatível com o gênero DELES.
  if (mySearchFilter !== 'Todos') {
    if (mySearchFilter === 'Homens' && theirGender !== 'Homem') return false;
    if (mySearchFilter === 'Mulheres' && theirGender !== 'Mulher') return false;
  }
  // --- END: Mutual Interest & Orientation Check ---

  if (prefs.nomeDesejado && prefs.nomeDesejado.trim() !== '') {
    if (
      !profile.isPubliclySearchable ||
      !profile.name.toLowerCase().includes(prefs.nomeDesejado.toLowerCase())
    ) {
      return false;
    }
  }

  // Location filter - City/State takes precedence over distance
  if (prefs.estadoDesejado && prefs.estadoDesejado !== 'Indiferente') {
    if (profile.state !== prefs.estadoDesejado) return false;
    if (
      prefs.cidadeDesejada &&
      prefs.cidadeDesejada !== 'Indiferente' &&
      profile.city !== prefs.cidadeDesejada
    ) {
      return false;
    }
  } else if (isFinite(profile.distanceFromUser) && profile.distanceFromUser > prefs.distanciaMaxima) {
    return false;
  }

  if (profile.age < prefs.idadeMinima || profile.age > prefs.idadeMaxima)
    return false;
  if (
    profile.altura < prefs.alturaMinima ||
    profile.altura > prefs.alturaMaxima
  )
    return false;

  if (
    profile.relationshipGoal &&
    !prefs.objetivoDesejado.includes('Indiferente') &&
    !prefs.objetivoDesejado.includes(profile.relationshipGoal)
  )
    return false;
  if (
    profile.porteFisico &&
    !prefs.porteFisicoDesejado.includes('Indiferente') &&
    profile.porteFisico !== 'Prefiro não dizer' &&
    !prefs.porteFisicoDesejado.includes(profile.porteFisico)
  )
    return false;
  if (
    profile.fumante &&
    !prefs.fumanteDesejado.includes('Indiferente') &&
    profile.fumante !== 'Prefiro não dizer' &&
    !prefs.fumanteDesejado.includes(profile.fumante)
  )
    return false;
  if (
    profile.consumoAlcool &&
    !prefs.consumoAlcoolDesejado.includes('Indiferente') &&
    profile.consumoAlcool !== 'Prefiro não dizer' &&
    !prefs.consumoAlcoolDesejado.includes(profile.consumoAlcool)
  )
    return false;
  if (
    profile.signo &&
    !prefs.signoDesejado.includes('Indiferente') &&
    !prefs.signoDesejado.includes(profile.signo)
  )
    return false;
  if (
    profile.religiao &&
    !prefs.religiaoDesejada.includes('Indiferente') &&
    !prefs.religiaoDesejada.includes(profile.religiao)
  )
    return false;

  if (
    profile.pets &&
    prefs.petsDesejado !== 'Indiferente' &&
    profile.pets !== prefs.petsDesejado
  )
    return false;
  if (
    profile.pcd &&
    prefs.pcdDesejado !== 'Indiferente' &&
    profile.pcd !== 'Prefiro não dizer' &&
    profile.pcd !== prefs.pcdDesejado
  )
    return false;

  return true;
};

export const useExploreProfiles = (
  onNewMatch: (profile: UserProfile) => void,
) => {
  const { user, updateUser } = useAuth();
  const [allAvailableProfiles, setAllAvailableProfiles] = useState<
    UserProfile[]
  >([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [remainingProfiles, setRemainingProfiles] = useState<UserProfile[]>([]);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch all profiles and user's past swipes
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const fetchData = async () => {
      const [{ data: profilesData }, swipedUserIds] = await Promise.all([
        supabase.fetchExploreProfiles(user.id),
        supabase.getSwipedUserIds(user.id),
      ]);

      const myCoords =
        user.profile.latitude && user.profile.longitude
          ? { lat: user.profile.latitude, lon: user.profile.longitude }
          : null;

      const profilesWithDistance = (
        (profilesData as UserProfile[]) || []
      ).map((profile) => {
        const theirCoords =
          profile.latitude && profile.longitude
            ? { lat: profile.latitude, lon: profile.longitude }
            : null;

        let distanceFromUser = Infinity;
        if (myCoords && theirCoords) {
          distanceFromUser = haversineDistance(myCoords, theirCoords);
        }

        return { ...profile, distanceFromUser };
      });

      setAllAvailableProfiles(profilesWithDistance);
      setSwipedIds(new Set(swipedUserIds));
    };

    fetchData();
  }, [user]);

  // 2. Filter profiles whenever all profiles are loaded or user preferences change
  useEffect(() => {
    if (!user) return;

    const newFiltered = allAvailableProfiles.filter((p) =>
      filterProfile(p, user),
    );
    setFilteredProfiles(newFiltered);
  }, [allAvailableProfiles, user]);

  // 3. Update the visible stack of cards when filtered profiles or swiped IDs change
  useEffect(() => {
    const unswiped = filteredProfiles.filter((p) => !swipedIds.has(p.id));
    setRemainingProfiles(unswiped);
    if (allAvailableProfiles.length > 0) {
      setIsLoading(false);
    }
  }, [filteredProfiles, swipedIds, allAvailableProfiles]);

  const handleSwipe = useCallback(
    async (profile: UserProfile, swipeType: 'left' | 'right' | 'super') => {
      if (!user) return;

      const direction = swipeType === 'left' ? 'dislike' : 'like'; // Super is also a 'like'
      const { is_match, profile: matchedProfile } =
        await supabase.handleSwipeAndCheckForMatch(
          user.id,
          profile.id,
          direction,
        );

      if (is_match && matchedProfile) {
        onNewMatch(matchedProfile);
      }

      setSwipedIds((prev) => new Set(prev).add(profile.id));
    },
    [user, onNewMatch],
  );

  const handleSaveFilters = useCallback(
    (newPreferences: UserPreferences) => {
      if (!user) return;
      setIsLoading(true);
      const updatedUser = { ...user, preferences: newPreferences };
      updateUser(updatedUser);
    },
    [user, updateUser],
  );

  return {
    user,
    isLoading,
    remainingProfiles,
    noMoreProfiles: !isLoading && remainingProfiles.length === 0,
    allAvailableProfiles,
    handleSwipe,
    handleSaveFilters,
  };
};