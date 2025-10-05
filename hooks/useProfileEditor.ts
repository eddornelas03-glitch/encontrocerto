import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserPreferences } from '../types';
import { isTextOffensive, isImageNude } from '../services/geminiService';
import { supabase } from '../services/supabaseService';
import { BRAZILIAN_STATES } from '../data/brazilianLocations';

export const useProfileEditor = (onSaveSuccess: () => void) => {
  const { user, updateUser } = useAuth();

  if (!user) {
    throw new Error('useProfileEditor must be used within an authenticated context');
  }

  const [profile, setProfile] = useState<UserProfile>(user.profile);
  const [preferences, setPreferences] = useState<UserPreferences>(user.preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [bioError, setBioError] = useState('');
  const [imageError, setImageError] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
        const { data } = await supabase.fetchExploreProfiles();
        if (data) {
            setAllProfiles(data);
        }
    };
    fetchProfiles();
  }, []);

  const availableStates = useMemo(() => {
    if (!allProfiles) return [];
    const statesWithUsers = [...new Set(allProfiles.map(p => p.state))];
    return BRAZILIAN_STATES
      .filter(state => statesWithUsers.includes(state.uf))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [allProfiles]);

  const availableCities = useMemo(() => {
      if (preferences.estadoDesejado && preferences.estadoDesejado !== 'Indiferente') {
          return [...new Set(allProfiles
              .filter(p => p.state === preferences.estadoDesejado)
              .map(p => p.city)
          )].sort();
      }
      return [];
  }, [allProfiles, preferences.estadoDesejado]);

  const handleProfileChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;

      if (name === 'pcd') {
        if (value !== 'Sim') {
          setProfile((prev) => ({
            ...prev,
            pcd: value as UserProfile['pcd'],
            pcdTipo: undefined,
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            pcd: 'Sim',
            pcdTipo: prev.pcdTipo || 'Física', // Set default if user selects 'Sim'
          }));
        }
        return;
      }

      const isNumber =
        type === 'number' ||
        ['age', 'altura', 'numLikes'].includes(name);

      setProfile((prev) => ({
        ...prev,
        [name]: isNumber ? Number(value) : value,
      }));
    },
    [],
  );

  const handleCheckboxChange = useCallback((name: keyof UserProfile, checked: boolean) => {
    setProfile(p => ({ ...p, [name]: checked }));
  }, []);

  const handleInterestToggle = useCallback((interest: string) => {
    setProfile((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  }, []);

  const handlePreferenceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      // Handle special cases with cascading updates first
      if (name === 'estadoDesejado') {
        setPreferences((prev) => ({
          ...prev,
          estadoDesejado: value,
          cidadeDesejada: 'Indiferente', // Reset city when state changes
        }));
        return;
      }

      if (name === 'distanciaMaxima') {
        setPreferences((prev) => ({
          ...prev,
          distanciaMaxima: Number(value),
          estadoDesejado: 'Indiferente', // Reset location if distance is used
          cidadeDesejada: 'Indiferente',
        }));
        return;
      }

      // Handle generic case for all other fields
      const isNumber =
        type === 'number' || ['idadeMinima', 'idadeMaxima', 'alturaMinima', 'alturaMaxima'].includes(name);
      const isCheckbox = type === 'checkbox';
      const parsedValue = isCheckbox
        ? (e.target as HTMLInputElement).checked
        : isNumber
        ? Number(value)
        : value;

      setPreferences((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    },
    [],
  );

  const handleMultiSelectPreferenceChange = useCallback(
    (field: keyof UserPreferences, value: string) => {
      setPreferences((prev) => {
        const currentValues = (prev[field] as string[]) || [];
        let newValues: string[];

        if (value === 'Indiferente') {
          newValues = currentValues.includes('Indiferente') ? [] : ['Indiferente'];
        } else {
          const valuesWithoutIndiferente = currentValues.filter(
            (item) => item !== 'Indiferente',
          );
          if (valuesWithoutIndiferente.includes(value)) {
            newValues = valuesWithoutIndiferente.filter((item) => item !== value);
          } else {
            newValues = [...valuesWithoutIndiferente, value];
          }
        }

        if (newValues.length === 0) {
          newValues = ['Indiferente'];
        }
        return { ...prev, [field]: newValues };
      });
    },
    [],
  );
  
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || profile.images.length >= 10) {
        e.target.value = '';
        return;
    }

    setIsAnalyzingImage(true);
    setImageError('');
    try {
        const isNude = await isImageNude(file);
        if (isNude) {
            setImageError('Nudez detectada. Esta foto viola nossas diretrizes e não pode ser enviada.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({
                ...prev,
                images: [...prev.images, reader.result as string]
            }));
        };
        reader.readAsDataURL(file);

    } catch (error) {
        console.error("Image analysis failed", error);
        setImageError("Ocorreu um erro ao analisar a imagem. Tente novamente.");
    } finally {
        setIsAnalyzingImage(false);
        e.target.value = '';
    }
  }, [profile.images.length]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
      setProfile(prev => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== indexToRemove)
      }));
  }, []);


  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setBioError('');

    const isBioOffensive = await isTextOffensive(profile.bio);

    if (isBioOffensive) {
      setBioError(
        'Sua bio viola as diretrizes da comunidade. Por favor, revise o texto.',
      );
      setIsSaving(false);
      return;
    }

    updateUser({ ...user, profile, preferences });
    onSaveSuccess();
    setIsSaving(false);
  }, [isSaving, profile, preferences, updateUser, user, onSaveSuccess]);

  return {
    profile,
    preferences,
    isSaving,
    bioError,
    imageError,
    isAnalyzingImage,
    availableStates,
    availableCities,
    handleProfileChange,
    handleCheckboxChange,
    handleInterestToggle,
    handlePreferenceChange,
    handleMultiSelectPreferenceChange,
    handleImageUpload,
    handleRemoveImage,
    handleSave,
  };
};