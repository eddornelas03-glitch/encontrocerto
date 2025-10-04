import { GoogleGenAI } from '@google/genai';
import type { UserProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: window.process.env.API_KEY });

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

export const isTextOffensive = async (text: string): Promise<boolean> => {
  if (!text || text.trim() === '') {
    return false;
  }
  try {
    const fullPrompt = moderationPrompt.replace('[TEXTO]', text);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const resultText = response.text?.trim().toUpperCase();
    return resultText === 'OFENSIVO';
  } catch (error) {
    console.error('Error calling Gemini API for moderation:', error);
    // Fail open: if the moderation service fails, allow the content.
    // In a real production app, you might want to handle this differently.
    return false;
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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error calling Gemini API for compatibility analysis:', error);
    return '**✨ Por que vocês podem dar certo?**\n\nParece que vocês têm alguns interesses em comum! Explorar o que vocês compartilham pode ser um ótimo começo para uma conversa incrível.';
  }
};
