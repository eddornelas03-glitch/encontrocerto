export interface UserPreferences {
  distanciaMaxima: number; // in km
  idadeMinima: number;
  idadeMaxima: number;
  alturaMinima: number; // in cm
  alturaMaxima: number; // in cm
  porteFisicoDesejado: ('Atlético' | 'Normal' | 'Robusto' | 'Indiferente')[];
  fumanteDesejado: ('Não' | 'Socialmente' | 'Sim' | 'Indiferente')[];
  consumoAlcoolDesejado: ('Não bebo' | 'Socialmente' | 'Frequentemente' | 'Indiferente')[];
  generoDesejado: ('Homens' | 'Mulheres' | 'Todos');
  signoDesejado: string[]; // Array of zodiac signs, or empty for any
  religiaoDesejada: string[]; // Array of religions, or empty for any
  petsDesejado: ('Sim' | 'Não' | 'Indiferente');
  disponibilidadeDesejada: string[]; // Array of availabilities, or empty for any
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

  altura: number; // in cm
  porteFisico: 'Atlético' | 'Normal' | 'Robusto' | 'Prefiro não dizer';
  fumante: 'Não' | 'Socialmente' | 'Sim' | 'Prefiro não dizer';
  consumoAlcool: 'Não bebo' | 'Socialmente' | 'Frequentemente' | 'Prefiro não dizer';
  interesseEm: 'Homens' | 'Mulheres' | 'Todos';
  diasPreferenciais: ('Dias de semana' | 'Fim de semana')[];
  horariosPreferenciais: ('Manhã' | 'Tarde' | 'Noite')[];
  numLikes: number;
  
  // New fields from user prompt
  signo: string;
  religiao: string;
  pets: 'Sim' | 'Não';
  idiomas: string[];
  disponibilidade: 'Hoje' | 'Essa semana' | 'Online por enquanto' | 'Sem pressa';
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

export type View = 'landing' | 'login' | 'register' | 'explore' | 'matches' | 'chat' | 'my-profile' | 'edit-profile' | 'image-generator';