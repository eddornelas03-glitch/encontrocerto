import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const initialPrompt = "Uma representação visual da otimização de código para desenvolvimento web. Mostre um emaranhado grande e complexo de fios de código de um lado, representando um build lento e não otimizado. Do outro lado, mostre os mesmos fios organizados de forma limpa, simplificados e brilhando com energia, levando a um ícone de site de carregamento rápido. Use uma estética moderna, abstrata e limpa com azuis, verdes e brancos vibrantes. Estilo minimalista, arte digital";

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-full text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
        <p className="mt-4 text-lg">Gerando sua imagem, por favor aguarde...</p>
    </div>
);

const Placeholder: React.FC = () => (
     <div className="flex flex-col justify-center items-center h-full text-gray-500 border-2 border-dashed border-gray-600 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-4 text-lg">Sua imagem aparecerá aqui</p>
    </div>
);

export const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt || loading) return;

        setLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const url = `data:image/jpeg;base64,${base64ImageBytes}`;
                setImageUrl(url);
            } else {
                setError("Não foi possível gerar a imagem. A resposta da API estava vazia.");
            }
        } catch (e) {
            console.error("Erro ao gerar imagem:", e);
            setError("Ocorreu um erro ao gerar a imagem. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full bg-gray-900 text-white flex flex-col p-4 space-y-4 pb-24">
            <header className="shrink-0">
                <h1 className="text-2xl font-bold text-center">Gerador de Imagens AI</h1>
                <p className="text-center text-gray-400">Descreva a imagem que você quer criar.</p>
            </header>
            
            <div className="flex-grow flex flex-col space-y-4">
                <div className="flex-grow bg-gray-800 rounded-lg p-2">
                    {loading ? <LoadingSpinner /> : 
                     error ? <div className="text-red-400 text-center p-4">{error}</div> : 
                     imageUrl ? <img src={imageUrl} alt="Imagem gerada por IA" className="w-full h-full object-contain rounded-md" /> : 
                     <Placeholder />}
                </div>

                <div className="h-1/3 flex flex-col space-y-3">
                     <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva sua imagem..."
                        className="w-full h-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white resize-none"
                        disabled={loading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Gerando...' : 'Gerar Imagem'}
                    </button>
                </div>
            </div>
        </div>
    );
};