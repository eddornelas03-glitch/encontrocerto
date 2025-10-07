import { GoogleGenAI, Type, HarmCategory } from '@google/genai';
import type { UserProfile, Message, User, MessageSuggestion } from '../types';

// Vite will replace process.env.GEMINI_API_KEY with the actual key from the .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const moderationPrompt = `Você é um moderador de um aplicativo de encontros. Analise o texto abaixo e responda apenas se ele for ofensivo.

Considere como ofensivo:
- Insultos ou palavrões
- Linguagem agressiva ou humilhante
- Conteúdo sexual explícito
- Discriminação (raça, gênero, religião, orientação sexual etc.)
- Assédio ou ameaças

Se o texto for ofensivo, responda apenas com:
OFENSIVO

Se o texto não for ofensivo, não diga nada.

Texto do usuário:
"""
[TEXTO]
"""`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const formatProfileForPrompt = (profile: UserProfile) => {
  return `
- Apelido: ${profile.apelido}
- Objetivo: ${profile.relationshipGoal}
- Bio: "${profile.bio}"
- Interesses: ${profile.interests.join(', ')}
    `.trim();
};

const compatibilityPrompt = `Você é um especialista em relacionamentos e analista de compatibilidade para o aplicativo de namoro "Encontro Certo". Sua tarefa é analisar os perfis de dois usuários que acabaram de dar match e escrever uma análise curta, otimista e encorajadora explicando por que eles podem ser uma boa combinação.

**Instruções:**
1.  **Dirija-se a ambos:** Use "vocês" para se dirigir ao casal.
2.  **Seja Específico:** Destaque 2-3 pontos de compatibilidade, citando interesses compartilhados, objetivos de relacionamento semelhantes ou vibes complementares de suas biografias.
3.  **Tom Amigável:** Mantenha um tom leve, amigável e perspicaz. Evite clichês genéricos.
4.  **Estrutura:** Comece com o título "**✨ Por que vocês podem dar certo?**" e depois escreva 2 parágrafos curtos.
5.  **Idioma:** A resposta DEVE ser em Português do Brasil.
6.  **Não invente:** Baseie sua análise estritamente nas informações fornecidas.

**Perfil do Usuário 1:**
USER1_PLACEHOLDER

**Perfil do Usuário 2:**
USER2_PLACEHOLDER
`;

const formatMessagesForSuggestions = (
  messages: Message[],
  currentUserId: string,
  matchName: string,
) => {
  if (messages.length === 0) {
    return 'Nenhuma conversa ainda.';
  }
  return messages
    .map((m) => `${m.senderId === currentUserId ? 'Eu' : matchName}: ${m.text}`)
    .join('\n');
};

const suggestionsPrompt = `Você é um(a) amigo(a) carismático(a) e "bom de papo", ajudando seu(sua) amigo(a) a ter conversas incríveis no aplicativo de namoro "Encontro Certo". Seu objetivo é dar duas sugestões de mensagens que soem naturais, autênticas e totalmente humanas.

**Instruções Cruciais:**
1.  **Seja Humano, Não um Robô:** As sugestões DEVEM usar linguagem casual e coloquial do Português do Brasil. Pense: "Como eu falaria com alguém que achei interessante?". Pode usar gírias leves e um tom divertido. Evite formalidades e frases que pareçam roteirizadas.
2.  **Analise o Contexto:** Olhe os perfis do seu amigo(a) e do match, e a conversa recente para dar sugestões que façam sentido.
3.  **Continue a Conversa:** Se já existe um papo, crie sugestões que se conectem com o último tópico. Uma pergunta aberta, uma piada relacionada ou um comentário inteligente são ótimos.
4.  **Quebre o Gelo (se for o início):** Se for a primeira mensagem, encontre um detalhe genuíno no perfil do match (um interesse, uma foto, um detalhe na bio) para criar um quebra-gelo único e que mostre que seu amigo(a) prestou atenção.
5.  **Formato da Saída:** Sua resposta DEVE ser um array JSON com exatamente dois objetos. Cada objeto precisa ter duas chaves:
    - "topic": Um resumo super curto e casual da ideia (máx. 3 palavras, ex: "Falar de séries", "Elogiar a foto", "Puxar papo viagem").
    - "message": A mensagem completa, pronta para enviar.

**Perfil do seu Amigo(a) (Quem está pedindo a sugestão):**
USER1_PLACEHOLDER

**Perfil do Match (Para quem a mensagem será enviada):**
USER2_PLACEHOLDER

