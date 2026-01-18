
import React from 'react';
import { AlertCircleIcon, XIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel = 'Excluir'
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-5 relative animate-bounce-short">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4">
               <AlertCircleIcon className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-1">
              {message}
            </p>

            <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all transform active:scale-95"
                >
                  {confirmLabel}
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
