export interface UserPreferences {
  distanciaMaxima: number; // in km
  idadeMinima: number;
  idadeMaxima: number;
  alturaMinima: number; // in cm
  alturaMaxima: number; // in cm
  porteFisicoDesejado: ('Atlético' | 'Normal' | 'Robusto')[];
  fumanteDesejado: ('Não' | 'Socialmente' | 'Sim')[];
  consumoAlcoolDesejado: ('Não bebo' | 'Socialmente' | 'Frequentemente')[];
}

export interface UserProfile {
  id: number;
  name: string;
  apelido: string;
  age: number;
  city: string;
  state: string;
  tagline: string;
  bio: string;
  interests: string[];
  images: string[];
  gender: 'Homem' | 'Mulher' | 'Outro';
  relationshipGoal: 'Relacionamento sério' | 'Algo casual' | 'Amizade' | 'Não tenho certeza';
  compatibility: number; // Percentage
  isPubliclySearchable: boolean;
  showLikes: boolean;
  distanceFromUser: number; // in kilometers

  // New fields
  altura: number; // in cm
  porteFisico: 'Atlético' | 'Normal' | 'Robusto' | 'Prefiro não dizer';
  fumante: 'Não' | 'Socialmente' | 'Sim' | 'Prefiro não dizer';
  consumoAlcool: 'Não bebo' | 'Socialmente' | 'Frequentemente' | 'Prefiro não dizer';
  interesseEm: 'Homens' | 'Mulheres' | 'Todos';
  diasPreferenciais: ('Dias de semana' | 'Fim de semana')[];
  horariosPreferenciais: ('Manhã' | 'Tarde' | 'Noite')[];
  numLikes: number;
}

export interface Message {
    id: number;
    senderId: number | 'system';
    text: string;
    timestamp: string;
}

export interface Meeting {
    id: number;
    proposerId: number;
    proposedToId: number;
    suggestedDate: string;
    suggestedTime: string;
    location?: string;
    status: 'pending' | 'confirmed' | 'declined';
}

export interface User {
    id: number;
    email: string;
    profile: UserProfile;
    preferences: UserPreferences;
}

export interface Session {
    user: User;
    // In a real scenario, this would contain tokens
}

export type View = 'landing' | 'login' | 'register' | 'explore' | 'matches' | 'chat' | 'my-profile' | 'top-of-week' | 'edit-profile';