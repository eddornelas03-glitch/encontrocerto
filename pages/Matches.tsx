import React, { useState, useEffect } from 'react';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import type { UserProfile, View, Message, User } from '../types';
import { useAuth } from '../context/AuthContext';

interface MatchesProps {
    initialMatches: UserProfile[];
    currentView: View;
    setView: (view: View) => void;
    matchToChat: UserProfile | null;
    onChatOpened: () => void;
}

export const Matches: React.FC<MatchesProps> = ({ initialMatches, currentView, setView, matchToChat, onChatOpened }) => {
    const { user } = useAuth();
    const [activeChatMatch, setActiveChatMatch] = useState<UserProfile | null>(null);
    const [allMessages, setAllMessages] = useState<{ [matchId: number]: Message[] }>({});
    const [cameFromExplore, setCameFromExplore] = useState(false);

    useEffect(() => {
        if (matchToChat && currentView === 'chat') {
            openChatForMatch(matchToChat);
            onChatOpened();
            setCameFromExplore(true);
        }
    }, [matchToChat, currentView]);

    const openChatForMatch = (match: UserProfile) => {
        setActiveChatMatch(match);
        if (!allMessages[match.id]) {
            setAllMessages(prev => ({
                ...prev,
                [match.id]: [{
                    id: Date.now(),
                    senderId: 'system',
                    text: `Você deu match com ${match.name}. Diga oi!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]
            }));
        }
    };

    const handleSelectMatchFromList = (match: UserProfile) => {
        setCameFromExplore(false);
        openChatForMatch(match);
        setView('chat');
    };

    const handleBackFromChat = () => {
        setActiveChatMatch(null);
        if (cameFromExplore) {
            setView('explore');
            setCameFromExplore(false);
        } else {
            setView('matches');
        }
    };

    const addMessageToChat = (matchId: number, message: Message) => {
        setAllMessages(prev => {
            const currentMessages = prev[matchId] || [];
            return {
                ...prev,
                [matchId]: [...currentMessages, message]
            };
        });
    };
    
    const handleSendMessage = (text: string) => {
        if (!user || !activeChatMatch) return;
        
        const newMessage: Message = {
            id: Date.now(),
            senderId: user.id,
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessageToChat(activeChatMatch.id, newMessage);
    };

    const handleSendSystemMessage = (text: string) => {
        if (!activeChatMatch) return;
        const systemMessage: Message = {
            id: Date.now(),
            senderId: 'system',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessageToChat(activeChatMatch.id, systemMessage);
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }
    
    const shouldShowChat = currentView === 'chat' && activeChatMatch;

    if (shouldShowChat) {
        return <ChatWindow 
                    match={activeChatMatch} 
                    onBack={handleBackFromChat} 
                    currentUser={user}
                    messages={allMessages[activeChatMatch.id] || []}
                    onSendMessage={handleSendMessage}
                    onSendSystemMessage={handleSendSystemMessage}
                />;
    }

    return <MatchList matches={initialMatches} onSelectMatch={handleSelectMatchFromList} />;
};