import React, { useState, useEffect, useCallback } from 'react';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import { MatchProfileView } from '../components/MatchProfileView';
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
    const [matches, setMatches] = useState(initialMatches);
    const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
    const [allMessages, setAllMessages] = useState<{ [matchId: number]: Message[] }>({});
    const [isFromNewMatch, setIsFromNewMatch] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

    const addMessageToChat = useCallback((matchId: number, message: Message) => {
        setAllMessages(prev => {
            const currentMessages = prev[matchId] || [];
            if (currentMessages.some(m => m.id === message.id)) return prev;
            return { ...prev, [matchId]: [...currentMessages, message] };
        });
    }, []);

    const openChat = useCallback(async (match: UserProfile) => {
        const needsPreparation = !allMessages[match.id];

        if (needsPreparation && user) {
            const systemMessage: Message = {
                id: Date.now(),
                senderId: 'system',
                type: 'system',
                text: `Você deu match com ${match.name}. Diga oi!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setAllMessages(prev => ({
                ...prev,
                [match.id]: [systemMessage],
            }));
        }
        setActiveChat(match);
        setView('chat');
    }, [user, allMessages, setView]);

    const handleViewProfile = (profile: UserProfile) => {
        setViewingProfile(profile);
    };

    const handleBackFromProfile = () => {
        setViewingProfile(null);
    };

    const handleRequestAnalysis = useCallback(async () => {
        if (!user || !activeChat) return;

        if (allMessages[activeChat.id]?.some(m => m.type === 'ai_analysis')) {
            return;
        }

        setIsAnalyzing(true);
        const analysisText = await getCompatibilityAnalysis(user.profile, activeChat);
        const aiMessage: Message = {
            id: Date.now() + 1,
            senderId: 'system',
            type: 'ai_analysis',
            text: analysisText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessageToChat(activeChat.id, aiMessage);
        setIsAnalyzing(false);
    }, [user, activeChat, addMessageToChat, allMessages]);


    useEffect(() => {
        if (matchToChat) {
            setIsFromNewMatch(true);
            openChat(matchToChat);
            onChatOpened();
        }
    }, [matchToChat, onChatOpened, openChat]);

    const handleSelectMatchFromList = (match: UserProfile) => {
        setIsFromNewMatch(false);
        openChat(match);
    };

    const handleBackFromChat = () => {
        const targetView = isFromNewMatch ? 'explore' : 'matches';
        setActiveChat(null);
        setIsFromNewMatch(false);
        setView(targetView);
    };
    
    const handleUnmatch = (matchId: number) => {
        setMatches(prev => prev.filter(m => m.id !== matchId));
        setActiveChat(null);
        setView('matches');
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
    
    if (isAnalyzing) {
        return (
             <div className="flex flex-col justify-center items-center h-full bg-gray-900 text-white text-center px-4">
                <div className="w-16 h-16 border-4 border-dashed border-pink-500 rounded-full animate-spin-slow">
                    <div className="w-12 h-12 border-4 border-dashed border-yellow-400 rounded-full animate-spin-slow-reverse"></div>
                </div>
                <h2 className="mt-6 text-2xl font-bold">Analisando compatibilidade...</h2>
             </div>
        );
    }

    if (viewingProfile) {
        return <MatchProfileView profile={viewingProfile} onBack={handleBackFromProfile} />;
    }

    if (currentView === 'chat' && activeChat) {
        return <ChatWindow 
                    match={activeChat} 
                    onBack={handleBackFromChat} 
                    currentUser={user}
                    messages={allMessages[activeChat.id] || []}
                    onSendMessage={handleSendMessage}
                    onSendSystemMessage={handleSendSystemMessage}
                    onRequestAnalysis={handleRequestAnalysis}
                    onViewProfile={handleViewProfile}
                    onUnmatch={handleUnmatch}
                />;
    }

    return <MatchList matches={matches} onSelectMatch={handleSelectMatchFromList} />;
};
