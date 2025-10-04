import React, { useState, useEffect, useCallback } from 'react';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import { MatchProfileView } from '../components/MatchProfileView';
import type { UserProfile, View } from '../types';
import { useAuth } from '../context/AuthContext';
import { useChatManager } from '../hooks/useChatManager';

interface MatchesProps {
  initialMatches: UserProfile[];
  currentView: View;
  setView: (view: View) => void;
  matchToChat: UserProfile | null;
  onChatOpened: () => void;
}

export const Matches: React.FC<MatchesProps> = ({
  initialMatches,
  currentView,
  setView,
  matchToChat,
  onChatOpened,
}) => {
  const { user } = useAuth();
  const {
    matches,
    allMessages,
    isAnalyzing,
    prepareChat,
    handleSendMessage,
    handleSendSystemMessage,
    handleRequestAnalysis,
    handleUnmatch,
  } = useChatManager(initialMatches, user);
  
  const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
  const [isFromNewMatch, setIsFromNewMatch] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  const openChat = useCallback((match: UserProfile) => {
    prepareChat(match.id, match.name);
    setActiveChat(match);
    setView('chat');
  }, [prepareChat, setView]);
  
  // Effect to handle opening chat from a new match
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
  
  const handleUnmatchAction = (matchId: number) => {
    handleUnmatch(matchId);
    setActiveChat(null);
    setView('matches');
  };
  
  const handleViewProfile = (profile: UserProfile) => {
    setViewingProfile(profile);
  };

  const handleBackFromProfile = () => {
    setViewingProfile(null);
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
        <h2 className="mt-6 text-2xl font-bold">
          Analisando compatibilidade...
        </h2>
      </div>
    );
  }

  if (viewingProfile) {
    return (
      <MatchProfileView profile={viewingProfile} onBack={handleBackFromProfile} />
    );
  }

  if (currentView === 'chat' && activeChat) {
    return (
      <ChatWindow
        match={activeChat}
        onBack={handleBackFromChat}
        currentUser={user}
        messages={allMessages[activeChat.id] || []}
        onSendMessage={(text) => handleSendMessage(activeChat, text)}
        onSendSystemMessage={(text) => handleSendSystemMessage(activeChat, text)}
        onRequestAnalysis={() => handleRequestAnalysis(activeChat)}
        onViewProfile={handleViewProfile}
        onUnmatch={handleUnmatchAction}
      />
    );
  }

  return <MatchList matches={matches} onSelectMatch={handleSelectMatchFromList} />;
};
