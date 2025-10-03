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
    const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
    const [allMessages, setAllMessages] = useState<{ [matchId: number]: Message[] }>({});
    const [isFromNewMatch, setIsFromNewMatch] = useState(false);

    useEffect(() => {
        // This effect triggers opening a chat from the new match modal
        if (matchToChat && currentView === 'chat') {
            setActiveChat(matchToChat);
            setIsFromNewMatch(true); // Flag that this chat was opened from the modal
            
            // Initialize messages if they don't exist
            if (!allMessages[matchToChat.id]) {
                setAllMessages(prev => ({
                    ...prev,
                    [matchToChat.id]: [{
                        id: Date.now(),
                        senderId: 'system',
                        text: `Você deu match com ${matchToChat.name}. Diga oi!`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }]
                }));
            }
            onChatOpened(); // Notify App.tsx that the prop has been consumed
        }
    }, [matchToChat, currentView, onChatOpened, allMessages]);

    const handleSelectMatchFromList = (match: UserProfile) => {
        setActiveChat(match);
        setIsFromNewMatch(false); // This chat was opened from the list
        
        // Initialize messages if they don't exist
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
        setView('chat');
    };

    const handleBackFromChat = () => {
        const targetView = isFromNewMatch ? 'explore' : 'matches';
        setActiveChat(null);
        setIsFromNewMatch(false);
        setView(targetView);
    };

    const addMessageToChat = (matchId: number, message: Message) => {
        setAllMessages(prev => {
            const currentMessages = prev[matchId] || [];
            return { ...prev, [matchId]: [...currentMessages, message] };
        });
    };
    
    const handleSendMessage = (text: string) => {
        if (!user || !activeChat) return;
        const newMessage: Message = {
            id: Date.now(),
            senderId: user.id,
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        };
        addMessageToChat(activeChat.id, systemMessage);
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }
    
    if (currentView === 'chat' && activeChat) {
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
