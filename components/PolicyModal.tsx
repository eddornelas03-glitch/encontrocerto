import React from 'react';

interface PolicyContent {
    title: string;
    content: {
        subtitle: string;
        text: string;
    }[];
}

interface PolicyModalProps {
  policy: PolicyContent;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex justify-center items-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-title"
    >
        <div 
            className="bg-gray-900 w-full max-w-3xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col text-white"
            onClick={e => e.stopPropagation()}
        >
            <header className="flex justify-between items-center p-5 border-b border-gray-700 shrink-0">
                <h1 id="policy-title" className="text-2xl font-bold text-red-400">{policy.title}</h1>
                <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label={`Fechar ${policy.title}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            <main className="overflow-y-auto p-6">
                <div className="space-y-6">
                    {policy.content.map((section, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-semibold text-gray-100 mb-2">{section.subtitle}</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{section.text}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    </div>
  );
};