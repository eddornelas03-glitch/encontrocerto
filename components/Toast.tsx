import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Fecha automaticamente após 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white font-semibold z-50 transition-all duration-300 animate-fade-in-down";
  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {message}
    </div>
  );
};