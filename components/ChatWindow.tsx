import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, Message, User } from '../types';
import { MeetingScheduler } from './MeetingScheduler';
import { isTextOffensive } from '../services/geminiService';

interface ChatWindowProps {
  match: UserProfile;
  onBack: () => void;
  currentUser: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendSystemMessage: (text: string) => void;
}

const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-yellow-300">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458-.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z" clipRule="evenodd" />
    </svg>
);

const AiAnalysisMessage: React.FC<{ text: string }> = ({ text }) => {
    // Split the title from the body
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
    )
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ match, onBack, currentUser, messages, onSendMessage, onSendSystemMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [moderationError, setModerationError] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleScheduleMeeting = () => {
    setIsScheduling(true);
  };
  
  const handleMeetingScheduled = (date: string, time: string) => {
    const systemMessageText = `Encontro proposto para ${date} às ${time}.`;
    onSendSystemMessage(systemMessageText);
    setIsScheduling(false);
  }

  return (
    <>
    <div className="h-full w-full bg-gray-800 flex flex-col">
      <header className="bg-gray-900 p-3 border-b border-gray-700 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center">
            <button onClick={onBack} className="text-gray-300 mr-2 p-2 rounded-full hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            </button>
            <img src={match.images[0]} alt={match.name} className="w-10 h-10 rounded-full object-cover" />
            <h2 className="text-lg font-bold text-white ml-3">{match.name}</h2>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleScheduleMeeting} className="text-pink-400 p-2 rounded-full hover:bg-pink-500/10" title="Agendar Encontro">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 2.25a.75.75 0 01.75.75v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3-3H3.75a3 3 0 01-3-3V7.5a3 3 0 013-3h.75V3.75A.75.75 0 016.75 2.25zM6 15.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H6zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75v-.008zM9.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H9.75zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H10.5a.75.75 0 01-.75-.75v-.008zM12.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM15.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" /></svg>
            </button>
            <button className="text-gray-400 p-2 rounded-full hover:bg-gray-700" title="Mais opções">
                <MoreIcon/>
            </button>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
            if (message.type === 'ai_analysis') {
                return <AiAnalysisMessage key={message.id} text={message.text} />;
            }
            if (message.senderId === 'system') {
                return (
                    <div key={message.id} className="text-center text-xs text-gray-500 py-2 px-4">
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{message.text}</span>
                    </div>
                )
            }
            const isCurrentUser = message.senderId === currentUser.id;
            return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    isCurrentUser 
                        ? 'bg-pink-500 text-white rounded-br-none' 
                        : 'bg-gray-700 text-gray-100 rounded-bl-none'
                    }`}>
                    <p>{message.text}</p>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-gray-900 p-3 border-t border-gray-700 shrink-0">
        <form onSubmit={handleSendMessageSubmit} className="flex items-center gap-2">
          <div className="w-full">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                className={`w-full px-4 py-2 bg-gray-700 rounded-full focus:outline-none focus:ring-2 text-white ${moderationError ? 'ring-red-500' : 'focus:ring-pink-400'}`}
                disabled={isSending}
            />
            {moderationError && <p className="text-red-500 text-xs mt-1 ml-4">{moderationError}</p>}
          </div>
          <button type="submit" disabled={isSending} className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
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
    </div>
    {isScheduling && <MeetingScheduler match={match} onClose={() => setIsScheduling(false)} onSchedule={handleMeetingScheduled} />}
    </>
  );
};