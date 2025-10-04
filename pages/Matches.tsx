import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import { MatchProfileView } from '../components/MatchProfileView';
import type { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useChatManager } from '../hooks/useChatManager';

interface MatchesProps {
  initialMatches: UserProfile[];
}

export const Matches: React.FC<MatchesProps> = ({ initialMatches }) => {
  const { user } = useAuth();
  const { matchId } = useParams<{ matchId?: string }>();
  const navigate = useNavigate();

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
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (matchId) {
      const match = matches.find((m) => m.id === parseInt(matchId, 10));
      if (match) {
        prepareChat(match.id, match.name);
        setActiveChat(match);
      }
    } else {
      setActiveChat(null);
    }
  }, [matchId, matches, prepareChat]);

  const handleUnmatchAction = (id: number) => {
    handleUnmatch(id);
    navigate('/matches');
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

  if (activeChat) {
    return (
      <ChatWindow
        match={activeChat}
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

  return <MatchList matches={matches} />;
};
