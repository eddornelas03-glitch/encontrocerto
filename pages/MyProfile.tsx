import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MyProfileProps {}

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25-1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5 text-red-400"
  >
    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.345 22.345 0 01-2.846-2.434c-.26-.323-.51-.653-.747-.991l-.255-.373a.85.85 0 01-.042-.105A3.01 3.01 0 012 10c0-1.657 1.343-3 3-3a3.01 3.01 0 012.25 1.007A3.01 3.01 0 0112.25 8 3 3 0 0115 11c0 .599-.155 1.164-.43 1.66l-.255-.373a.85.85 0 01-.042-.105c-.237.338-.487.668-.747.991a22.345 22.345 0 01-2.846 2.434 22.045 22.045 0 01-2.582 1.9 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.002z" />
  </svg>
);

const PreferenceItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <h2 className="text-red-500 font-bold">{label}</h2>
    <p className="mt-1 text-gray-200">{value}</p>
  </div>
);

export const MyProfile: React.FC<MyProfileProps> = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="p-4 text-white">Usuário não encontrado.</div>;
  }

  const { profile, preferences } = user;

  const formatArrayPreference = (arr: string[] | undefined) => {
    if (!arr || arr.length === 0 || arr.includes('Indiferente')) {
      return 'Indiferente';
    }
    return arr.join(', ');
  };

  return (
    <div className="h-full w-full bg-gray-900 text-white overflow-y-auto pb-24">
      <div className="relative">
        <img
          src={profile.images[0]}
          alt={profile.name}
          className="w-full h-80 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 text-sm">
          <HeartIcon />
          {profile.showLikes ? (
            <span className="text-white font-bold">{profile.numLikes}</span>
          ) : (
            <span className="text-gray-300">Curtidas ocultas</span>
          )}
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-gray-900 -mt-20 pt-4">
        <div className="flex justify-between items-end p-6 pt-0">
          <div>
            <h1 className="text-3xl font-bold text-red-500">
              {profile.apelido}, <span className="font-light">{profile.age}</span>
            </h1>
            <p className="text-gray-300">
              {profile.city}, {profile.state}
            </p>
          </div>
          <button
            onClick={() => navigate('/edit-profile')}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors font-semibold py-2 px-4 rounded-full flex items-center gap-2"
          >
            <EditIcon /> Editar
          </button>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h2 className="text-red-500 font-bold">Bio</h2>
          <p className="mt-1 text-gray-200 whitespace-pre-wrap">{profile.bio}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-red-500 font-bold">Interesses</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="bg-gray-600 text-gray-200 text-sm font-medium px-3 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-6 border-t border-gray-700 pt-6">
          <div>
            <h2 className="text-red-500 font-bold">Objetivo</h2>
            <p className="mt-1 text-gray-200">{profile.relationshipGoal}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Interesse em</h2>
            <p className="mt-1 text-gray-200">{profile.interesseEm}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Signo</h2>
            <p className="mt-1 text-gray-200">{profile.signo}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Religião</h2>
            <p className="mt-1 text-gray-200">{profile.religiao}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Altura</h2>
            <p className="mt-1 text-gray-200">{profile.altura} cm</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Corpo</h2>
            <p className="mt-1 text-gray-200">{profile.porteFisico}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Bebidas</h2>
            <p className="mt-1 text-gray-200">{profile.consumoAlcool}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Fumo</h2>
            <p className="mt-1 text-gray-200">{profile.fumante}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Pets</h2>
            <p className="mt-1 text-gray-200">{profile.pets}</p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">PCD</h2>
            <p className="mt-1 text-gray-200">
              {profile.pcd === 'Sim' ? `Sim (${profile.pcdTipo})` : profile.pcd}
            </p>
          </div>
          <div>
            <h2 className="text-red-500 font-bold">Idiomas</h2>
            <p className="mt-1 text-gray-200">{profile.idiomas.join(', ')}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-6">
          <h2 className="text-red-500 font-bold text-lg mb-4">Privacidade</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-200">Aparecer em buscas públicas</p>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  profile.isPubliclySearchable
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {profile.isPubliclySearchable ? 'Ativado' : 'Desativado'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-200">Mostrar número de curtidas</p>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  profile.showLikes
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {profile.showLikes ? 'Ativado' : 'Desativado'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-6">
          <h2 className="text-red-500 font-bold text-lg mb-4">
            Preferências para o Par Perfeito
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <PreferenceItem
              label="Gênero"
              value={preferences.generoDesejado}
            />
            <PreferenceItem
              label="Faixa de Idade"
              value={`${preferences.idadeMinima} - ${preferences.idadeMaxima} anos`}
            />
            <PreferenceItem
              label="Busca por Objetivo"
              value={formatArrayPreference(preferences.objetivoDesejado)}
            />
            <PreferenceItem
              label="Localização Desejada"
              value={
                preferences.cidadeDesejada &&
                preferences.cidadeDesejada !== 'Indiferente' ? (
                  `${preferences.cidadeDesejada}, ${preferences.estadoDesejado}`
                ) : (
                  <span>
                    Até{' '}
                    <span className="font-semibold">
                      {preferences.distanciaMaxima} km
                    </span>
                  </span>
                )
              }
            />
            <PreferenceItem
              label="Faixa de Altura"
              value={`${preferences.alturaMinima} - ${preferences.alturaMaxima} cm`}
            />
            <PreferenceItem
              label="Porte Físico"
              value={formatArrayPreference(preferences.porteFisicoDesejado)}
            />
            <PreferenceItem
              label="Hábito de Fumar"
              value={formatArrayPreference(preferences.fumanteDesejado)}
            />
            <PreferenceItem
              label="Consumo de Álcool"
              value={formatArrayPreference(preferences.consumoAlcoolDesejado)}
            />
            <PreferenceItem label="Tem Pets?" value={preferences.petsDesejado} />
            <PreferenceItem label="PCD" value={preferences.pcdDesejado} />
            <PreferenceItem
              label="Signo"
              value={formatArrayPreference(preferences.signoDesejado)}
            />
            <PreferenceItem
              label="Religião"
              value={formatArrayPreference(preferences.religiaoDesejada)}
            />
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6">
          <button
            onClick={signOut}
            className="w-full bg-red-800/50 text-red-300 font-bold py-3 px-4 rounded-lg hover:bg-red-800/80 transition-colors duration-300"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};
