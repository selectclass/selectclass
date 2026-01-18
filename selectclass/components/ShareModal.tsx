
import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { XIcon, CheckIcon, WhatsAppIcon, ShareIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !event) return null;

  const generateMessage = () => {
    let formattedDate = '';
    let dayOfWeek = '';

    if (event.date) {
        const dateObj = new Date(event.date);
        formattedDate = dateObj.toLocaleDateString('pt-BR');
        dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    }
    
    return `Parabéns pela sua aquisição no curso! O seu curso de ${event.title} foi agendado para o dia ${formattedDate} (${dayOfWeek}) às ${event.time}.

Nosso endereço fica na Rua Francisco Antônio Miranda, N°58 - Guarulhos SP. A nossa sala é N°6, tem um interfone do lado da porta é só pressionar o n° 6!`;
  };

  const message = generateMessage();

  const handleWhatsApp = () => {
      if (!event.whatsapp) return;
      const cleanNumber = event.whatsapp.replace(/\D/g, '');
      const finalNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
      window.open(`https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`, '_blank');
      onClose();
  };

  const handleCopyText = () => {
      navigator.clipboard.writeText(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-6 relative animate-fade-in">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors z-10"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center pt-6">
              
              <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <ShareIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Compartilhar Agendamento
                  </h2>
              </div>

              <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Pré-visualização da mensagem</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                      {message}
                  </p>
              </div>

              <div className="w-full flex gap-3">
                  <button
                      onClick={handleWhatsApp}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all transform active:scale-[0.98]"
                  >
                      <WhatsAppIcon className="w-5 h-5" />
                      <span className="text-sm">WhatsApp</span>
                  </button>
                  
                  <button
                      onClick={handleCopyText}
                      className={`flex-1 py-3 border-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                          ${isCopied 
                              ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-900/10' 
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                  >
                      {isCopied ? (
                          <> <CheckIcon className="w-5 h-5" /> <span className="text-sm">Copiado!</span> </>
                      ) : (
                          <span className="text-sm">Copiar</span>
                      )}
                  </button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};
