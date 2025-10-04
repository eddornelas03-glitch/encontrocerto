import React, { useState } from 'react';
import { isTextOffensive } from '../services/geminiService';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [moderationError, setModerationError] = useState('');

    const handleSendMessageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || isSending) return;

        setIsSending(true);
        setModerationError('');

        const offensive = await isTextOffensive(newMessage);

        if (offensive) {
            setModerationError('Sua mensagem viola as diretrizes da comunidade. Por favor, seja respeitoso.');
            setIsSending(false);
            return;
        }

        onSendMessage(newMessage);
        setNewMessage('');
        setIsSending(false);
    };

    return (
        <footer className="bg-gray-900 p-3 border-t border-gray-700 shrink-0">
            <form onSubmit={handleSendMessageSubmit} className="flex items-center gap-2">
                <div className="w-full">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        aria-label="Caixa de texto para nova mensagem"
                        className={`w-full px-4 py-2 bg-gray-700 rounded-full focus:outline-none focus:ring-2 text-white ${moderationError ? 'ring-red-500' : 'focus:ring-pink-400'}`}
                        disabled={isSending}
                    />
                    {moderationError && <p className="text-red-500 text-xs mt-1 ml-4">{moderationError}</p>}
                </div>
                <button 
                    type="submit" 
                    disabled={isSending} 
                    aria-label={isSending ? "Enviando mensagem" : "Enviar mensagem"}
                    className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    )}
                </button>
            </form>
        </footer>
    );
};
