import type { UserProfile, User, Session, UserPreferences } from '../types';

// --- MOCK DATABASE ---
const createMockProfiles = (count: number): UserProfile[] => {
  const goals: UserProfile['relationshipGoal'][] = [
    'Relacionamento sério',
    'Algo casual',
    'Amizade',
    'Não tenho certeza',
  ];
  const names = [
    ['Ana', 'Mulher'],
    ['Carlos', 'Homem'],
    ['Mariana', 'Mulher'],
    ['Pedro', 'Homem'],
    ['Juliana', 'Mulher'],
    ['Lucas', 'Homem'],
    ['Fernanda', 'Mulher'],
    ['Rafael', 'Homem'],
    ['Beatriz', 'Mulher'],
    ['Thiago', 'Homem'],
  ];
  const cities = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Salvador, BA',
    'Curitiba, PR',
  ];
  const taglines = [
    'Vivendo um dia de cada vez.',
    'Em busca de boas histórias.',
    'Apaixonado(a) por viagens e café.',
    'Música e amigos são tudo.',
  ];
  const interests = [
    [['Praia', 'Cinema', 'Cozinhar']],
    [['Trilhas', 'Fotografia', 'Rock']],
    [['Leitura', 'Yoga', 'Vinho']],
    [['Games', 'Séries', 'Pizza']],
  ];
  const portes: UserProfile['porteFisico'][] = [
    'Atlético',
    'Normal',
    'Robusto',
    'Prefiro não dizer',
  ];
  const fuma: UserProfile['fumante'][] = [
    'Não',
    'Socialmente',
    'Sim',
    'Prefiro não dizer',
  ];
  const bebe: UserProfile['consumoAlcool'][] = [
    'Não bebe',
    'Socialmente',
    'Frequentemente',
    'Prefiro não dizer',
  ];
  const signos = [
    'Áries',
    'Touro',
    'Gêmeos',
    'Câncer',
    'Leão',
    'Virgem',
    'Libra',
    'Escorpião',
    'Sagitário',
    'Capricórnio',
    'Aquário',
    'Peixes',
  ];
  const religioes = [
    'Católica',
    'Evangélica',
    'Espírita',
    'Ateu(a)',
    'Agnóstico(a)',
    'Outra',
  ];
  const pets: UserProfile['pets'][] = ['Sim', 'Não'];
  const idiomas = [
    ['Português'],
    ['Português', 'Inglês'],
    ['Português', 'Espanhol'],
  ];
  const disponibilidades: UserProfile['disponibilidade'][] = [
    'Hoje',
    'Essa semana',
    'Online por enquanto',
    'Sem pressa',
  ];
  const pcds: UserProfile['pcd'][] = [
    'Não',
    'Não',
    'Não',
    'Não',
    'Sim',
    'Prefiro não dizer',
  ];
  const pcdTipos: NonNullable<UserProfile['pcdTipo']>[] = [
    'Física',
    'Mental',
    'Ambas',
    'Prefiro não dizer',
  ];

  return Array.from({ length: count }, (_, i) => {
    const [name, gender] = names[i % names.length];
    const pcdValue = pcds[i % pcds.length];

    const profile: UserProfile = {
      id: i + 2, // Start user IDs from 2
      name: name,
      apelido: name,
      age: 22 + (i % 15),
      city: cities[i % cities.length].split(', ')[0],
      state: cities[i % cities.length].split(', ')[1],
      tagline: taglines[i % taglines.length],
      bio: `Olá! Sou ${name}, uma pessoa tranquila que adora ${
        interests[i % interests.length][0]
      }. Buscando alguém com bom humor e que goste de conversar. Vamos tomar um café?`,
      interests: interests[i % interests.length][0],
      images: Array.from(
        { length: 3 },
        (_, j) => `https://picsum.photos/seed/${i + 2 + j}/600/800`,
      ),
      gender: gender as UserProfile['gender'],
      relationshipGoal: goals[i % goals.length],
      compatibility: 70 + (i % 30),
      isPubliclySearchable: Math.random() > 0.3,
      showLikes: Math.random() > 0.5,
      distanceFromUser: Math.floor(Math.random() * 199) + 2, // Random distance from 2 to 200 km
      altura: 160 + (i % 35),
      porteFisico: portes[i % portes.length],
      fumante: fuma[i % fuma.length],
      consumoAlcool: bebe[i % bebe.length],
      interesseEm: gender === 'Homem' ? 'Mulheres' : 'Homens',
      diasPreferenciais:
        i % 2 === 0 ? ['Fim de semana'] : ['Dias de semana', 'Fim de semana'],
      horariosPreferenciais: i % 3 === 0 ? ['Noite'] : ['Tarde', 'Noite'],
      numLikes: Math.floor(Math.random() * 500),
      signo: signos[i % signos.length],
      religiao: religioes[i % religioes.length],
      pets: pets[i % pets.length],
      idiomas: idiomas[i % idiomas.length],
      disponibilidade: disponibilidades[i % disponibilidades.length],
      pcd: pcdValue,
    };

    if (pcdValue === 'Sim') {
      profile.pcdTipo = pcdTipos[i % pcdTipos.length];
    }

    return profile;
  });
};

