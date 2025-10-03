import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, Message } from '../types';
import { MeetingScheduler } from './MeetingScheduler';

interface ChatWindowProps {
  match: UserProfile;
  onBack: () => void;
}

const mockMessages: Message[] = [
    { id: 1, senderId: 1, text: 'Oi, que bom que demos match! Como você está?', timestamp: '10:30' },
    { id: 2, senderId: 0, text: 'Oie! Estou ótimo, obrigado! Adorei sua foto de perfil.', timestamp: '10:31' },
    { id: 3, senderId: 1, text: 'Obrigado! A sua também é ótima. O que vai fazer no fim de semana?', timestamp: '10:32' },
];

const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
    </svg>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ match, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  const currentUser = { id: 0 }; // Mock current user ID

  useEffect(() => {
    const initialMessages = mockMessages.map(m => ({
        ...m,
        senderId: m.senderId === 1 ? match.id : currentUser.id
    }));
    setMessages(initialMessages);
  }, [match.id, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleScheduleMeeting = () => {
    setIsScheduling(true);
  };
  
  const handleMeetingScheduled = (date: string, time: string) => {
    const systemMessage: Message = {
        id: Date.now(),
        senderId: 'system',
        text: `Encontro proposto para ${date} às ${time}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, systemMessage]);
    setIsScheduling(false);
  }

  return (
    <>
    <div className="h-full w-full bg-gray-50 flex flex-col">
      <header className="bg-white p-3 border-b flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center">
            <button onClick={onBack} className="text-gray-600 mr-2 p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            </button>
            <img src={match.images[0]} alt={match.name} className="w-10 h-10 rounded-full object-cover" />
            <h2 className="text-lg font-bold text-gray-800 ml-3">{match.name}</h2>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleScheduleMeeting} className="text-pink-500 p-2 rounded-full hover:bg-pink-50" title="Agendar Encontro">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 2.25a.75.75 0 01.75.75v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H3.75a3 3 0 01-3-3V7.5a3 3 0 013-3h.75V3.75A.75.75 0 016.75 2.25zM6 15.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H6zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75v-.008zM9.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H9.75zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H10.5a.75.75 0 01-.75-.75v-.008zM12.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM15.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" /></svg>
            </button>
            <button className="text-gray-500 p-2 rounded-full hover:bg-gray-100" title="Mais opções">
                <MoreIcon/>
            </button>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
            if (message.senderId === 'system') {
                return (
                    <div key={message.id} className="text-center text-xs text-gray-500 py-2">
                        <span>{message.text}</span>
                    </div>
                )
            }
            return (
                <div key={message.id} className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    message.senderId === currentUser.id 
                        ? 'bg-pink-500 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border'
                    }`}>
                    <p>{message.text}</p>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-3 border-t shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button type="submit" className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
    {isScheduling && <MeetingScheduler match={match} onClose={() => setIsScheduling(false)} onSchedule={handleMeetingScheduled} />}
    </>
  );
};