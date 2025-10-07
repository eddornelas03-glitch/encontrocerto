import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// 🔹 Substitua pela sua API de moderação (Gemini, OpenAI, etc.)
const GEMINI_API_KEY = "AIzaSyAP8eHdIzTuiAPT2V8tak3314g7lKNTX6c"; 

async function verificarImagemPorNudez(file: File): Promise<boolean> {
  try {
    // Converte a imagem para base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Faz a chamada à API Gemini para moderação
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Esta imagem contém nudez, conteúdo sexual ou explícito? Responda apenas com SIM ou NÃO." },
              { inline_data: { mime_type: file.type, data: base64.split(",")[1] } }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";

    // Se a resposta contém “sim”, bloqueia o upload
    return !(texto.includes("sim"));
  } catch (error) {
    console.error("Erro ao verificar nudez:", error);
    return false;
  }
}

export function useProfileEditor(userId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    if (!userId) {
      setError("Usuário não autenticado.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 🔹 Etapa 1: Verificar se contém nudez
      const permitido = await verificarImagemPorNudez(file);
      if (!permitido) {
        setError("❌ Imagem bloqueada: conteúdo impróprio detectado.");
        setLoading(false);
        return;
      }

      // 🔹 Etapa 2: Upload para o Supabase
      const fileName = `${userId}_${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
    } catch (err: any) {
      console.error("Erro no upload:", err);
      setError("Erro ao enviar imagem.");
    } finally {
      setLoading(false);
    }
  };

  return { handleImageUpload, loading, error, imageUrl };
}
