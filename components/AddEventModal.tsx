import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarEvent, CourseType, PaymentRecord } from '../types';
import { XIcon, WhatsAppIcon, CheckIcon, MapPinIcon, DollarSignIcon, TrashIcon, ClockIcon, CalendarIcon, ChevronRightIcon } from './Icons';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>, date: Date) => void;
  courseTypes: CourseType[];
  initialDate: Date;
  initialEvent?: CalendarEvent | null;
  forcedModel?: 'Curso' | 'Palestra';
  lectureModels?: string[];
  allEvents?: CalendarEvent[];
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  courseTypes, 
  initialDate, 
  initialEvent, 
  forcedModel, 
  lectureModels = [] 
}) => {
  const [studentName, setStudentName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [course, setCourse] = useState('');
  const [eventLocation, setEventLocation] = useState(''); 
  const [paymentMethod, setPaymentMethod] = useState('Facilitado');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [durationStr, setDurationStr] = useState('1 dia'); 
  const [valueStr, setValueStr] = useState('');
  const [depositStr, setDepositStr] = useState(''); 
  const [deadlineDays, setDeadlineDays] = useState<number>(5);
  const [localPayments, setLocalPayments] = useState<PaymentRecord[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [palestraPaymentType, setPalestraPaymentType] = useState<'SINAL' | 'TOTAL'>('SINAL');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  const isPalestraMode = useMemo(() => {
    return forcedModel === 'Palestra' || (initialEvent && (initialEvent.title === 'Palestra' || initialEvent.title === 'Workshop' || lectureModels.includes(initialEvent.title)));
  }, [forcedModel, initialEvent, lectureModels]);

  const totalValue = parseFloat(valueStr.replace(',', '.')) || 0;
  const depositValue = parseFloat(depositStr.replace(',', '.')) || 0;
  
  const totalPaid = (localPayments.reduce((acc, p) => acc + (typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount))), 0)) + depositValue;
  const isPaid = totalPaid >= (totalValue - 0.01) && totalValue > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCourseDropdown(false);
      }
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
        setShowDurationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current;

    if (justOpened || (isOpen && initialEvent)) {
      if (initialEvent) {
          setStudentName(initialEvent.student || '');
          setWhatsapp(initialEvent.whatsapp || '');
          setCourse(initialEvent.title || '');
          setEventLocation(initialEvent.eventLocation || ''); 
          setPaymentMethod(initialEvent.paymentMethod || 'Facilitado');
          if (initialEvent.date) {
            const d = new Date(initialEvent.date);
            if (!isNaN(d.getTime())) setDateStr(d.toISOString().split('T')[0]);
          }
          setTimeStr(initialEvent.time || '00:00');
          const dStr = initialEvent.duration || '1 dia';
          setDurationStr(dStr.includes('dia') ? dStr : '1 dia');
          setValueStr(initialEvent.value?.toString() || '');
          setDeadlineDays(initialEvent.paymentDeadlineDays || 5);
          setLocalPayments(initialEvent.payments || []);
          setDepositStr('');
          setPalestraPaymentType(initialEvent.paymentStatus === 'paid' ? 'TOTAL' : 'SINAL');
      } else if (justOpened) {
          const isoDate = initialDate.toISOString().split('T')[0];
          setDateStr(isoDate);
          setStudentName('');
          setWhatsapp('');
          setCourse('');
          setEventLocation('');
          setPaymentMethod(isPalestraMode ? 'Pix' : 'Facilitado');
          setTimeStr('09:00');
          setDurationStr('1 dia'); 
          setValueStr('');
          setDepositStr('');
          setDeadlineDays(5);
          setLocalPayments([]);
          setPalestraPaymentType('SINAL');
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialEvent, isPalestraMode, initialDate]);

  const selectCourse = (courseName: string) => {
    setCourse(courseName);
    setShowCourseDropdown(false);
    
    if (!isPalestraMode) {
        const selectedModel = courseTypes.find(c => c.name === courseName);
        if (selectedModel) {
            if (selectedModel.defaultTime) setTimeStr(selectedModel.defaultTime);
            if (selectedModel.defaultValue !== undefined) setValueStr(selectedModel.defaultValue.toString());
            if (selectedModel.defaultDuration) {
                const num = parseInt(selectedModel.defaultDuration);
                setDurationStr(!isNaN(num) ? (num === 1 ? '1 dia' : `${num} dias`) : '1 dia');
            }
        }
    }
  };

  const selectDuration = (days: number) => {
    setDurationStr(`${days} ${days === 1 ? 'dia' : 'dias'}`);
    setShowDurationDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalPayments = [...localPayments];
    if (isPalestraMode) {
        if (palestraPaymentType === 'TOTAL' && totalValue > 0 && finalPayments.length === 0) {
            finalPayments.push({ id: Math.random().toString(), amount: totalValue, date: new Date(), method: paymentMethod });
        }
    } else if (depositValue > 0) {
        finalPayments.push({ id: Math.random().toString(), amount: depositValue, date: new Date(), method: paymentMethod });
    }
    const baseDate = new Date(dateStr + 'T12:00:00');
    if (isNaN(baseDate.getTime())) return;
    const paymentDueDate = new Date(baseDate);
    paymentDueDate.setDate(baseDate.getDate() - deadlineDays);
    const currentPaidSum = finalPayments.reduce((acc, p) => acc + p.amount, 0);
    const finalIsPaid = currentPaidSum >= (totalValue - 0.01) && totalValue > 0;

    onSave({
      title: course,
      student: studentName,
      whatsapp, 
      eventLocation, 
      time: timeStr, 
      duration: durationStr,
      type: 'class', 
      value: totalValue, 
      paymentMethod: paymentMethod,
      paymentStatus: finalIsPaid ? 'paid' : 'pending',
      paymentDueDate: isPalestraMode ? undefined : paymentDueDate,
      paymentDeadlineDays: isPalestraMode ? undefined : deadlineDays,
      payments: finalPayments,
      materials: initialEvent?.materials
    }, baseDate);
  };

  if (!isOpen) return null;
  const focusRingClass = isPalestraMode ? 'focus:ring-sky-500' : 'focus:ring-primary';
  const highlightBgClass = isPalestraMode ? 'hover:bg-sky-50' : 'hover:bg-primary/5';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <div className={`bg-[#F3F4F6] dark:bg-bg-dark w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 max-h-[90vh] overflow-y-auto no-scrollbar relative border-t-8 ${isPalestraMode ? 'border-sky-500' : 'border-primary'}`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20 transition-colors z-10 shadow-sm"><XIcon className="w-5 h-5" /></button>
          <div className="p-6 space-y-4">
            <h2 className={`text-2xl font-black mb-2 uppercase tracking-tighter ${isPalestraMode ? 'text-sky-500' : 'text-gray-800 dark:text-white'}`}>
                {initialEvent ? 'Editar Agendamento' : (isPalestraMode ? 'Agendar Palestra' : 'Novo Agendamento')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm space-y-4">
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>{isPalestraMode ? 'Contratante/Evento *' : 'Nome da Aluna *'}</label>
                    <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder={isPalestraMode ? "Ex: Eventos S.A." : "Ex: Ana Silva"} />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>WhatsApp</label>
                    <div className="relative">
                        <WhatsAppIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                        <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Nome do Evento *</label>
                    <button type="button" onClick={() => setShowCourseDropdown(!showCourseDropdown)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none text-left transition-all`} >
                        <span className={course ? 'font-bold' : 'text-gray-400'}>{course || "Selecione..."}</span>
                        <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showCourseDropdown ? 'rotate-90' : ''}`} />
                    </button>
                    {showCourseDropdown && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar py-2">
                            {(isPalestraMode ? lectureModels : courseTypes.filter(c => c.model !== 'Palestra').map(c => c.name)).map((option) => (
                                <button key={String(option)} type="button" onClick={() => selectCourse(String(option))} className={`w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${highlightBgClass}`} >
                                    {String(option)}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Local do Evento</label>
                    <div className="relative">
                        <MapPinIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                        <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="Ex: Studio, Endereço completo..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Data de Início</label>
                          <div className="relative">
                              <CalendarIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                              <input type="date" required value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={`w-full pl-9 pr-1 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all text-[11px] font-bold`} />
                          </div>
                      </div>
                      <div className="flex flex-col relative" ref={durationDropdownRef}>
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Duração (Dias)</label>
                          <button type="button" onClick={() => setShowDurationDropdown(!showDurationDropdown)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none text-[11px] font-bold text-left transition-all`} >
                              <span>{durationStr}</span>
                              <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showDurationDropdown ? 'rotate-90' : ''}`} />
                          </button>
                          {showDurationDropdown && (
                              <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar py-2">
                                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                                      <button key={d} type="button" onClick={() => selectDuration(d)} className={`w-full px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${highlightBgClass}`} >
                                          {d} {d === 1 ? 'dia' : 'dias'}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Valor {isPalestraMode ? 'do Cachê' : 'Total'}</label>
                          <div className="relative">
                              <DollarSignIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                              <input type="number" step="0.01" value={valueStr} onChange={(e) => setValueStr(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="0,00" />
                          </div>
                      </div>
                      <div className="flex flex-col">
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Horário</label>
                          <div className="relative">
                              <ClockIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                              <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className={`w-full pl-9 pr-1 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all text-[11px] font-bold`} />
                          </div>
                      </div>
                  </div>
                  {isPalestraMode ? (
                      <div className="space-y-3">
                          <div>
                              <label className="block text-[10px] font-black text-sky-500/70 uppercase tracking-widest mb-1">Tipo de Pagamento</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <button type="button" onClick={() => setPalestraPaymentType('SINAL')} className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${palestraPaymentType === 'SINAL' ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Sinal</button>
                                  <button type="button" onClick={() => setPalestraPaymentType('TOTAL')} className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${palestraPaymentType === 'TOTAL' ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Total</button>
                              </div>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-sky-500/70 uppercase tracking-widest mb-1">Método</label>
                              <div className="flex gap-2">
                                  {['Pix', 'Cartão', 'Dinheiro'].map(method => (
                                      <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${paymentMethod === method ? 'bg-sky-500 border-sky-500 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`} > {method} </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <>
                        {paymentMethod === 'Facilitado' && (
                          <div className="pt-1">
                              <label className="block text-[10px] font-black text-primary dark:text-blue-300 uppercase tracking-widest mb-3">Quitar até quantos dias antes?</label>
                              <div className="flex gap-4 mb-3">
                                  {[5, 10, 15].map((d) => (
                                      <button key={d} type="button" onClick={() => setDeadlineDays(d)} className={`w-11 h-11 rounded-full font-black text-xs transition-all border-2 ${deadlineDays === d ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white dark:bg-bg-dark border-gray-100 dark:border-gray-700 text-gray-400'}`} > {d} </button>
                                  ))}
                              </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{paymentMethod === 'Facilitado' ? 'SINAL RECEBIDO' : 'VALOR RECEBIDO'}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">R$</span>
                                    <input type="number" step="0.01" value={depositStr} onChange={(e) => setDepositStr(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="0,00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Método</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none appearance-none transition-all font-bold`} >
                                    <option value="Facilitado">Facilitado</option>
                                    <option value="Pix">Pix</option>
                                    <option value="Cartão">Cartão</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                </select>
                            </div>
                        </div>
                      </>
                  )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 px-4 rounded-2xl bg-white dark:bg-surface-dark text-gray-500 font-black shadow-sm hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px] border border-gray-100 dark:border-gray-700">Cancelar</button>
                <button type="submit" className={`flex-1 py-4 px-4 rounded-2xl text-white font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-[10px] ${isPalestraMode ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/30' : 'bg-primary hover:bg-primary-dark shadow-primary/30'}`}> CONFIRMAR </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
