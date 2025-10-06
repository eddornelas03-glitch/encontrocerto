import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, Message, User } from '../types';
import { getCompatibilityAnalysis } from '../services/geminiService';
import { supabase } from '../services/supabaseService';

export const useChatManager = (initialMatches: UserProfile[], user: User | null) => {
  const [matches, setMatches] = useState<UserProfile[]>(initialMatches);
  const [allMessages, setAllMessages] = useState<{ [matchId: number]: Message[] }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchUserMatches = async () => {
        const { data } = await supabase.fetchMatches();
        if (data) {
            setMatches(data);
        }
    };
    if (user) {
        fetchUserMatches();
    }
  }, [user]);

  const addMessageToChat = useCallback((matchId: number, message: Message) => {
    setAllMessages((prev) => {
      const currentMessages = prev[matchId] || [];
      if (currentMessages.some((m) => m.id === message.id)) return prev;
      return { ...prev, [matchId]: [...currentMessages, message] };
    });
  }, []);
  
  const prepareChat = useCallback(async (matchId: number, matchName: string) => {
      const needsPreparation = !allMessages[matchId];
      if (needsPreparation) {
          const { data: messages } = await supabase.fetchMessagesForMatch(matchId);
          if (messages) {
              setAllMessages(prev => ({...prev, [matchId]: messages}));
          } else {
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
      }
  }, [allMessages, addMessageToChat]);

  const handleSendMessage = useCallback(
    async (activeChat: UserProfile, content: { text?: string; audioUrl?: string; imageUrl?: string; }) => {
      if (!user) return;
      if (!content.text && !content.audioUrl && !content.imageUrl) return;

      const newMessage: Partial<Message> = {
        senderId: user.id,
        receiver_id: activeChat.id,
        match_id: activeChat.id, // Assuming matchId is the same as the other user's ID for simplicity
        text: content.text,
        // audioUrl: content.audioUrl, // Supabase storage not implemented for these yet
        // imageUrl: content.imageUrl,
        type: 'user',
      };
      
      // Optimistically update UI
      const optimisticMessage: Message = {
          ...newMessage,
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessageToChat(activeChat.id, optimisticMessage);

      await supabase.sendMessage(newMessage);
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
        id: Date.now() + 1,
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
        setAllMessages(prev => {
            const newMessages = { ...prev };
            const numericMatchId = parseInt(matchId, 10);
            if (!isNaN(numericMatchId)) {
              delete newMessages[numericMatchId];
            }
            return newMessages;
        });
        // You would also call a supabase function here to delete the match from the DB
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