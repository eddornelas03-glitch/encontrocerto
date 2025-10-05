import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile, Message, User, MessageSuggestion } from '../types';
import { MeetingScheduler } from './MeetingScheduler';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ConfirmationModal } from './ConfirmationModal';
import { ReportModal } from './ReportModal';
import { getMessageSuggestions } from '../services/geminiService';

interface ChatWindowProps {
  match: UserProfile;
  currentUser: User;
  messages: Message[];
  onSendMessage: (content: { text?: string; audioUrl?: string; imageUrl?: string }) => void;
  onSendSystemMessage: (text: string) => void;
  onRequestAnalysis: () => void;
  onViewProfile: (profile: UserProfile) => void;
  onUnmatch: (matchId: number) => void;
}

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
      clipRule="evenodd"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z"
      clipRule="evenodd"
    />
  </svg>
);

const FlagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0V14h5.75a.75.75 0 010 1.5H3.5v2.75a.75.75 0 001.5 0V17h5.75a.75.75 0 010 1.5H5v2.75a.75.75 0 001.5 0V20h5.75a.75.75 0 010 1.5H6.5v2.75a.75.75 0 001.5 0V18h5.75a.75.75 0 010 1.5H8V12h1.5V9.25H3.5V2.75z" />
    <path d="M13.5 2.75a2.5 2.5 0 00-2.5 2.5v7.5a2.5 2.5 0 002.5 2.5h2.5a.75.75 0 000-1.5h-2.5a1 1 0 01-1-1V5.25a1 1 0 011-1h2.5a.75.75 0 000-1.5h-2.5z" />
  </svg>
);

const BlockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      clipRule="evenodd"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const ChatWindowComponent: React.FC<ChatWindowProps> = ({
  match,
  currentUser,
  messages,
  onSendMessage,
  onSendSystemMessage,
  onRequestAnalysis,
  onViewProfile,
  onUnmatch,
}) => {
  const navigate = useNavigate();
  const [isScheduling, setIsScheduling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<'unmatch' | 'block' | null>(
    null,
  );
  const [isReporting, setIsReporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const [newMessage, setNewMessage] = useState('');
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (
        !match ||
        !currentUser ||
        !currentUser.preferences.enableMessageSuggestions
      ) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      setSuggestions([]);

      const recentMessages = (messages || [])
        .filter((m) => m.senderId !== 'system')
        .slice(-5);

      try {
        const newSuggestions = await getMessageSuggestions(
          currentUser,
          match,
          recentMessages,
        );
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Failed to fetch message suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [match, currentUser, messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleScheduleMeeting = () => {
    setIsScheduling(true);
  };

  const handleMeetingScheduled = (date: string, time: string) => {
    const systemMessageText = `Encontro proposto para ${date} às ${time}.`;
    onSendSystemMessage(systemMessageText);
    setIsScheduling(false);
  };

  const handleUnmatchConfirm = () => {
    onUnmatch(match.id);
    setShowConfirmation(null);
  };

  const handleReportSubmit = () => {
    onUnmatch(match.id);
    setIsReporting(false);
  };

  const handleSendWrapper = (content: {
    text?: string;
    audioUrl?: string;
    imageUrl?: string;
  }) => {
    onSendMessage(content);
    setNewMessage('');
  };

  const hasAnalysis = messages.some((m) => m.type === 'ai_analysis');

  return (
    <>
      <div className="h-full w-full bg-gray-700 flex flex-col">
        <header className="bg-gray-900 p-3 border-b border-gray-700 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/matches')}
              className="text-gray-300 mr-2 p-2 rounded-full hover:bg-gray-700"
              aria-label="Voltar para a lista de matches"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={() => onViewProfile(match)}
              className="flex items-center text-left rounded-lg p-1 hover:bg-gray-700"
              aria-label={`Ver perfil de ${match.name}`}
            >
              <img
                src={match.images[0]}
                alt={`Foto de perfil de ${match.name}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex items-center ml-3">
                <h2 className="text-lg font-bold text-white">{match.name}</h2>
              </div>
            </button>
            {!hasAnalysis && (
              <button
                onClick={onRequestAnalysis}
                className="ml-2 text-yellow-300 p-1 rounded-full hover:bg-yellow-400/20 transition-colors animate-pulse-glow"
                title="Analisar Compatibilidade com IA"
                aria-label="Analisar Compatibilidade com IA"
              >
                <SparklesIcon />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScheduleMeeting}
              className="text-red-400 p-2 rounded-full hover:bg-red-500/10"
              aria-label="Agendar Encontro"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 2.25a.75.75 0 01.75.75v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3-3H3.75a3 3 0 01-3-3V7.5a3 3 0 013-3h.75V3.75A.75.75 0 016.75 2.25zM6 15.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H6zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75v-.008zM9.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H9.75zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H10.5a.75.75 0 01-.75-.75v-.008zM12.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM15.75 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zm.75 2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="text-gray-400 p-2 rounded-full hover:bg-gray-700"
                aria-label="Mais opções"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                <MoreIcon />
              </button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gray-700 rounded-lg shadow-xl z-20 py-1">
                  <ul className="text-white text-sm" role="menu">
                    <li role="menuitem">
                      <button
                        onClick={() => {
                          setIsReporting(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-600 rounded-t-lg"
                      >
                        <FlagIcon />
                        <span>Denunciar</span>
                      </button>
                    </li>
                    <li role="menuitem">
                      <button
                        onClick={() => {
                          setShowConfirmation('block');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-600"
                      >
                        <BlockIcon />
                        <span>Bloquear</span>
                      </button>
                    </li>
                    <li role="menuitem">
                      <button
                        onClick={() => {
                          setShowConfirmation('unmatch');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-600 rounded-b-lg text-red-400"
                      >
                        <TrashIcon />
                        <span>Desfazer Match</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUser.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </main>

        <div className="px-3 pb-2 shrink-0">
          {currentUser.preferences.enableMessageSuggestions &&
            loadingSuggestions && (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <div className="bg-gray-600 h-9 w-full rounded-full animate-pulse"></div>
                <div className="bg-gray-600 h-9 w-full rounded-full animate-pulse"></div>
              </div>
            )}
          {currentUser.preferences.enableMessageSuggestions &&
            !loadingSuggestions &&
            suggestions.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pb-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setNewMessage(s.message)}
                    className="bg-gray-600 hover:bg-gray-500 text-gray-200 text-xs font-medium px-3 py-2 rounded-full transition-colors truncate"
                    title={s.message}
                  >
                    {s.topic}
                  </button>
                ))}
              </div>
            )}
        </div>

        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendWrapper}
        />
      </div>

      {isScheduling && (
        <MeetingScheduler
          match={match}
          onClose={() => setIsScheduling(false)}
          onSchedule={handleMeetingScheduled}
        />
      )}
      {isReporting && (
        <ReportModal
          match={match}
          onClose={() => setIsReporting(false)}
          onSubmit={handleReportSubmit}
        />
      )}
      {showConfirmation === 'unmatch' && (
        <ConfirmationModal
          title={`Desfazer Match com ${match.name}?`}
          message="Vocês não poderão mais conversar e o perfil será removido dos seus matches. Esta ação não pode ser desfeita."
          confirmText="Sim, Desfazer Match"
          cancelText="Cancelar"
          onConfirm={handleUnmatchConfirm}
          onCancel={() => setShowConfirmation(null)}
        />
      )}
      {showConfirmation === 'block' && (
        <ConfirmationModal
          title={`Bloquear ${match.name}?`}
          message={`Você não verá mais o perfil de ${match.name} e essa pessoa não poderá ver o seu. Vocês serão removidos dos matches um do outro.`}
          confirmText="Sim, Bloquear"
          cancelText="Cancelar"
          onConfirm={handleUnmatchConfirm}
          onCancel={() => setShowConfirmation(null)}
        />
      )}
    </>
  );
};

export const ChatWindow = memo(ChatWindowComponent);