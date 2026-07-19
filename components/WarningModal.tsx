
import React from 'react';
import { AlertCircleIcon, ChevronLeftIcon, XIcon } from './Icons';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const WarningModal: React.FC<WarningModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-5 relative animate-bounce-short border-t-4 border-red-500">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-gray-200 dark:border-gray-800 shadow-sm z-10" title="Fechar"
          >
            <XIcon className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4">
               <AlertCircleIcon className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-2">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gray-800 dark:bg-gray-700 text-white font-bold hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors shadow-lg"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
