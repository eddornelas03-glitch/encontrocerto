import React, { useState } from 'react';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import type { UserProfile, View } from '../types';

interface MatchesProps {
    initialMatches: UserProfile[];
    currentView: View;
    setView: (view: View) => void;
}

export const Matches: React.FC<MatchesProps> = ({ initialMatches, currentView, setView }) => {
    const [chattingWith, setChattingWith] = useState<UserProfile | null>(null);

    const handleSelectMatch = (match: UserProfile) => {
        setChattingWith(match);
        setView('chat');
    };

    const handleBackFromChat = () => {
        setChattingWith(null);
        setView('matches');
    };

    if (currentView === 'chat' && chattingWith) {
        return <ChatWindow match={chattingWith} onBack={handleBackFromChat} />;
    }

    return <MatchList matches={initialMatches} onSelectMatch={handleSelectMatch} />;
};