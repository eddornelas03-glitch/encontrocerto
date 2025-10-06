import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserPreferences } from '../types';
import { isTextOffensive, isImageNude } from '../services/geminiService';
import { supabase } from '../services/supabaseService';
import { BRAZILIAN_STATES } from '../data/brazilianLocations';
import { useToast } from '../context/ToastContext';

export const useProfileEditor = (onSaveSuccess: () => void) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

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
        const { data } = await supabase.fetchPublicProfiles(100); // Fetch a good number for location filtering
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
    
    const uploadFile = async () => {
        const { data, error } = await supabase.uploadProfileImage(file);
        if (error || !data) {
            console.error("Image upload failed", error);
            setImageError("Ocorreu um erro ao enviar a imagem. Tente novamente.");
        } else {
            setProfile(prev => ({
                ...prev,
                images: [...prev.images, data.publicUrl]
            }));
        }
    };

    try {
        const isNude = await isImageNude(file);
        if (isNude) {
            setImageError('Imagem não permitida. Escolha uma foto apropriada.');
        } else {
            await uploadFile();
        }
    } catch (error) {
        // This catch block handles technical failures from isImageNude.
        // As requested, we log the error and proceed with the upload.
        console.warn("A verificação da imagem falhou, mas o upload será permitido:", error);
        await uploadFile();
    } finally {
        setIsAnalyzingImage(false);
        e.target.value = '';
    }
  }, [profile.images.length]);

  const handleRemoveImage = useCallback(async (indexToRemove: number) => {
      const imageUrl = profile.images[indexToRemove];
      
      setProfile(prev => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== indexToRemove)
      }));

      try {
          await supabase.deleteProfileImage(imageUrl);
      } catch (error) {
          console.error("Failed to delete image from storage:", error);
          showToast('Erro ao remover a foto do armazenamento.', 'error');
      }
  }, [profile.images, showToast]);


  const handleSave = useCallback(async () => {
    if (isSaving || !user) return;
    setIsSaving(true);
    setBioError('');

    const isBioOffensive = await isTextOffensive(profile.bio);

    if (isBioOffensive) {
      setBioError(
        'Sua bio viola as diretrizes da comunidade. Por favor, revise o texto.',
      );
      showToast('Sua bio contém texto ofensivo.', 'error');
      setIsSaving(false);
      return;
    }

    const { error, updatedProfile, updatedPreferences } = await supabase.updateUserProfileAndPreferences(profile, preferences);

    if (error) {
        console.error("Failed to save profile", error);
        showToast('Erro ao salvar o perfil. Tente novamente.', 'error');
    } else if (updatedProfile && updatedPreferences) {
        updateUser({ ...user, profile: updatedProfile, preferences: updatedPreferences });
        showToast('Perfil salvo com sucesso!', 'success');
        onSaveSuccess();
    }
    
    setIsSaving(false);
  }, [isSaving, profile, preferences, updateUser, user, onSaveSuccess, showToast]);

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