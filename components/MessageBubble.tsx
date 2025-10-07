import React, { useState } from 'react';
import type { Message } from '../types';
import { AudioPlayer } from './AudioPlayer';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-yellow-300">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z" clipRule="evenodd" />
    </svg>
);

const AiAnalysisMessage: React.FC<{ text: string }> = ({ text }) => {
    return (
         <div className="my-4 p-4 bg-gray-600/50 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
                <SparklesIcon />
                <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">Análise de Compatibilidade</h3>
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{text}</p>
        </div>
    );
};

const SystemMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="text-center text-xs text-gray-400 py-2 px-4">
        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{text}</span>
    </div>
);

const UserMessage: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    return (
    <>
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md rounded-2xl shadow-sm ${
                message.imageUrl ? 'p-1 bg-transparent' : 'px-4 py-2'
            } ${
                isCurrentUser 
                    ? 'bg-red-500 text-white rounded-br-none' 
                    : 'bg-gray-600 text-gray-100 rounded-bl-none'
            }`}>
                {message.text && <p className="break-words">{message.text}</p>}
                {message.audioUrl && (
                    <div className="w-56 sm:w-64 py-1">
                        <AudioPlayer src={message.audioUrl} />
                    </div>
                )}
                {message.imageUrl && (
                     <img 
                        src={message.imageUrl}
                        alt="Imagem enviada"
                        className="rounded-xl w-64 h-auto object-cover cursor-pointer"
                        onClick={() => setIsViewerOpen(true)}
                     />
                )}
            </div>
        </div>

        {isViewerOpen && (
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                onClick={() => setIsViewerOpen(false)}
            >
                <img 
                    src={message.imageUrl}
                    alt="Visualização ampliada"
                    className="max-w-full max-h-full object-contain rounded-lg"
                />
                 <button onClick={() => setIsViewerOpen(false)} className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full" aria-label="Fechar imagem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        )}
    </>
    );
};


interface MessageBubbleProps {
    message: Message;
    currentUserId: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
    if (message.type === 'ai_analysis') {
        return <AiAnalysisMessage text={message.text || ''} />;
    }
    if (message.senderId === 'system') {
        return <SystemMessage text={message.text || ''} />;
    }
    
    const isCurrentUser = message.senderId === currentUserId;
    return <UserMessage message={message} isCurrentUser={isCurrentUser} />;
};
