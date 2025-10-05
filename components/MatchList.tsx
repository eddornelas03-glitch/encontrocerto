import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../types';

interface MatchListProps {
  matches: UserProfile[];
}

const MatchListComponent: React.FC<MatchListProps> = ({ matches }) => {
  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700 shrink-0">
        <h1 className="text-2xl font-bold text-white text-center">
          Seus Matches
        </h1>
      </div>
      {matches.length === 0 ? (
        <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-xl font-semibold text-gray-200">
            Nenhum match ainda!
          </h2>
          <p className="text-gray-400 mt-2">
            Continue explorando para encontrar seu par perfeito. Eles estão por aí
            esperando por você!
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          {matches.map((match) => (
            <Link
              to={`/matches/${match.id}`}
              key={match.id}
              className="flex items-center p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <img
                src={match.images[0]}
                alt={match.name}
                className="w-16 h-16 rounded-full object-cover"
                loading="lazy"
              />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-100">
                  {match.name}
                </h3>
                <p className="text-sm text-gray-400">Diga olá!</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const MatchList = memo(MatchListComponent);