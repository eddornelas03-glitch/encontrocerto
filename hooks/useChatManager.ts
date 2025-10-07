import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, Message, User } from '../types';
import { getCompatibilityAnalysis } from '../services/geminiService';
import { supabase } from '../services/supabaseService';

export const useChatManager = (initialMatches: UserProfile[], user: User | null) => {
  const [matches, setMatches] = useState<UserProfile[]>(initialMatches);
  const [allMessages, setAllMessages] = useState<{ [matchId: string]: Message[] }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchMatches = async () => {
        const userMatches = await supabase.getMatchesForUser(user.id);
        setMatches(userMatches);
    };

    fetchMatches();
  }, [user]);

  const addMessageToChat = useCallback((matchId: string, message: Message) => {
    setAllMessages((prev) => {
      const currentMessages = prev[matchId] || [];
      // Prevent duplicate messages
      if (currentMessages.some((m) => m.id === message.id)) return prev;
      return { ...prev, [matchId]: [...currentMessages, message] };
    });
  }, []);
  
  const prepareChat = useCallback((matchId: string, matchName: string) => {
      const needsPreparation = !allMessages[matchId];
      if (needsPreparation) {
          const systemMessage: Message = {
            id: Date.now(),
            senderId: 'system',
            type: 'system',
            text: `Você deu match com ${matchName}. Diga oi!`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          addMessageToChat(matchId, systemMessage);
      }
  }, [allMessages, addMessageToChat]);

  const handleSendMessage = useCallback(
    (activeChat: UserProfile, content: { text?: string; audioUrl?: string; imageUrl?: string; }) => {
      if (!user) return;
      if (!content.text && !content.audioUrl && !content.imageUrl) return;

      const newMessage: Message = {
        id: Date.now(),
        senderId: user.id,
        text: content.text,
        audioUrl: content.audioUrl,
        imageUrl: content.imageUrl,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'user',
      };
      addMessageToChat(activeChat.id, newMessage);
    },
    [user, addMessageToChat],
  );
    
  const handleSendSystemMessage = useCallback((activeChat: UserProfile, text: string) => {
      const systemMessage: Message = {
        id: Date.now(),
        senderId: 'system',
        text: text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'system',
      };
      addMessageToChat(activeChat.id, systemMessage);
  }, [addMessageToChat]);

  const handleRequestAnalysis = useCallback(async (activeChat: UserProfile) => {
      if (!user) return;

      const hasAnalysis = allMessages[activeChat.id]?.some(m => m.type === 'ai_analysis');
      if (hasAnalysis) return;

      setIsAnalyzing(true);
      const analysisText = await getCompatibilityAnalysis(
        user.profile,
        activeChat,
      );
      const aiMessage: Message = {
        id: Date.now() + 1, // Ensure unique ID
        senderId: 'system',
        type: 'ai_analysis',
        text: analysisText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      addMessageToChat(activeChat.id, aiMessage);
      setIsAnalyzing(false);
    }, [user, allMessages, addMessageToChat]);
    
    const handleUnmatch = (matchId: string) => {
        setMatches(prev => prev.filter(m => m.id !== matchId));
        // Optionally, clear messages for the unmatched user
        setAllMessages(prev => {
            const newMessages = { ...prev };
            delete newMessages[matchId];
            return newMessages;
        });
    };

  return {
    matches,
    allMessages,
    isAnalyzing,
    prepareChat,
    handleSendMessage,
    handleSendSystemMessage,
    handleRequestAnalysis,
    handleUnmatch,
  };
};