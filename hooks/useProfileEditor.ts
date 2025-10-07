import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseService';
import { isTextOffensive, isImageNude } from '../services/geminiService';
import type { UserProfile, UserPreferences } from '../types';
import { BRAZILIAN_STATES, BRAZILIAN_CITIES } from '../data/brazilianLocations';

export const useProfileEditor = (onSaveSuccess: () => void) => {
  const { user, updateUser } = useAuth();

  // Fallback to a default structure if user is somehow null to prevent crashes
  const initialProfile = user?.profile || ({} as UserProfile);
  const initialPrefs = user?.preferences || ({} as UserPreferences);

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [preferences, setPreferences] = useState<UserPreferences>(initialPrefs);
  const [isSaving, setIsSaving] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Location data logic
  const availableStates = useMemo(() => {
    return BRAZILIAN_STATES.sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const availableCities = useMemo(() => {
    if (
      preferences.estadoDesejado &&
      preferences.estadoDesejado !== 'Indiferente'
    ) {
      return BRAZILIAN_CITIES[preferences.estadoDesejado]?.sort() || [];
    }
    return [];
  }, [preferences.estadoDesejado]);

  // Handlers for profile changes
  const handleProfileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const isNumber = ['age', 'altura'].includes(name);
      const parsedValue = isNumber ? Number(value) : value;

      setProfile((p) => ({ ...p, [name]: parsedValue }));

      if (name === 'bio') {
        isTextOffensive(value).then((isOffensive) => {
          setBioError(
            isOffensive
              ? 'Sua bio contém linguagem que viola nossas diretrizes.'
              : null,
          );
        });
      }
    },
    [],
  );

  const handleCheckboxChange = useCallback(
    (name: keyof UserProfile, checked: boolean) => {
      setProfile((p) => ({ ...p, [name]: checked }));
    },
    [],
  );

  const handleInterestToggle = useCallback((interest: string) => {
    setProfile((p) => {
      const newInterests = p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest];
      return { ...p, interests: newInterests };
    });
  }, []);

  // Handlers for preferences changes
  const handlePreferenceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setPreferences((p) => ({ ...p, [name]: checked }));
        return;
      }

      const isNumber = [
        'distanciaMaxima',
        'idadeMinima',
        'idadeMaxima',
        'alturaMinima',
        'alturaMaxima',
      ].includes(name);
      const parsedValue = isNumber ? Number(value) : value;

      setPreferences((p) => {
        const newPrefs = { ...p, [name]: parsedValue };
        if (name === 'estadoDesejado' && value !== 'Indiferente') {
          newPrefs.distanciaMaxima = 500; // Reset distance if state is selected
          newPrefs.cidadeDesejada = 'Indiferente';
        }
        if (name === 'distanciaMaxima') {
          newPrefs.estadoDesejado = 'Indiferente';
          newPrefs.cidadeDesejada = 'Indiferente';
        }
        return newPrefs;
      });
    },
    [],
  );

  const handleMultiSelectPreferenceChange = useCallback(
    (field: keyof UserPreferences, value: string) => {
      setPreferences((prev) => {
        const currentValues = (prev[field] as string[]) || [];
        let newValues: string[];

        if (value === 'Indiferente') {
          newValues = currentValues.includes('Indiferente')
            ? []
            : ['Indiferente'];
        } else {
          const valuesWithoutIndiferente = currentValues.filter(
            (item) => item !== 'Indiferente',
          );
          if (valuesWithoutIndiferente.includes(value)) {
            newValues = valuesWithoutIndiferente.filter(
              (item) => item !== value,
            );
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

  // Image handlers
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageError(null);
      setIsAnalyzingImage(true);

      try {
        const isNude = await isImageNude(file);
        if (isNude) {
          setImageError('Sua foto foi rejeitada por conter conteúdo impróprio.');
          return;
        }

        const { data, error } = await supabase.uploadProfileImage(file);
        if (error || !data) {
          throw error || new Error('Falha no upload da imagem.');
        }

        setProfile((p) => ({ ...p, images: [...p.images, data.publicUrl] }));
      } catch (err) {
        console.error(err);
        setImageError('Ocorreu um erro ao enviar a imagem.');
      } finally {
        setIsAnalyzingImage(false);
        e.target.value = ''; // Reset file input
      }
    },
    [],
  );

  const handleRemoveImage = useCallback(
    async (index: number) => {
      const imageUrl = profile.images[index];
      if (!imageUrl) return;

      // Optimistically update UI
      const originalImages = profile.images;
      const newImages = profile.images.filter((_, i) => i !== index);
      setProfile((p) => ({ ...p, images: newImages }));

      // Call Supabase to delete from storage
      const { error } = await supabase.deleteProfileImage(imageUrl);
      if (error) {
        // Revert UI if deletion fails
        setProfile((p) => ({ ...p, images: originalImages }));
        setImageError('Não foi possível remover a imagem. Tente novamente.');
      }
    },
    [profile.images],
  );

  // Save handler
  const handleSave = useCallback(async () => {
    if (!user || bioError) return;

    setIsSaving(true);
    const {
      updatedProfile,
      updatedPreferences,
      error,
    } = await supabase.updateUserProfileAndPreferences(profile, preferences);

    if (error) {
      console.error('Failed to save profile:', error);
      // Here you might want to show a toast to the user
    } else if (updatedProfile && updatedPreferences) {
      updateUser({ ...user, profile: updatedProfile, preferences: updatedPreferences });
      onSaveSuccess();
    }
    setIsSaving(false);
  }, [user, profile, preferences, bioError, updateUser, onSaveSuccess]);

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