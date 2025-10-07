import React from 'react';
import type { UserProfile } from '../types';

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink-500">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.345 22.345 0 01-2.846-2.434c-.26-.323-.51-.653-.747-.991l-.255-.373a.85.85 0 01-.042-.105A3.01 3.01 0 012 10c0-1.657 1.343-3 3-3a3.01 3.01 0 012.25 1.007A3.01 3.01 0 0112.25 8 3 3 0 0115 11c0 .599-.155 1.164-.43 1.66l-.255-.373a.85.85 0 01-.042-.105c-.237.338-.487.668-.747.991a22.345 22.345 0 01-2.846 2.434 22.045 22.045 0 01-2.582 1.9 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.002z" />
    </svg>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
      <h2 className="text-red-500 font-bold">{label}</h2>
      <p className="mt-1 text-gray-200">{value || 'Não informado'}</p>
    </div>
);

interface MatchProfileViewProps {
    profile: UserProfile;
    onBack: () => void;
}

export const MatchProfileView: React.FC<MatchProfileViewProps> = ({ profile, onBack }) => {
    return (
        <div className="h-full w-full bg-gray-900 text-white flex flex-col">
             <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center p-4 border-b border-gray-700">
                <button onClick={onBack} className="text-gray-300 mr-2 p-2 rounded-full hover:bg-gray-700" aria-label="Voltar para o chat">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold">Perfil de {profile.name}</h1>
            </header>

            <main className="overflow-y-auto pb-24 no-scrollbar">
                <div className="relative">
                    <img src={profile.images?.[0] || 'https://via.placeholder.com/600x800.png?text=Sem+Foto'} alt={profile.name} className="w-full h-80 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 text-sm">
                        <HeartIcon/>
                        {profile.showLikes ? (
                            <span className="text-white font-bold">{profile.numLikes}</span>
                        ) : (
                            <span className="text-gray-300">Curtidas ocultas</span>
                        )}
                    </div>
                </div>
                
                <div className="p-6 -mt-20 relative z-0">
                    <div>
                        <h1 className="text-3xl font-bold">{profile.name}, <span className="font-light">{profile.age}</span></h1>
                        <p className="text-gray-300">{profile.city}, {profile.state}</p>
                    </div>

                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <h2 className="text-red-500 font-bold">Bio</h2>
                        <p className="mt-1 text-gray-200 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                    
                    <div className="mt-6">
                        <h2 className="text-red-500 font-bold">Interesses</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {profile.interests.map(interest => (
                                <span key={interest} className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full">{interest}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-6 border-t border-gray-700 pt-6">
                        <DetailItem label="Objetivo" value={profile.relationshipGoal}/>
                        <DetailItem label="Interesse em" value={profile.interesseEm}/>
                        <DetailItem label="Signo" value={profile.signo}/>
                        <DetailItem label="Religião" value={profile.religiao}/>
                        <DetailItem label="Altura" value={profile.altura ? `${profile.altura} cm` : 'Não informado'}/>
                        <DetailItem label="Corpo" value={profile.porteFisico}/>
                        <DetailItem label="Bebidas" value={profile.consumoAlcool}/>
                        <DetailItem label="Fumo" value={profile.fumante}/>
                        <DetailItem label="Pets" value={profile.pets}/>
                        <DetailItem label="PCD" value={profile.pcd === 'Sim' ? `Sim (${profile.pcdTipo || 'Não especificado'})` : (profile.pcd || 'Não informado')} />
                        <DetailItem label="Idiomas" value={(profile.idiomas || []).join(', ')} />
                    </div>
                </div>
            </main>
        </div>
    );
};