const mockProfiles = createMockProfiles(50);

const defaultUserPreferences: UserPreferences = {
  distanciaMaxima: 100,
  idadeMinima: 25,
  idadeMaxima: 35,
  alturaMinima: 165,
  alturaMaxima: 190,
  porteFisicoDesejado: ['Normal', 'Atlético'],
  fumanteDesejado: ['Não', 'Indiferente'],
  consumoAlcoolDesejado: ['Socialmente', 'Não bebe', 'Indiferente'],
  generoDesejado: 'Todos',
  signoDesejado: [],
  religiaoDesejada: [],
  petsDesejado: 'Indiferente',
  pcdDesejado: 'Indiferente',
  disponibilidadeDesejada: [],
  nomeDesejado: '',
  objetivoDesejado: ['Indiferente'],
  estadoDesejado: 'Indiferente',
  cidadeDesejada: 'Indiferente',
  enableMessageSuggestions: true,
};

const defaultUser: User = {
  id: 1,
  email: 'usuario@exemplo.com',
  profile: {
    id: 1,
    name: 'Alex',
    apelido: 'Alex',
    age: 28,
    city: 'São Paulo',
    state: 'SP',
    tagline: 'Explorador urbano e amante de livros.',
    bio: 'Trabalho com design e nas horas vagas gosto de explorar a cidade, encontrar novos restaurantes e ler um bom livro no parque.',
    interests: ['Design', 'Leitura', 'Gastronomia', 'Viagens'],
    images: [
      'https://picsum.photos/seed/my-profile/600/800',
      'https://picsum.photos/seed/my-profile-2/600/800',
    ],
    gender: 'Outro',
    relationshipGoal: 'Relacionamento sério',
    compatibility: 100,
    isPubliclySearchable: true,
    showLikes: true,
    distanceFromUser: 0,
    altura: 178,
    porteFisico: 'Normal',
    fumante: 'Não',
    consumoAlcool: 'Socialmente',
    interesseEm: 'Todos',
    diasPreferenciais: ['Fim de semana'],
    horariosPreferenciais: ['Noite'],
    numLikes: 258,
    signo: 'Virgem',
    religiao: 'Agnóstico(a)',
    pets: 'Não',
    idiomas: ['Português', 'Inglês'],
    disponibilidade: 'Essa semana',
    pcd: 'Não',
  },
  preferences: defaultUserPreferences,
};

let currentUser: User | null = null;
let mockSession: Session | null = null;
let authStateChangeCallback:
  | ((event: string, session: Session | null) => void)
  | null = null;

// --- END MOCK DATABASE ---

