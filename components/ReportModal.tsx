import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface ReportModalProps {
  match: UserProfile;
  onClose: () => void;
  onSubmit: () => void;
}

const reportReasons = [
    'Comportamento Ofensivo',
    'Perfil Falso / Catfish',
    'Spam ou Golpes',
    'Conteúdo Inapropriado',
    'Menor de idade',
    'Outro',
];

export const ReportModal: React.FC<ReportModalProps> = ({ match, onClose, onSubmit }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReason) return;
        
        console.log({
            reportedUserId: match.id,
            reason: selectedReason,
            details: details,
        });

        setIsSubmitted(true);
        setTimeout(() => {
             onSubmit();
        }, 2500);
    };

    if (isSubmitted) {
        return (
             <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="report-submitted-title">
                <div className="bg-gray-700 rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
                    <h2 id="report-submitted-title" className="text-2xl font-bold text-green-400">Denúncia Enviada</h2>
                    <p className="text-gray-300 mt-3">Obrigado por nos ajudar a manter a comunidade segura. Nossa equipe irá analisar a denúncia. O match com {match.name} foi desfeito.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="report-title">
            <div className="bg-gray-700 text-white rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b border-gray-700 shrink-0">
                    <h1 id="report-title" className="text-xl font-bold text-red-500">Denunciar {match.name}</h1>
                     <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Fechar modal de denúncia">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit}>
                        <fieldset>
                            <legend className="text-gray-300 mb-4">Selecione o motivo da denúncia. Sua denúncia é confidencial.</legend>
                            <div className="space-y-3 mb-4">
                                {reportReasons.map(reason => (
                                    <label key={reason} className="flex items-center p-3 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500 has-[:checked]:bg-red-900/50 has-[:checked]:ring-2 has-[:checked]:ring-red-500">
                                        <input
                                            type="radio"
                                            name="report-reason"
                                            value={reason}
                                            checked={selectedReason === reason}
                                            onChange={() => setSelectedReason(reason)}
                                            className="h-5 w-5 text-red-500 bg-gray-800 border-gray-600 focus:ring-red-600 checked:bg-red-500"
                                        />
                                        <span className="ml-3 text-white">{reason}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        
                        <div className="mb-6">
                             <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-1">Detalhes (opcional)</label>
                             <textarea
                                id="details"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows={3}
                                placeholder="Forneça mais informações, se necessário."
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                             />
                        </div>

                         <button
                            type="submit"
                            disabled={!selectedReason}
                            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Enviar Denúncia
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};
