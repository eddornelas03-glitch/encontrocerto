import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MatchList } from '../components/MatchList';
import { ChatWindow } from '../components/ChatWindow';
import { MatchProfileView } from '../components/MatchProfileView';
import type { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useChatManager } from '../hooks/useChatManager';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-gray-600">
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.15l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.15 48.901 48.901 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
    </svg>
);

const ChatPlaceholder: React.FC = () => (
    <div className="h-full w-full hidden lg:flex flex-col justify-center items-center text-center text-white bg-gray-800">
        <ChatIcon />
        <h2 className="mt-4 text-xl font-bold text-gray-300">Selecione um match</h2>
        <p className="mt-1 text-gray-500">Escolha uma conversa da lista para começar a conversar.</p>
    </div>
);

interface MatchesProps {}

export const Matches: React.FC<MatchesProps> = () => {
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
  } = useChatManager([], user);
  
  const [activeChat, setActiveChat] = useState<UserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (matchId) {
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        prepareChat(match.id, match.name);
        setActiveChat(match);
      } else if (matches.length > 0 && !matches.some(m => m.id === matchId)) {
        // If matchId is invalid (e.g., after unmatching), but there are still matches, go back to list
        navigate('/matches');
      }
    } else {
      setActiveChat(null);
    }
  }, [matchId, matches, prepareChat, navigate]);

  const handleUnmatchAction = (id: string) => {
    handleUnmatch(id);
    navigate('/matches', { replace: true });
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (isAnalyzing && activeChat) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-gray-900 text-white text-center px-4">
        <div className="flex justify-center items-center space-x-4 animate-pulse">
          <img
            src={activeChat.images[0]}
            alt={activeChat.name}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-600"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 md:h-16 md:w-16 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.345 22.345 0 01-2.846-2.434c-.26-.323-.51-.653-.747-.991l-.255-.373a.85.85 0 01-.042-.105A3.01 3.01 0 012 10c0-1.657 1.343-3 3-3a3.01 3.01 0 012.25 1.007A3.01 3.01 0 0112.25 8 3 3 0 0115 11c0 .599-.155 1.164-.43 1.66l-.255-.373a.85.85 0 01-.042-.105c-.237.338-.487.668-.747.991a22.345 22.345 0 01-2.846 2.434 22.045 22.045 0 01-2.582 1.9 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.002z" />
          </svg>
          <img
            src={user.profile.images[0]}
            alt={user.profile.name}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-600"
          />
        </div>
        <p className="mt-8 text-xl font-semibold text-gray-300">
          {activeChat.compatibility}% de Compatibilidade
        </p>
        <h2 className="mt-2 text-2xl font-bold">
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

  return (
    <div className="h-full w-full flex">
      {/* Sidebar (MatchList) */}
      <div
        className={`
          ${matchId ? 'hidden lg:flex' : 'flex'}
          w-full lg:w-80 xl:w-96
          flex-col flex-shrink-0
        `}
      >
        <MatchList matches={matches} />
      </div>
      
      {/* Main Content Area (ChatWindow or Placeholder for Desktop) */}
      <main className="flex-grow h-full hidden lg:flex">
        {activeChat ? (
          <ChatWindow
            key={activeChat.id}
            match={activeChat}
            currentUser={user}
            messages={allMessages[activeChat.id] || []}
            onSendMessage={(content) => handleSendMessage(activeChat, content)}
            onSendSystemMessage={(text) => handleSendSystemMessage(activeChat, text)}
            onRequestAnalysis={() => handleRequestAnalysis(activeChat)}
            onViewProfile={handleViewProfile}
            onUnmatch={handleUnmatchAction}
          />
        ) : (
          <ChatPlaceholder />
        )}
      </main>

      {/* Mobile Chat Overlay */}
      {activeChat && (
         <div className="block lg:hidden absolute inset-0 bg-gray-900 z-10">
            <ChatWindow
                match={activeChat}
                currentUser={user}
                messages={allMessages[activeChat.id] || []}
                onSendMessage={(content) => handleSendMessage(activeChat, content)}
                onSendSystemMessage={(text) => handleSendSystemMessage(activeChat, text)}
                onRequestAnalysis={() => handleRequestAnalysis(activeChat)}
                onViewProfile={handleViewProfile}
                onUnmatch={handleUnmatchAction}
            />
         </div>
      )}
    </div>
  );
};

export default Matches;
