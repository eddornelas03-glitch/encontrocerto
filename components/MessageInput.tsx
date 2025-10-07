import React, { useState, useRef, useEffect } from 'react';
import { isTextOffensive, isImageNude } from '../services/geminiService';
import { AudioPlayer } from './AudioPlayer';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: { text?: string; audioUrl?: string; imageUrl?: string; }) => void;
}

const SendIcon = () => (
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
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 15a6 6 0 1012 0v-1.5a.75.75 0 00-1.5 0v1.5a4.5 4.5 0 01-9 0v-1.5a.75.75 0 00-1.5 0v1.5z" />
  </svg>
);

const ClipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a.75.75 0 011.06 0 2.25 2.25 0 003.182 3.182l-1.928 1.928a4.5 4.5 0 01-6.364-6.364l7.426-7.425a6 6 0 10-8.486 8.486L5.25 18.75a.75.75 0 001.06 1.06l.172-.172a4.5 4.5 0 016.364 0l1.928-1.928a2.25 2.25 0 000-3.182l-5.25-5.25a.75.75 0 00-1.06-1.06l5.25 5.25a.75.75 0 010 1.06l-1.928 1.928a2.25 2.25 0 01-3.182 0l-7.426-7.425a6 6 0 008.486-8.486l-1.575-1.575a.75.75 0 00-1.06 1.06L18.97 3.66z" clipRule="evenodd" />
    </svg>
);


const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
      clipRule="evenodd"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM12 18a.75.75 0 01.75.75V19.5a.75.75 0 01-1.5 0v-.75A.75.75 0 0112 18z"
      clipRule="evenodd"
    />
  </svg>
);

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
}) => {
  type Mode = 'text' | 'recording' | 'audioPreview' | 'imagePreview';

  const [mode, setMode] = useState<Mode>('text');
  const [isSending, setIsSending] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlToCleanUp = useRef<string | null>(null);

  useEffect(() => {
    objectUrlToCleanUp.current = audioPreviewUrl || imagePreviewUrl;
  }, [audioPreviewUrl, imagePreviewUrl]);

  useEffect(() => {
    // Component unmount cleanup
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (objectUrlToCleanUp.current) {
        URL.revokeObjectURL(objectUrlToCleanUp.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Seu navegador não suporta gravação de áudio.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioPreviewUrl(url);
        setMode('audioPreview');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setMode('recording');
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };
  
   const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsAnalyzing(true);
    setMode('text');
    
    try {
        const isNude = await isImageNude(file);
        if (isNude) {
            setError('Conteúdo impróprio detectado. Esta foto não pode ser enviada.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result as string);
            setMode('imagePreview');
        };
        reader.readAsDataURL(file);

    } catch (error) {
        console.error("Image analysis failed", error);
        setError("Ocorreu um erro ao analisar a imagem. Tente novamente.");
    } finally {
        setIsAnalyzing(false);
        e.target.value = ''; // Reset file input
    }
  };

  const resetToTextMode = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    
    setAudioPreviewUrl(null);
    setImagePreviewUrl(null);
    setRecordingTime(0);
    setMode('text');
  };
  
  const handleSend = async () => {
    setIsSending(true);
    setError('');
    
    if (mode === 'text' && value.trim() !== '') {
        const offensive = await isTextOffensive(value);
        if (offensive) {
          setError('Sua mensagem viola as diretrizes da comunidade. Seja respeitoso.');
        } else {
          onSend({ text: value });
        }
    } else if (mode === 'audioPreview' && audioPreviewUrl) {
        objectUrlToCleanUp.current = null;
        onSend({ audioUrl: audioPreviewUrl });
        setAudioPreviewUrl(null);
        setMode('text');
    } else if (mode === 'imagePreview' && imagePreviewUrl) {
        onSend({ imageUrl: imagePreviewUrl });
        setImagePreviewUrl(null);
        setMode('text');
    }
    
    setIsSending(false);
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current = null;
    }
    resetToTextMode();
  };


  const renderContent = () => {
    if (isAnalyzing) {
        return <div className="flex items-center justify-center gap-3 h-12 text-gray-400">
             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Analisando imagem...
        </div>;
    }
    
    switch (mode) {
      case 'recording':
        return (
          <div className="flex items-center justify-between gap-2 h-12">
            <button onClick={handleCancelRecording} className="text-gray-400 p-3 rounded-full hover:bg-gray-700" aria-label="Cancelar gravação"><TrashIcon /></button>
            <div className="flex items-center gap-2 text-red-400 font-mono">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>{formatTime(recordingTime)}</span>
            </div>
            <button onClick={handleStopRecording} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors" aria-label="Parar gravação"><StopIcon /></button>
          </div>
        );
      case 'audioPreview':
        return (
          <div className="flex items-center justify-between gap-2 h-12">
            <button onClick={resetToTextMode} className="text-gray-400 p-3 rounded-full hover:bg-gray-700" aria-label="Deletar gravação"><TrashIcon /></button>
            <div className="flex-grow mx-2"><AudioPlayer src={audioPreviewUrl!} /></div>
            <button onClick={handleSend} aria-label="Enviar áudio" className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"><SendIcon /></button>
          </div>
        );
      case 'imagePreview':
         return (
            <div className="flex items-center justify-between gap-2 h-12">
                <button onClick={resetToTextMode} className="text-gray-400 p-3 rounded-full hover:bg-gray-700" aria-label="Cancelar imagem"><TrashIcon /></button>
                <img src={imagePreviewUrl!} alt="Pré-visualização" className="h-10 w-10 object-cover rounded-md"/>
                <span className="text-sm text-gray-300 flex-grow px-2">Imagem pronta para envio.</span>
                <button onClick={handleSend} aria-label="Enviar imagem" className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"><SendIcon /></button>
            </div>
         );
      case 'text':
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="flex-grow">
               <div className="flex items-center gap-2 bg-gray-600 rounded-full h-12 px-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Anexar imagem" className="text-gray-400 hover:text-white p-2"><ClipIcon /></button>
                 <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    aria-label="Caixa de texto para nova mensagem"
                    className="w-full bg-transparent focus:outline-none text-white"
                    disabled={isSending}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !isSending) handleSend() }}
                  />
               </div>
              {error && <p className="text-red-500 text-xs mt-1 ml-4">{error}</p>}
            </div>
             <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/png, image/jpeg, image/webp" />

            {value.trim() ? (
              <button type="button" onClick={handleSend} disabled={isSending} aria-label="Enviar mensagem" className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"><SendIcon /></button>
            ) : (
              <button type="button" onClick={handleStartRecording} aria-label="Gravar mensagem de áudio" className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"><MicIcon /></button>
            )}
          </div>
        );
    }
  };

  return (
    <footer className="bg-gray-900 p-3 border-t border-gray-700 shrink-0">
      {renderContent()}
    </footer>
  );
};