// --- MOCK SERVICE ---
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const supabase = {
  auth: {
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password?: string;
      options?: { data?: { [key: string]: any } };
    }) {
      await delay(500);
      const newUserId = Date.now();
      const newUser: User = {
        id: newUserId,
        email: email,
        profile: {
          id: newUserId,
          name: options?.data?.apelido || 'Novo Usuário',
          apelido: options?.data?.apelido || 'Novo Usuário',
          age: 25,
          city: 'Indefinida',
          state: 'XX',
          tagline: 'Pronto(a) para novas conexões!',
          bio: 'Acabei de chegar no Encontro Certo!',
          interests: ['Conversar', 'Música'],
          images: [`https://picsum.photos/seed/${newUserId}/600/800`],
          gender: 'Outro',
          relationshipGoal: 'Não tenho certeza',
          compatibility: 100,
          isPubliclySearchable: true,
          showLikes: true,
          distanceFromUser: 0,
          altura: 170,
          porteFisico: 'Prefiro não dizer',
          fumante: 'Prefiro não dizer',
          consumoAlcool: 'Prefiro não dizer',
          interesseEm: 'Todos',
          diasPreferenciais: [],
          horariosPreferenciais: [],
          numLikes: 0,
          signo: 'Indiferente',
          religiao: 'Indiferente',
          pets: 'Não',
          idiomas: ['Português'],
          disponibilidade: 'Sem pressa',
          pcd: 'Prefiro não dizer',
        },
        preferences: {
          ...defaultUserPreferences,
        },
      };

      // Simulates email verification is now required.
      return { data: { session: null, user: newUser }, error: null };
    },
    async signInWithPassword({ email, password }) {
      await delay(500);
      // In a real app, you'd find the user by email/password. Here we just log in the default user.
      currentUser = defaultUser;
      mockSession = { user: currentUser };
      if (authStateChangeCallback) {
        authStateChangeCallback('SIGNED_IN', mockSession);
      }
      return { data: { session: mockSession }, error: null };
    },
    async signInForTesting() {
      await delay(300); // Simulate a quick login
      currentUser = defaultUser;
      mockSession = { user: currentUser };
      if (authStateChangeCallback) {
        authStateChangeCallback('SIGNED_IN', mockSession);
      }
      return { data: { session: mockSession }, error: null };
    },
    async signInWithOAuth({ provider }: { provider: 'google' }) {
      console.log(
        `Simulating login with provider: ${provider}. In a real app, you would be redirected.`,
      );
      await delay(100);

      currentUser = defaultUser;
      mockSession = { user: currentUser };

      if (authStateChangeCallback) {
        authStateChangeCallback('SIGNED_IN', mockSession);
      }

      return { data: { session: mockSession }, error: null };
    },
    async signOut() {
      await delay(200);
      currentUser = null;
      mockSession = null;
      if (authStateChangeCallback) {
        authStateChangeCallback('SIGNED_OUT', null);
      }
    },
    onAuthStateChange(
      callback: (event: string, session: Session | null) => void,
    ): { data: { subscription: any } } {
      authStateChangeCallback = callback;
      // Immediately invoke with current state
      setTimeout(() => callback('INITIAL_SESSION', mockSession), 100);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authStateChangeCallback = null;
            },
          },
        },
      };
    },
  },

  async fetchPublicProfiles(limit: number = 8) {
    await delay(700);
    return {
      data: mockProfiles.filter((p) => p.isPubliclySearchable).slice(0, limit),
      error: null,
    };
  },

  async searchPublicProfiles({
    name,
    distance,
  }: {
    name?: string;
    distance?: number;
  }) {
    await delay(400);
    let results = mockProfiles.filter((p) => p.isPubliclySearchable);

    if (name && name.trim() !== '') {
      const lowerCaseName = name.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerCaseName) ||
          p.apelido.toLowerCase().includes(lowerCaseName),
      );
    }

    if (distance) {
      results = results.filter((p) => p.distanceFromUser <= distance);
    }

    return { data: results, error: null };
  },

  async fetchExploreProfiles() {
    await delay(1000);
    // Return profiles other than the current user
    return {
      data: mockProfiles.filter((p) => p.id !== currentUser?.id),
      error: null,
    };
  },

  async getCompatibilityExplanation(profile: UserProfile): Promise<string> {
    await delay(300);
    return `Vocês dois compartilham um interesse em ${
      profile.interests[0]
    } e ambos buscam um ${profile.relationshipGoal.toLowerCase()}. Isso indica uma ótima base para uma conexão!`;
  },

  async getTopOfWeek() {
    await delay(600);
    return {
      data: [...mockProfiles]
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 5),
      error: null,
    };
  },
};
