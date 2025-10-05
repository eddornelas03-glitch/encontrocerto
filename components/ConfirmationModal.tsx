import React from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <div className="bg-gray-700 rounded-2xl shadow-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 id="confirmation-title" className="text-xl font-bold text-white text-center">{title}</h2>
        <p className="text-gray-300 text-center mt-2 text-sm">{message}</p>
        <div className="flex flex-col gap-3 pt-6">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-full hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-full hover:bg-gray-500 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};