**Conversa Recente (últimas 5 mensagens, da mais antiga para a mais recente):**
CONVERSATION_HISTORY_PLACEHOLDER
`;

export const isTextOffensive = async (text: string): Promise<boolean> => {
  if (!text || text.trim() === '') {
    return false;
  }
  try {
    const fullPrompt = moderationPrompt.replace('[TEXTO]', text);

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: fullPrompt,
    });

    const result = await response.response;
    const resultText = result.text().trim().toUpperCase();
    return resultText === 'OFENSIVO';
  } catch (error) {
    console.error('Error calling Gemini API for moderation:', error);
    return false;
  }
};

export const isImageNude = async (file: File): Promise<boolean> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const imageBase64 = await fileToBase64(file);

    const response = await fetch(apiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: 'SAFE_SEARCH_DETECTION',
              },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Erro ao chamar Google Vision API:', errorBody);
      return false;
    }

    const result = await response.json();
    const safeSearch = result.responses?.[0]?.safeSearchAnnotation;

    if (!safeSearch) {
      console.warn('Nenhuma anotação de SafeSearch encontrada. Assumindo que a imagem é segura.');
      return false;
    }

    const { adult, racy, violence } = safeSearch;
    console.log("Google Cloud Vision SafeSearch:", { adult, racy, violence });

    // Política de Tolerância Zero: Bloqueia qualquer imagem que tenha a mínima chance de ser imprópria.
    const unsafeLevels = ['UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];
    const isUnsafe =
      unsafeLevels.includes(adult) ||
      unsafeLevels.includes(racy) ||
      unsafeLevels.includes(violence);

    if (isUnsafe) {
      console.log(`Imagem sinalizada como imprópria. Adult: ${adult}, Racy: ${racy}, Violence: ${violence}`);
    }

    return isUnsafe;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Erro na moderação de imagem: Timeout de 15 segundos excedido.');
    } else {
      console.error('Erro na moderação de imagem:', error);
    }
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

export const getCompatibilityAnalysis = async (
  user1Profile: UserProfile,
  user2Profile: UserProfile,
): Promise<string> => {
  try {
    const prompt = compatibilityPrompt
      .replace('USER1_PLACEHOLDER', formatProfileForPrompt(user1Profile))
      .replace('USER2_PLACEHOLDER', formatProfileForPrompt(user2Profile));

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: prompt,
    });

    const result = await response.response;
    return result.text().trim();
  } catch (error) {
    console.error('Error calling Gemini API for compatibility analysis:', error);
    return '**✨ Por que vocês podem dar certo?**\n\nParece que vocês têm alguns interesses em comum! Explorar o que vocês compartilham pode ser um ótimo começo para uma conversa incrível.';
  }
};

export const getMessageSuggestions = async (
  currentUser: User,
  matchProfile: UserProfile,
  lastMessages: Message[],
): Promise<MessageSuggestion[]> => {
  try {
    const prompt = suggestionsPrompt
      .replace(
        'USER1_PLACEHOLDER',
        formatProfileForPrompt(currentUser.profile),
      )
      .replace('USER2_PLACEHOLDER', formatProfileForPrompt(matchProfile))
      .replace(
        'CONVERSATION_HISTORY_PLACEHOLDER',
        formatMessagesForSuggestions(
          lastMessages,
          currentUser.id,
          matchProfile.apelido,
        ),
      );

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: {
                type: Type.STRING,
                description:
                  'Um resumo curto (máx 4 palavras) da sugestão.',
              },
              message: {
                type: Type.STRING,
                description: 'A sugestão de mensagem completa para o chat.',
              },
            },
            required: ['topic', 'message'],
          },
        },
      },
    });

    const result = await response.response;
    const jsonString = result.text().trim();
    const suggestions: MessageSuggestion[] = JSON.parse(jsonString);

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      return suggestions.slice(0, 2); // Ensure only 2 are returned
    }

    throw new Error('Invalid format for suggestions');
  } catch (error) {
    console.error('Error calling Gemini API for suggestions:', error);
    // Return default suggestions on error
    return [
      {
        topic: `Papo sobre ${matchProfile.interests[0] || 'música'}`,
        message: `E aí! Vi que você gosta de ${
          matchProfile.interests[0] || 'música'
        }, qual seu artista favorito?`,
      },
      {
        topic: `Rolês em ${matchProfile.city}`,
        message: `O que você mais gosta de fazer em ${matchProfile.city}?`,
      },
    ];
  }
};