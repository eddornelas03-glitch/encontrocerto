import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile } from '../types';
import { LandingHeader } from '../components/LandingHeader';
import { PolicyModal } from '../components/PolicyModal';
import { policyContent } from '../data/policyContent';
import { supabase } from '../services/supabaseService';
import { mockProfiles } from '../data/mockProfiles';

interface LandingProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToTest: () => void;
}

const BackgroundProfileCard: React.FC<{
  profile: UserProfile;
  className?: string;
}> = ({ profile, className }) => (
  <div
    className={`relative w-full aspect-[3/4] bg-gray-700 rounded-2xl shadow-xl overflow-hidden ${className}`}
  >
    <img
      src={profile.images?.[0] || `https://picsum.photos/seed/${profile.id}/600/800`}
      alt={profile.name}
      className="w-full h-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>
    <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
      <h1 className="text-lg font-bold">
        {profile.name}, <span className="font-light">{profile.age}</span>
      </h1>
    </div>
  </div>
);

const Logo = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mb-4"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
    <path d="M8.5 12C9.87827 9.83333 10.5674 8.75 12 7C13.4326 8.75 14.1217 9.83333 15.5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="1.5" fill="white"/>
  </svg>
);

export const Landing: React.FC<LandingProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToTest,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [numColumns, setNumColumns] = useState(window.innerWidth < 640 ? 3 : 5);

  useEffect(() => {
    const handleResize = () => {
      setNumColumns(window.innerWidth < 640 ? 3 : 5);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      // Apenas perfis reais e públicos são exibidos
      const { data, error } = await supabase.fetchPublicProfiles(25);
      
      if (data && data.length > 0) {
        setProfiles(data as UserProfile[]);
      } else {
        setProfiles(mockProfiles); // Fallback to mock data
        if (error) {
           console.warn(
            "Não foi possível buscar perfis públicos. Usando dados de exemplo para o fundo. Causa provável: A política de RLS (Row Level Security) do Supabase para a tabela 'profiles' não permite leitura para usuários anônimos.",
            error,
          );
        }
      }
    };
    fetchProfiles();
  }, []);

  const profileColumns = useMemo(() => {
    if (profiles.length === 0) return [];
    const columns: UserProfile[][] = Array.from({ length: numColumns }, () => []);
    profiles.forEach((profile, i) => {
      columns[i % numColumns].push(profile);
    });
    return columns;
  }, [profiles, numColumns]);

  const columnWidthClass = numColumns === 3 ? 'w-1/3' : 'w-1/5';

  return (
    <div className="h-full w-full text-white bg-gray-900 overflow-hidden relative">
      <LandingHeader onShowPolicy={setActivePolicy} />

      {/* Animated Background */}
      {profiles.length > 0 && (
        <div className="absolute inset-0 flex gap-4 overflow-hidden z-0 opacity-30">
          {profileColumns.map((column, colIndex) => (
            <div
              key={colIndex}
              className={`${columnWidthClass} flex-shrink-0 ${
                colIndex % 2 === 0 ? 'animate-scroll-down' : 'animate-scroll-up'
              }`}
            >
              <div className="flex flex-col gap-4">
                {/* Duplicate the column for seamless scrolling */}
                {column.map((profile) => (
                  <BackgroundProfileCard
                    key={`${profile.id}-1`}
                    profile={profile}
                  />
                ))}
                {column.map((profile) => (
                  <BackgroundProfileCard
                    key={`${profile.id}-2`}
                    profile={profile}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

      {/* Foreground Content */}
      <div className="relative z-10 h-full w-full flex flex-col justify-center items-center p-6 text-center">
        <header className='flex-grow flex flex-col justify-center items-center'>
          <Logo />
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
            Encontro Certo
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-300">
            Conexões reais para relacionamentos duradouros. Encontre alguém que
            combina com você.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onNavigateToRegister}
              className="bg-red-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-red-600 transition-colors shadow-lg animate-pulse-glow"
            >
              Criar Conta
            </button>
            <button
              onClick={onNavigateToLogin}
              className="bg-white/10 backdrop-blur-sm font-bold py-3 px-8 rounded-full text-lg hover:bg-white/20 transition-colors"
            >
              Entrar
            </button>
          </div>
        </header>
        <div className="mt-6 text-center">
            <button
              onClick={onNavigateToTest}
              className="text-yellow-400 border border-yellow-400/50 font-semibold py-2 px-5 rounded-full hover:bg-yellow-400/10 transition-colors text-sm"
            >
              Entrar para Testar (Dev)
            </button>
        </div>
      </div>
      
      {activePolicy && (
        <PolicyModal
          policy={policyContent[activePolicy]}
          onClose={() => setActivePolicy(null)}
        />
      )}
    </div>
  );
};
