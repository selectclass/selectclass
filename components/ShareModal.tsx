
import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { XIcon, CheckIcon, WhatsAppIcon, ShareIcon, MapPinIcon, HomeIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [locationMode, setLocationMode] = useState<'studio' | 'external'>('studio');

  const generateMessage = useMemo(() => {
    if (!event) return '';

    let formattedDate = '';
    let dayOfWeek = '';

    if (event.date) {
        const dateObj = new Date(event.date);
        formattedDate = dateObj.toLocaleDateString('pt-BR');
        dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    }

    // O sinal geralmente é o primeiro pagamento lançado
    const signalPaid = event.payments?.[0]?.amount || 0;
    const totalPaid = event.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
    const totalValue = event.value || 0;
    const remaining = Math.max(0, totalValue - totalPaid);
    const isPaid = remaining < 0.01;

    const address = locationMode === 'studio' 
      ? "Rua Francisco Antônio Miranda, N°58 - Guarulhos SP. Sala N°6 (Interfone n° 6)"
      : (event.eventLocation || "Local a definir");

    // Construção da Mensagem
    let msg = `✨ *CONFIRMAÇÃO DE AGENDAMENTO* ✨\n\n`;
    
    msg += `📚 *CURSO:* ${event.title}\n`;
    msg += `📅 *DATA:* ${formattedDate} (${dayOfWeek})\n`;
    msg += `⏰ *HORÁRIO:* ${event.time}\n`;
    msg += `⏳ *DURAÇÃO:* ${event.duration}\n\n`;

    msg += `📍 *LOCAL:* ${address}\n\n`;

    msg += `💰 *RESUMO FINANCEIRO*\n`;
    msg += `• Valor Total: R$ ${totalValue.toFixed(2).replace('.', ',')}\n`;
    msg += `• Sinal Pago: *R$ ${signalPaid.toFixed(2).replace('.', ',')}*\n`;
    msg += `• Método: ${event.paymentMethod}\n`;
    
    if (!isPaid) {
        msg += `• Saldo Restante: *R$ ${remaining.toFixed(2).replace('.', ',')}*\n`;
    } else {
        msg += `• Status: *PAGAMENTO QUITADO* ✅\n`;
    }

    // Adiciona Cronograma se for Facilitado
    if (event.paymentFrequency && event.createdAt && !isPaid) {
        msg += `\n📅 *PAGAMENTO FACILITADO (${event.paymentFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'})*\n`;
        const startDate = new Date(event.createdAt);
        const interval = event.paymentFrequency === 'weekly' ? 7 : 15;
        for (let i = 1; i <= 4; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + (interval * i));
            msg += `• Parcela ${i}: ${d.toLocaleDateString('pt-BR')}\n`;
        }
    }

    msg += `\nQualquer dúvida, estou à disposição! 🌸`;

    return msg;
  }, [event, locationMode]);

  if (!isOpen || !event) return null;

  const handleWhatsApp = () => {
      if (!event.whatsapp) return;
      const cleanNumber = event.whatsapp.replace(/\D/g, '');
      const finalNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
      window.open(`https://wa.me/${finalNumber}?text=${encodeURIComponent(generateMessage)}`, '_blank');
      onClose();
  };

  const handleCopyText = () => {
      navigator.clipboard.writeText(generateMessage);
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
        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors z-10"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center pt-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShareIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                      Enviar Resumo
                  </h2>
              </div>

              {/* Seletor de Localização */}
              <div className="w-full grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => setLocationMode('studio')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${locationMode === 'studio' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}
                  >
                      <HomeIcon className="w-4 h-4" /> Meu Studio
                  </button>
                  <button 
                    onClick={() => setLocationMode('external')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${locationMode === 'external' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}
                  >
                      <MapPinIcon className="w-4 h-4" /> Local Externo
                  </button>
              </div>

              <div className="w-full bg-gray-50 dark:bg-bg-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6 text-left shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Pré-visualização WhatsApp</p>
                  <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">
                      {generateMessage}
                  </div>
              </div>

              <div className="w-full flex gap-3">
                  <button
                      onClick={handleWhatsApp}
                      className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all transform active:scale-[0.98]"
                  >
                      <WhatsAppIcon className="w-5 h-5" />
                      WhatsApp
                  </button>
                  
                  <button
                      onClick={handleCopyText}
                      className={`flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2
                          ${isCopied 
                              ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-900/10' 
                              : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                  >
                      {isCopied ? (
                          <> <CheckIcon className="w-5 h-5" /> Copiado </>
                      ) : (
                          "Copiar"
                      )}
                  </button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};
