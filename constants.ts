import type { UserProfile, UserPreferences } from './types';

export const REPORT_REASONS = [
  'Comportamento Ofensivo',
  'Perfil Falso / Catfish',
  'Spam ou Golpes',
  'Conteúdo Inapropriado',
  'Menor de idade',
  'Outro',
];

export const ALL_INTERESTS = [
  'Viagens',
  'Música',
  'Cinema',
  'Cozinhar',
  'Esportes',
  'Leitura',
  'Tecnologia',
  'Arte',
  'Fotografia',
  'Natureza',
];

export const SIGNOS = [
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
  'Indiferente',
];

export const RELIGIOES = [
  'Católica',
  'Evangélica',
  'Espírita',
  'Ateu(a)',
  'Agnóstico(a)',
  'Outra',
  'Indiferente',
];

export const FUMANTE_OPTIONS: UserProfile['fumante'][] = [
  'Não',
  'Socialmente',
  'Sim',
  'Prefiro não dizer',
];

export const CONSUMO_ALCOOL_OPTIONS: UserProfile['consumoAlcool'][] = [
  'Não bebe',
  'Socialmente',
  'Frequentemente',
  'Prefiro não dizer',
];

export const OBJETIVO_OPTIONS: UserPreferences['objetivoDesejado'] = [
  'Relacionamento sério',
  'Algo casual',
  'Amizade',
  'Não tenho certeza',
  'Indiferente',
];

export const PORTE_FISICO_OPTIONS: UserPreferences['porteFisicoDesejado'] = [
  'Atlético',
  'Normal',
  'Robusto',
  'Indiferente',
];

export const PREF_FUMANTE_OPTIONS: UserPreferences['fumanteDesejado'] = [
  'Não',
  'Socialmente',
  'Sim',
  'Indiferente',
];

export const PREF_CONSUMO_ALCOOL_OPTIONS: UserPreferences['consumoAlcoolDesejado'] =
  ['Não bebe', 'Socialmente', 'Frequentemente', 'Indiferente'];
