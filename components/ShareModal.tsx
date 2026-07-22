
import React, { useState, useMemo } from 'react';
import { CalendarEvent, CourseType } from '../types';
import { ChevronLeftIcon, XIcon, CheckIcon, WhatsAppIcon, ShareIcon, MapPinIcon, HomeIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  courseTypes: CourseType[];
  mode?: 'schedule' | 'payment';
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event, courseTypes, mode = 'schedule' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [messageTemplate, setMessageTemplate] = useState(() => {
    return localStorage.getItem('SHARE_MESSAGE_TEMPLATE_V2') || `CONFIRMAÇÃO DE AGENDAMENTO

CURSO: {{CURSO}}
DATA: {{DATA}}
HORÁRIO: {{HORARIO}}
DURAÇÃO: {{DURACAO}}

LOCAL: {{LOCAL}}

RESUMO FINANCEIRO
* Valor Total: R$ {{TOTAL}}
* Sinal Pago: R$ {{SINAL}}
* Método: {{METODO}}
* {{STATUS_PAGAMENTO}}{{PARCELAMENTO}}

Qualquer dúvida, estou à disposição!
{{#SE_MATERIAIS}}
--------------------------------

*MATERIAIS PARA TRAZER:*
{{MATERIAIS}}
{{/SE_MATERIAIS}}`;
  });

  const [paymentTemplate, setPaymentTemplate] = useState(() => {
    return localStorage.getItem('SHARE_MESSAGE_PAYMENT_TEMPLATE_V2') || `*RESUMO FINANCEIRO*
*Valor Total:* R$ {{TOTAL}}
*Valor Pago:* R$ {{TOTAL_PAGO}}
*Restante:* R$ {{RESTANTE}}`;
  });

  const activeTemplate = mode === 'payment' ? paymentTemplate : messageTemplate;

  const courseType = useMemo(() => courseTypes.find(c => c.name === event?.title), [event, courseTypes]);

  const generateMessage = useMemo(() => {
    if (!event) return '';
    
    let formattedDate = '';

    if (event.date) {
        const dateObj = new Date(event.date);
        const daysNumbers: string[] = [];
        const duration = parseInt(event.duration) || 1;

        for (let i = 0; i < duration; i++) {
            const d = new Date(dateObj);
            d.setDate(dateObj.getDate() + i);
            daysNumbers.push(d.getDate().toString().padStart(2, '0'));
        }
        
        const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
        
        let dateString = daysNumbers.join(', ');
        if (daysNumbers.length > 1) {
            const lastIndex = dateString.lastIndexOf(', ');
            dateString = dateString.substring(0, lastIndex) + ' e ' + dateString.substring(lastIndex + 2);
        }
        
        formattedDate = `${dateString} de ${monthName}`;
    }

    const signalPaid = event.payments?.[0]?.amount || 0;
    const totalPaid = event.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
    const totalValue = event.value || 0;
    const remaining = Math.max(0, totalValue - totalPaid);
    const isPaid = remaining < 0.01;

    // Se for interno, usa o endereço do studio. Se for externo, usa o endereço cadastrado.
    let address = "";
    if (event.locationType === 'interno' || !event.locationType) {
        address = "Rua Francisco Antônio Miranda, N°58 - Guarulhos SP. Sala N°6 (Interfone n° 6)";
    } else {
        const parts = [
            event.street,
            event.number,
            event.neighborhood,
            event.city,
            event.state
        ].filter(Boolean);
        address = parts.join(', ');
        if (event.referencePoint) {
            address += ` (${event.referencePoint})`;
        }
    }

    let materialsStr = "";
    if (event.materialsText) {
        materialsStr = event.materialsText;
    } else {
        const checkedMaterials = event.materials?.filter(m => m.checked) || [];
        if (checkedMaterials.length > 0) {
            materialsStr = checkedMaterials.map(m => `• ${m.name}`).join('\n');
        }
    }

    let parcelamentoMsg = '';
    if (event.paymentFrequency && event.createdAt && !isPaid) {
        parcelamentoMsg += `\n\n*PAGAMENTO FACILITADO (${event.paymentFrequency === 'weekly' ? 'Semanal' : event.paymentFrequency === 'monthly' ? 'Mensal' : 'Quinzenal'})*\n`;
        const courseDate = event.date ? new Date(event.date) : new Date();
        courseDate.setHours(0,0,0,0);
        const deadlineDays = event.paymentDeadlineDays || 0;
        const interval = event.paymentFrequency === 'weekly' ? 7 : event.paymentFrequency === 'monthly' ? 30 : 15;
        
        const maxDate = new Date(courseDate);
        maxDate.setDate(courseDate.getDate() - deadlineDays);
        
        const startDate = new Date(event.createdAt);
        
        let i = 1;
        while (true) {
            let d = new Date(startDate);
            d.setDate(startDate.getDate() + (interval * i));
            
            let isLast = false;
            if (d.getTime() >= maxDate.getTime()) {
                d = new Date(maxDate);
                isLast = true;
            }
            
            let finalD = d;
            let hasMoreCustomDates = false;
            if (event.installmentDates) {
                const keys = Object.keys(event.installmentDates).map(Number);
                if (keys.length > 0) {
                   hasMoreCustomDates = i < Math.max(...keys);
                }
                if (event.installmentDates[i]) {
                    let dStr = event.installmentDates[i];
                    if (dStr.indexOf('T') === -1) dStr += 'T12:00:00';
                    finalD = new Date(dStr);
                }
            }
            
            if (hasMoreCustomDates) {
               isLast = false;
            }
            
            parcelamentoMsg += `• Parcela ${i}: ${finalD.toLocaleDateString('pt-BR')}\n`;
            
            if (isLast) break;
            i++;
            if (i > 50) break; 
        }
        
        parcelamentoMsg += `\nAtenção: *A quitação total do curso é de até 5 dias antes do curso, não é possível quitar no dia do curso. Em caso de cancelar a sua inscrição não será devolvido e perderá o sinal.*\n`;
    }

    let msg = activeTemplate
        .replace('{{CURSO}}', event.title || '')
        .replace('{{DATA}}', formattedDate)
        .replace('{{HORARIO}}', event.time || '')
        .replace('{{DURACAO}}', event.duration || '')
        .replace('{{LOCAL}}', address)
        .replace('{{TOTAL}}', totalValue.toFixed(2).replace('.', ','))
        .replace('{{SINAL}}', signalPaid.toFixed(2).replace('.', ','))
        .replace('{{TOTAL_PAGO}}', totalPaid.toFixed(2).replace('.', ','))
        .replace('{{RESTANTE}}', remaining.toFixed(2).replace('.', ','))
        .replace('{{METODO}}', event.paymentMethod || '-')
        .replace('{{STATUS_PAGAMENTO}}', isPaid ? 'Pagamento Quitado' : `Saldo Restante: R$ ${remaining.toFixed(2).replace('.', ',')}`)
        .replace('{{PARCELAMENTO}}', parcelamentoMsg);
        
    if (materialsStr) {
        msg = msg.replace('{{#SE_MATERIAIS}}', '').replace('{{/SE_MATERIAIS}}', '');
        msg = msg.replace('{{MATERIAIS}}', materialsStr);
    } else {
        msg = msg.replace(/\{\{#SE_MATERIAIS\}\}[\s\S]*?\{\{\/SE_MATERIAIS\}\}/g, '');
        msg = msg.replace('{{MATERIAIS}}', '');
    }
    
    // Clean up any double empty lines that might have been created
    msg = msg.replace(/\n{3,}/g, '\n\n').trim();

    return msg;
  }, [event, courseType, messageTemplate]);

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
            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-gray-200 dark:border-gray-800 shadow-sm z-10" title="Fechar"
          >
            <XIcon className="w-4 h-4" />
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

              <div className="w-full flex items-center gap-2 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                  <div className={`p-2 rounded-lg ${event.locationType === 'externo' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'}`}>
                      {event.locationType === 'externo' ? <MapPinIcon className="w-5 h-5" /> : <HomeIcon className="w-5 h-5" />}
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Local configurado</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white uppercase">{event.locationType === 'externo' ? 'Externo' : 'Interno'}</p>
                  </div>
              </div>

              <div className="w-full bg-gray-50 dark:bg-bg-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6 text-left shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pré-visualização da Mensagem</p>
                      <button 
                         onClick={() => {
                             if (isEditing) {
                                 if (mode === 'payment') {
                                     localStorage.setItem('SHARE_MESSAGE_PAYMENT_TEMPLATE_V2', paymentTemplate);
                                 } else {
                                     localStorage.setItem('SHARE_MESSAGE_TEMPLATE_V2', messageTemplate);
                                 }
                             }
                             setIsEditing(!isEditing);
                         }}
                         className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase"
                      >
                          {isEditing ? 'Salvar' : 'Editar'}
                      </button>
                  </div>
                  
                  {isEditing ? (
                      <div className="flex flex-col gap-2">
                          <textarea 
                              className="w-full min-h-[300px] p-3 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y"
                              value={activeTemplate}
                              onChange={(e) => {
                                  if (mode === 'payment') setPaymentTemplate(e.target.value);
                                  else setMessageTemplate(e.target.value);
                              }}
                          />
                      </div>
                  ) : (
                      <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">
                          {generateMessage}
                      </div>
                  )}
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
