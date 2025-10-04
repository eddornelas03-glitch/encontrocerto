import React from 'react';
import type { Message } from '../types';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-yellow-300">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z" clipRule="evenodd" />
    </svg>
);

const AiAnalysisMessage: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split('\n');
    const title = parts[0] || 'Análise de Compatibilidade';
    const body = parts.slice(1).join('\n');

    return (
         <div className="my-4 p-4 bg-gray-700/50 border border-pink-500/30 rounded-lg text-center">
            <div className="flex justify-center items-center gap-2 mb-3">
                <SparklesIcon />
                <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">{title.replace(/\*/g, '')}</h3>
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{body}</p>
        </div>
    );
};

const SystemMessage: React.FC<{ text: string }> = ({ text }) => (
    <div className="text-center text-xs text-gray-500 py-2 px-4">
        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{text}</span>
    </div>
);

const UserMessage: React.FC<{ text: string; isCurrentUser: boolean }> = ({ text, isCurrentUser }) => (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
        isCurrentUser 
            ? 'bg-pink-500 text-white rounded-br-none' 
            : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}>
        <p>{text}</p>
        </div>
    </div>
);

interface MessageBubbleProps {
    message: Message;
    currentUserId: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
    if (message.type === 'ai_analysis') {
        return <AiAnalysisMessage text={message.text} />;
    }
    if (message.senderId === 'system') {
        return <SystemMessage text={message.text} />;
    }
    
    const isCurrentUser = message.senderId === currentUserId;
    return <UserMessage text={message.text} isCurrentUser={isCurrentUser} />;
};
