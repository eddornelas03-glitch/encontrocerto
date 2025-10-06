import { supabase as supabaseClient } from '@/src/integrations/supabase/client';
import type { UserProfile, UserPreferences, Message } from './types';

// --- Profile Data Mapping ---
// Maps the app's UserProfile object to the Supabase 'profiles' table columns
const mapProfileToDb = (profile: UserProfile) => ({
  nickname: profile.apelido,
  age: profile.age,
  bio: profile.bio,
  city: profile.city,
  state: profile.state,
  interests: profile.interests,
  photos: profile.images,
  relationshipgoal: profile.relationshipGoal,
  height: profile.altura,
  body_type: profile.porteFisico,
  smokes: profile.fumante,
  drinks: profile.consumoAlcool,
  interested_in: profile.interesseEm,
  zodiac_sign: profile.signo,
  religion: profile.religiao,
  pets: profile.pets,
  languages: profile.idiomas,
  disability: profile.pcd,
  disability_type: profile.pcdTipo,
  showlikes: profile.showLikes,
  show_in_public_search: profile.isPubliclySearchable,
  gender: profile.gender,
});

// Maps a row from the Supabase 'profiles' table to the app's UserProfile type
const mapProfileFromDb = (dbProfile: any): UserProfile => ({
  id: dbProfile.id,
  name: dbProfile.nickname, // Using nickname as name
  apelido: dbProfile.nickname,
  age: dbProfile.age,
  bio: dbProfile.bio,
  city: dbProfile.city,
  state: dbProfile.state,
  interests: dbProfile.interests || [],
  images: dbProfile.photos || ['https://picsum.photos/seed/placeholder/600/800'],
  relationshipGoal: dbProfile.relationshipgoal,
  altura: dbProfile.height,
  porteFisico: dbProfile.body_type,
  fumante: dbProfile.smokes,
  consumoAlcool: dbProfile.drinks,
  interesseEm: dbProfile.interested_in,
  signo: dbProfile.zodiac_sign,
  religiao: dbProfile.religion,
  pets: dbProfile.pets,
  idiomas: dbProfile.languages || [],
  pcd: dbProfile.disability,
  pcdTipo: dbProfile.disability_type,
  showLikes: dbProfile.showlikes,
  isPubliclySearchable: dbProfile.show_in_public_search,
  // These fields are calculated client-side
  tagline: '',
  compatibility: 0,
  distanceFromUser: 0,
  diasPreferenciais: [],
  horariosPreferenciais: [],
  numLikes: 0,
  disponibilidade: 'Sem pressa',
  gender: dbProfile.gender || 'Outro',
});

// --- Custom Service Functions ---

const fetchFullUserProfile = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
};

const fetchExploreProfiles = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return { data: [], error: 'Not authenticated' };

  const { data: swipedIdsData, error: swipesError } = await supabaseClient
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', user.id);

  if (swipesError) {
    console.error('Error fetching swipes:', swipesError);
    return { data: [], error: swipesError };
  }

  const swipedIds = swipedIdsData.map((s) => s.swiped_id);
  const idsToExclude = [user.id, ...swipedIds];

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .not('id', 'in', `(${idsToExclude.join(',')})`);

  return { data: data?.map(mapProfileFromDb) || [], error };
};

const fetchPublicProfiles = async (limit: number = 8) => {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('show_in_public_search', true)
    .limit(limit);
  return { data: data?.map(mapProfileFromDb) || [], error };
};

const updateUserProfileAndPreferences = async (
  profile: UserProfile,
  preferences: UserPreferences,
) => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const profileUpdates = mapProfileToDb(profile);
  const preferenceUpdates = { preferences: preferences };

  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ ...profileUpdates, ...preferenceUpdates })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return { error };
  }

  return {
    updatedProfile: mapProfileFromDb(data),
    updatedPreferences: data.preferences,
    error: null,
  };
};

const handleSwipe = async (swipedProfileId: string, liked: boolean) => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return { isMatch: false, error: 'Not authenticated' };

  const { error: swipeError } = await supabaseClient
    .from('swipes')
    .insert({ swiper_id: user.id, swiped_id: swipedProfileId, liked });

  if (swipeError) {
    console.error('Error inserting swipe:', swipeError);
    return { isMatch: false, error: swipeError };
  }

  if (!liked) {
    return { isMatch: false, error: null };
  }

  // Check if the other user liked back
  const { data: matchCheck, error: matchCheckError } = await supabaseClient
    .from('swipes')
    .select('id')
    .eq('swiper_id', swipedProfileId)
    .eq('swiped_id', user.id)
    .eq('liked', true)
    .single();

  if (matchCheckError || !matchCheck) {
    return { isMatch: false, error: null }; // No match or an error occurred
  }

  // It's a match!
  const { error: matchInsertError } = await supabaseClient
    .from('matches')
    .insert({ user1_id: user.id, user2_id: swipedProfileId });

  if (matchInsertError) {
    console.error('Error creating match:', matchInsertError);
    return { isMatch: true, error: matchInsertError }; // It's a match, but failed to save
  }

  return { isMatch: true, error: null };
};

const fetchMatches = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return { data: [], error: 'Not authenticated' };

  const { data: matches, error } = await supabaseClient
    .from('matches')
    .select('*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (error) {
    console.error('Error fetching matches:', error);
    return { data: [], error };
  }

  const profiles = matches.map(match => {
      const otherUser = match.user1.id === user.id ? match.user2 : match.user1;
      return mapProfileFromDb(otherUser);
  });

  return { data: profiles, error: null };
};

const fetchMessagesForMatch = async (matchId: number) => {
    const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
    
    return { data, error };
};

const sendMessage = async (message: Partial<Message>) => {
    const { data, error } = await supabaseClient
        .from('messages')
        .insert(message)
        .select()
        .single();
    return { data, error };
};

const subscribeToMessages = (matchId: number, onNewMessage: (message: Message) => void) => {
    const channel = supabaseClient
        .channel(`messages_${matchId}`)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
            (payload) => {
                onNewMessage(payload.new as Message);
            }
        )
        .subscribe();
    
    return channel;
};


// --- Export the augmented client ---
export const supabase = {
  ...supabaseClient,
  fetchFullUserProfile,
  fetchExploreProfiles,
  fetchPublicProfiles,
  updateUserProfileAndPreferences,
  handleSwipe,
  fetchMatches,
  fetchMessagesForMatch,
  sendMessage,
  subscribeToMessages,
  // Compatibility explanation still uses Gemini, so we keep it
  async getCompatibilityExplanation(profile: UserProfile): Promise<string> {
    // This is a mock, but in a real app it would call a service like Gemini
    return `Vocês dois compartilham um interesse em ${
      profile.interests[0]
    } e ambos buscam um ${profile.relationshipGoal.toLowerCase()}. Isso indica uma ótima base para uma conexão!`;
  },
};