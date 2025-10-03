import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile } from '../types';

interface LandingProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-green-500">
        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.23V18a.75.75 0 00.75.75h16.5A.75.75 0 0021 18V7.23zM12 21a.75.75 0 00.75-.75V15a.75.75 0 00-1.5 0v5.25A.75.75 0 0012 21zM9 12.75A.75.75 0 009.75 12h4.5a.75.75 0 000-1.5h-4.5A.75.75 0 009 12.75z" />
    </svg>
);

export const Landing: React.FC<LandingProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [nameQuery, setNameQuery] = useState('');
    const [distance, setDistance] = useState(50);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        const { data } = await supabase.searchPublicProfiles({ name: nameQuery, distance });
        setProfiles(data || []);
        setLoading(false);
    };

    return (
        <div className="h-full w-full text-white bg-gray-900 overflow-y-auto">
            <header className="py-12 px-6 text-center">
                <div className="flex justify-center items-center mb-4">
                    <FireIcon />
                </div>
                <h1 className="text-4xl font-bold">Encontro Certo</h1>
                <p className="text-lg text-gray-300 mt-2 max-w-md mx-auto">Encontre o amor da sua vida. Conexões reais para relacionamentos duradouros.</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={onNavigateToRegister} className="bg-pink-500 font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors">
                        Criar Meu Perfil Grátis
                    </button>
                    <button onClick={onNavigateToLogin} className="bg-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                        Entrar na Minha Conta
                    </button>
                </div>
            </header>
            
            <main className="px-4 pb-24">
                 <h2 className="text-2xl font-bold text-center mb-6">Explore alguns perfis</h2>

                 <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" 
                            placeholder="Buscar por nome..."
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
                            className="w-full sm:flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                        />
                         <button 
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-pink-500 font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors flex-shrink-0 disabled:opacity-50"
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                     <div>
                        <label htmlFor="distance" className="block text-center text-gray-300 text-sm font-medium mb-2">
                            Até <span className="font-bold text-pink-400">{distance} km</span> de distância
                        </label>
                        <input
                            id="distance"
                            type="range"
                            min="1"
                            max="200"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                    </div>
                </form>

                 {loading ? (
                    <div className="text-center text-gray-400 py-8">Buscando perfis...</div>
                 ) : hasSearched ? (
                     profiles.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {profiles.map(profile => (
                                <div key={profile.id} className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer" onClick={onNavigateToLogin}>
                                    <img src={profile.images[0]} alt={profile.apelido} className="w-full h-full object-cover"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                                        <h3 className="font-bold text-white">{profile.apelido}, {profile.age}</h3>
                                        <p className="text-gray-300 text-xs">{profile.distanceFromUser} km de distância</p>
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-semibold">Ver Perfil</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center text-gray-400 py-8">
                            <p>Nenhum perfil encontrado com esses critérios.</p>
                            <p className="text-sm mt-1">Tente ajustar sua busca.</p>
                        </div>
                     )
                 ) : (
                    <div className="text-center text-gray-500 py-8">
                        <p>Use a busca para encontrar perfis públicos.</p>
                    </div>
                 )}
            </main>
        </div>
    );
};