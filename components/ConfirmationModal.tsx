import React from 'react';
import { AlertCircleIcon, XIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'palestra';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel = 'SIM',
  cancelLabel = 'NÃO',
  variant = 'default'
}) => {
  if (!isOpen) return null;

  // Define as classes de cor do botão de confirmação baseadas no contexto (Curso ou Palestra)
  const confirmBtnClasses = variant === 'palestra'
    ? "bg-sky-500 shadow-sky-500/30 hover:bg-sky-600"
    : "bg-primary shadow-primary/30 hover:bg-primary-dark";

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
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">
              {title}
            </h3>
            
            {message && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-1 font-bold">
                {message}
              </p>
            )}

            <div className={`flex gap-3 w-full ${!message ? 'mt-4' : ''}`}>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-[10px] ${confirmBtnClasses}`}
                >
                  {confirmLabel}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  {cancelLabel}
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
