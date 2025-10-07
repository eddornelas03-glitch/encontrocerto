import React, { useState, useEffect } from 'react';

interface AdModalProps {
  onClose: (watched: boolean) => void;
}

export const AdModal: React.FC<AdModalProps> = ({ onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Automatically close and confirm ad was "watched"
      onClose(true);
    }
  }, [countdown, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-title"
    >
      <div className="bg-gray-700 rounded-2xl shadow-lg text-center p-6 w-full max-w-sm relative">
        <h2 id="ad-title" className="text-2xl font-bold text-white">
          Amei!
        </h2>
        <p className="text-gray-300 mt-2">
          Assista a este anúncio para enviar um "Amei!" e se destacar!
        </p>

        <div className="bg-gray-600 w-full h-40 my-6 flex items-center justify-center rounded-lg">
          <p className="text-white text-lg">Anúncio em vídeo</p>
        </div>

        <p className="text-yellow-400">Você pode pular em {countdown}...</p>

        <button
          onClick={() => onClose(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          aria-label="Fechar anúncio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
