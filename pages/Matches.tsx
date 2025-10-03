import React, { useState, useEffect, useCallback } from 'react';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import type { UserProfile, View, Message, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCompatibilityAnalysis } from '../services/geminiService';

interface MatchesProps {
    initialMatches: UserProfile[];
    currentView: View;
    setView: (view: View) => void;
    matchToChat: UserProfile | null;
    onChatOpened: () => void;
}

export const Matches: React.FC<MatchesProps> = ({ initialMatches, currentView, setView, matchToChat, onChatOpened }) => {
    const { user } = useAuth();
    const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
    const [allMessages, setAllMessages] = useState<{ [matchId: number]: Message[] }>({});
    const [isFromNewMatch, setIsFromNewMatch] = useState(false);
    const [isPreparingChat, setIsPreparingChat] = useState(false);

    const addMessageToChat = useCallback((matchId: number, message: Message) => {
        setAllMessages(prev => {
            const currentMessages = prev[matchId] || [];
            // Prevent adding duplicate messages
            if (currentMessages.some(m => m.id === message.id)) return prev;
            return { ...prev, [matchId]: [...currentMessages, message] };
        });
    }, []);

    const openChat = useCallback(async (match: UserProfile) => {
        const needsPreparation = !allMessages[match.id];

        if (needsPreparation) {
            setIsPreparingChat(true);
            setActiveChat(match);
            setView('chat');

            if (user) {
                const analysisText = await getCompatibilityAnalysis(user.profile, match);

                const systemMessage: Message = {
                    id: Date.now(),
                    senderId: 'system',
                    type: 'system',
                    text: `Você deu match com ${match.name}. Diga oi!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                
                const aiMessage: Message = {
                    id: Date.now() + 1,
                    senderId: 'system',
                    type: 'ai_analysis',
                    text: analysisText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                setAllMessages(prev => ({
                    ...prev,
                    [match.id]: [systemMessage, aiMessage],
                }));
                setIsPreparingChat(false);
            } else {
                setIsPreparingChat(false); // Fallback
            }
        } else {
            // Chat already exists, just open it
            setActiveChat(match);
            setView('chat');
        }
    }, [user, allMessages, setView]);


    useEffect(() => {
        // This effect triggers opening a chat from the new match modal.
        if (matchToChat) {
            setIsFromNewMatch(true); // Flag that this chat was opened from the modal
            openChat(matchToChat);
            onChatOpened(); // Notify App.tsx that the prop has been consumed
        }
    }, [matchToChat, onChatOpened, openChat]);

    const handleSelectMatchFromList = (match: UserProfile) => {
        setIsFromNewMatch(false); // This chat was opened from the list
        openChat(match);
    };

    const handleBackFromChat = () => {
        const targetView = isFromNewMatch ? 'explore' : 'matches';
        setActiveChat(null);
        setIsFromNewMatch(false);
        setView(targetView);
    };
    
    const handleSendMessage = (text: string) => {
        if (!user || !activeChat) return;
        const newMessage: Message = {
            id: Date.now(),
            senderId: user.id,
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'user',
        };
        addMessageToChat(activeChat.id, newMessage);
    };

    const handleSendSystemMessage = (text: string) => {
        if (!activeChat) return;
        const systemMessage: Message = {
            id: Date.now(),
            senderId: 'system',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'system',
        };
        addMessageToChat(activeChat.id, systemMessage);
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }
    
    if (currentView === 'chat' && activeChat) {
        if (isPreparingChat) {
            return (
                 <div className="flex flex-col justify-center items-center h-full bg-gray-900 text-white text-center px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    <p className="mt-4 text-lg font-semibold">Analisando compatibilidade...</p>
                    <p className="mt-2 text-sm text-gray-400 max-w-xs">
                        A primeira análise pode levar um momento enquanto nossa IA prepara insights para a conversa. Nas próximas vezes, será instantâneo!
                    </p>
                 </div>
            );
        }

        return <ChatWindow 
                    match={activeChat} 
                    onBack={handleBackFromChat} 
                    currentUser={user}
                    messages={allMessages[activeChat.id] || []}
                    onSendMessage={handleSendMessage}
                    onSendSystemMessage={handleSendSystemMessage}
                />;
    }

    return <MatchList matches={initialMatches} onSelectMatch={handleSelectMatchFromList} />;
};
