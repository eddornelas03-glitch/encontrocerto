import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserPreferences } from '../types';
import { isTextOffensive } from '../services/geminiService';

export const useProfileEditor = (onSaveSuccess: () => void) => {
  const { user, updateUser } = useAuth();

  if (!user) {
    throw new Error('useProfileEditor must be used within an authenticated context');
  }

  const [profile, setProfile] = useState<UserProfile>(user.profile);
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...user.preferences,
    porteFisicoDesejado: ['Indiferente'],
    fumanteDesejado: ['Indiferente'],
    consumoAlcoolDesejado: ['Indiferente'],
    signoDesejado: ['Indiferente'],
    religiaoDesejada: ['Indiferente'],
    petsDesejado: 'Indiferente',
    pcdDesejado: 'Indiferente',
    objetivoDesejado: ['Indiferente'],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [bioError, setBioError] = useState('');

  const handleProfileChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
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
      const isNumber =
        type === 'number' ||
        name.includes('idade') ||
        name.includes('distancia') ||
        name.includes('altura');
        
      setPreferences((prev) => ({
        ...prev,
        [name]: isNumber ? Number(value) : value,
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
  
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.images.length < 10) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({
                ...prev,
                images: [...prev.images, reader.result as string]
            }));
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
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
