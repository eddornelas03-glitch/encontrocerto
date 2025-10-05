import React from 'react';

interface CookieConsentProps {
  onConsent: (choice: 'accepted' | 'declined' | 'customized') => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onConsent }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gray-900/80 backdrop-blur-sm text-white shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-end gap-4">
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onConsent('customized')}
            className="font-bold text-white px-6 py-2 w-full rounded-full border-2 border-white hover:bg-white hover:text-gray-900 transition-colors"
          >
            Personalizar
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onConsent('declined')}
              className="font-semibold px-6 py-2 w-full rounded-full hover:bg-white/10 transition-colors"
            >
              Recusar
            </button>
            <button
              onClick={() => onConsent('accepted')}
              className="font-semibold px-6 py-2 w-full rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
