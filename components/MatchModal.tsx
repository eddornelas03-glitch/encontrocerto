import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { supabase } from '../services/supabaseService';
import { useNavigate } from 'react-router-dom';

interface MatchModalProps {
  match: UserProfile;
  currentUserImage: string;
  onClose: () => void;
  onSendMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  match,
  currentUserImage,
  onClose,
  onSendMessage,
}) => {
  const [explanation, setExplanation] = useState('Analisando compatibilidade...');
  const navigate = useNavigate();

  useEffect(() => {
    const getExplanation = async () => {
      const text = await supabase.getCompatibilityExplanation(match);
      setExplanation(text);
    };
    getExplanation();
  }, [match]);

  const handleSendMessageClick = () => {
    onSendMessage();
    navigate(`/matches/${match.id}`);
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
        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-lg text-center p-6 w-full max-w-sm relative transform transition-all scale-100"
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
            src={currentUserImage}
            alt="Você"
            className="w-28 h-28 rounded-full object-cover border-4 border-red-500 shadow-lg transform -rotate-12"
          />
          <img
            src={match.images[0]}
            alt={match.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-lg transform rotate-12"
          />
        </div>

        <div className="bg-white/10 p-3 rounded-lg mb-6">
          <h3 className="font-semibold text-yellow-400 text-sm">
            Por que vocês combinam?
          </h3>
          <p className="text-gray-200 text-xs mt-1">{explanation}</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleSendMessageClick}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-full hover:bg-red-600 transition-colors"
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