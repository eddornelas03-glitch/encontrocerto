import React from 'react';
import type { UserProfile } from '../types';

interface MatchListProps {
  matches: UserProfile[];
  onSelectMatch: (match: UserProfile) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onSelectMatch }) => {
  return (
    <div className="h-full w-full bg-white flex flex-col">
       <div className="p-4 border-b shrink-0">
         <h1 className="text-2xl font-bold text-gray-800 text-center">Seus Matches</h1>
       </div>
      {matches.length === 0 ? (
        <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-xl font-semibold text-gray-600">Nenhum match ainda!</h2>
            <p className="text-gray-400 mt-2">Continue explorando para encontrar seu par perfeito. Eles estão por aí esperando por você!</p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          {matches.map(match => (
            <div
              key={match.id}
              className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onSelectMatch(match)}
            >
              <img src={match.images[0]} alt={match.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">{match.name}</h3>
                <p className="text-sm text-gray-500">Diga olá!</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};