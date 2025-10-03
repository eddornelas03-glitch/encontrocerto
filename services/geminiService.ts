import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (window as any).process.env.API_KEY });

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

        const resultText = response.text.trim().toUpperCase();
        return resultText === 'OFENSIVO';
    } catch (error) {
        console.error("Error calling Gemini API for moderation:", error);
        // Fail open: if the moderation service fails, allow the content.
        // In a real production app, you might want to handle this differently.
        return false;
    }
};