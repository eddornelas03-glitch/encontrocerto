import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { getCompatibilityAnalysis } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

interface MatchModalProps {
  match: UserProfile;
  onClose: () => void;
  onSendMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  match,
  onClose,
  onSendMessage,
}) => {
  const [explanation, setExplanation] = useState('Analisando compatibilidade...');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const getExplanation = async () => {
      if (!user) return;
      const text = await getCompatibilityAnalysis(user.profile, match);
      setExplanation(text);
    };
    getExplanation();
  }, [match, user]);

  const handleSendMessageClick = () => {
    onSendMessage();
    // No need to navigate here, onSendMessage already does it in App.tsx
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
    >
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg text-center p-6 w-full max-w-sm relative transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="match-title"
          className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400"
        >
          Deu Match!
        </h2>
        <p className="text-gray-300 mt-2 text-sm">
          Você e {match.name} se curtiram.
        </p>

        <div className="flex justify-center items-center my-6 space-x-[-2rem]">
          <img
            src={user?.profile.images?.[0] || 'https://via.placeholder.com/300x300.png?text=Sem+Foto'}
            alt="Você"
            className="w-28 h-28 rounded-full object-cover border-4 border-red-500 shadow-lg transform -rotate-12"
          />
          <img
            src={match.images?.[0] || 'https://via.placeholder.com/300x300.png?text=Sem+Foto'}
            alt={match.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-lg transform rotate-12"
          />
        </div>

        <div className="bg-white/5 p-3 rounded-lg mb-6 text-left">
          <p className="text-gray-200 text-sm whitespace-pre-wrap">{explanation}</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleSendMessageClick}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-full hover:bg-red-600 transition-colors animate-pulse-glow"
          >
            Enviar Mensagem
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent border-2 border-gray-600 text-gray-300 font-bold py-3 px-4 rounded-full hover:bg-gray-700 transition-colors"
          >
            Continuar Explorando
          </button>
        </div>
      </div>
    </div>
  );
};
