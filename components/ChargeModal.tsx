
import React from 'react';
import { CalendarEvent } from '../types';
import { WhatsAppIcon, XIcon, MessageSquareIcon, ChevronLeftIcon } from './Icons';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

const CHARGE_OPTIONS = [
  {
    id: 1,
    title: 'Opção 1 (Amigável)',
    text: 'Olá! Tudo bem? Passando para avisar sobre as parcelas do curso. Quando puder, dê uma olhadinha para deixar em dia.'
  },
  {
    id: 2,
    title: 'Opção 2 (Gentil)',
    text: 'Olá! Tudo bem? Passando para lembrar do acerto do curso. Se puder organizar em breve, eu agradeço.'
  },
  {
    id: 3,
    title: 'Opção 3 (Cronograma)',
    text: 'Olá! Passando para deixar o lembrete do nosso cronograma de pagamentos para manter tudo em ordem. Qualquer dúvida me avise.'
  },
  {
    id: 4,
    title: 'Opção 4 (Apoio)',
    text: 'Olá! Tudo bem? Te enviando esse lembrete sobre o pagamento da semana para ajudar na sua organização. Estou à disposição.'
  },
  {
    id: 5,
    title: 'Opção 5 (Aviso)',
    text: 'Olá! Tudo bem? Passando para lembrar de conferir os pagamentos. Notei que há uma pendência e vim avisar para não acumular. Me avise qualquer coisa.'
  }
];

export const ChargeModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  const handleSendWhatsApp = (text: string) => {
    // Procura o telefone no campo student ou em info adicional se disponível
    // No schema atual, o telefone costuma vir no campo 'whatsapp'
    const phone = event.whatsapp || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    
    // Se o número começar com código de país, usa ele, senão assume +55
    let finalPhone = cleanPhone;
    if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      finalPhone = '55' + cleanPhone;
    }
    
    if (finalPhone) {
      window.open(`https://wa.me/${finalPhone}?text=${encodedText}`, '_blank');
    } else {
      // Se não tiver telefone, abre o seletor do WhatsApp Web
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-surface-dark w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">Enviar Cobrança</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-primary p-1 transition-colors"><XIcon className="w-4 h-4" /></button>
        </div>

        <div className="p-4 bg-primary/5 border-b border-primary/10">
          <p className="text-[10px] font-black text-primary dark:text-primary/70 uppercase tracking-widest mb-1">Destinatário:</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white uppercase">{event.student}</p>
          {event.whatsapp && <p className="text-[10px] text-gray-500 font-medium">{event.whatsapp}</p>}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
          {CHARGE_OPTIONS.map((option) => (
            <div 
              key={option.id}
              className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl relative group hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all"
            >
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{option.title}</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">
                {option.text}
              </p>
              <button 
                onClick={() => handleSendWhatsApp(option.text)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" /> Enviar Agora
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 text-center border-t border-gray-100 dark:border-gray-800">
           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">A mensagem será aberta no WhatsApp</p>
        </div>
      </div>
    </div>
  );
};
