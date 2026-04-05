
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarEvent, CourseType, PaymentRecord, Student } from '../types';
import { XIcon, WhatsAppIcon, CheckIcon, MapPinIcon, DollarSignIcon, TrashIcon, ClockIcon, CalendarIcon, ChevronRightIcon, HomeIcon, UserIcon } from './Icons';
import { parseCurrency, formatCurrencyInput } from '../utils/currency';

// Ícone simples de envelope para o email
const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

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
  students?: Student[];
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  courseTypes, 
  initialDate, 
  initialEvent, 
  forcedModel, 
  lectureModels = [],
  students = []
}) => {
  const [studentName, setStudentName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [locationType, setLocationType] = useState<'interno' | 'externo'>('interno');
  const [eventLocation, setEventLocation] = useState(''); 
  const [paymentMethod, setPaymentMethod] = useState('Facilitado');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [durationStr, setDurationStr] = useState('1 dia'); 
  const [valueStr, setValueStr] = useState('');
  const [depositStr, setDepositStr] = useState(''); 
  const [deadlineDays, setDeadlineDays] = useState<number>(5);
  const [paymentFrequency, setPaymentFrequency] = useState<'weekly' | 'biweekly' | undefined>(undefined);
  const [localPayments, setLocalPayments] = useState<PaymentRecord[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [palestraPaymentType, setPalestraPaymentType] = useState<'SINAL' | 'TOTAL'>('SINAL');
  const [palestraType, setPalestraType] = useState<'MEU' | 'CONVIDADA'>('CONVIDADA');
  const [studentCount, setStudentCount] = useState<number>(1);
  const [includeInAnnualRevenue, setIncludeInAnnualRevenue] = useState<boolean>(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  const isPalestraMode = useMemo(() => {
    return forcedModel === 'Palestra' || (initialEvent && (initialEvent.title === 'Palestra' || initialEvent.title === 'Workshop' || lectureModels.includes(initialEvent.title)));
  }, [forcedModel, initialEvent, lectureModels]);

  const rawValue = parseCurrency(valueStr);
  const totalValue = (isPalestraMode && palestraType === 'MEU') ? rawValue * studentCount : rawValue;
  const depositValue = parseCurrency(depositStr);
  
  const totalPaid = (localPayments.reduce((acc, p) => acc + parseCurrency(p.amount), 0)) + depositValue;
  const isPaid = totalPaid >= (totalValue - 0.01) && totalValue > 0;

  // Filtragem de alunas para sugestão
  const studentSuggestions = useMemo(() => {
    if (!studentName || studentName.length < 2 || isPalestraMode) return [];
    return students.filter(s => s.name.toLowerCase().includes(studentName.toLowerCase())).slice(0, 5);
  }, [studentName, students, isPalestraMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCourseDropdown(false);
      }
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
        setShowDurationDropdown(false);
      }
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setShowStudentSuggestions(false);
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
          setEmail(initialEvent.email || '');
          setCourse(initialEvent.title || '');
          setLocationType(initialEvent.locationType || 'interno');
          setEventLocation(initialEvent.eventLocation || ''); 
          setPaymentMethod(initialEvent.paymentMethod || 'Facilitado');
          if (initialEvent.date) {
            const d = new Date(initialEvent.date);
            if (!isNaN(d.getTime())) setDateStr(d.toISOString().split('T')[0]);
          }
          setTimeStr(initialEvent.time || '00:00');
          const dStr = initialEvent.duration || '1 dia';
          setDurationStr(dStr.includes('dia') ? dStr : '1 dia');
          setValueStr(initialEvent.value ? formatCurrencyInput(initialEvent.value) : '');
          setDeadlineDays(initialEvent.paymentDeadlineDays || 5);
          setLocalPayments(initialEvent.payments || []);
          setPaymentFrequency(initialEvent.paymentFrequency);
          setDepositStr('');
          setPalestraPaymentType(initialEvent.paymentStatus === 'paid' ? 'TOTAL' : 'SINAL');
          setPalestraType(initialEvent.palestraType || 'CONVIDADA');
          setStudentCount(initialEvent.studentCount || 1);
          setIncludeInAnnualRevenue(initialEvent.includeInAnnualRevenue !== false);
      } else if (justOpened) {
          const isoDate = initialDate.toISOString().split('T')[0];
          setDateStr(isoDate);
          setStudentName('');
          setWhatsapp('');
          setEmail('');
          setCourse('');
          setLocationType('interno');
          setEventLocation('');
          setPaymentMethod(isPalestraMode ? 'Pix' : 'Facilitado');
          setPaymentFrequency(isPalestraMode ? undefined : 'weekly');
          setTimeStr('09:00');
          setDurationStr('1 dia'); 
          setValueStr('');
          setDepositStr('');
          setDeadlineDays(5);
          setLocalPayments([]);
          setPalestraPaymentType('SINAL');
          setPalestraType('CONVIDADA');
          setStudentCount(1);
          setIncludeInAnnualRevenue(true);
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
            if (selectedModel.defaultValue !== undefined) setValueStr(formatCurrencyInput(selectedModel.defaultValue));
            if (selectedModel.defaultLocation) setLocationType(selectedModel.defaultLocation);
            if (selectedModel.defaultDuration) {
                const num = parseInt(selectedModel.defaultDuration);
                setDurationStr(!isNaN(num) ? (num === 1 ? '1 dia' : `${num} dias`) : '1 dia');
            }
        }
    }
  };

  const selectStudent = (student: Student) => {
    setStudentName(student.name);
    setWhatsapp(student.phone || '');
    setEmail(student.email || '');
    setShowStudentSuggestions(false);
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
      email,
      locationType,
      eventLocation, 
      time: timeStr, 
      duration: durationStr,
      type: 'class', 
      value: rawValue, 
      paymentMethod: paymentMethod,
      paymentStatus: finalIsPaid ? 'paid' : 'pending',
      paymentDueDate: isPalestraMode ? undefined : paymentDueDate,
      paymentDeadlineDays: isPalestraMode ? undefined : deadlineDays,
      paymentFrequency: paymentMethod === 'Facilitado' ? paymentFrequency : undefined,
      payments: finalPayments,
      materials: initialEvent?.materials,
      createdAt: initialEvent?.createdAt || new Date(),
      palestraType: isPalestraMode ? palestraType : undefined,
      studentCount: (isPalestraMode && palestraType === 'MEU') ? studentCount : undefined,
      includeInAnnualRevenue: isPalestraMode ? includeInAnnualRevenue : undefined
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
                  <div className="relative" ref={studentDropdownRef}>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>{isPalestraMode ? 'Contratante/Evento *' : 'Nome da Aluna *'}</label>
                    <input 
                      type="text" 
                      required 
                      autoComplete="off"
                      value={studentName} 
                      onFocus={() => !isPalestraMode && setShowStudentSuggestions(true)}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        if (!isPalestraMode) setShowStudentSuggestions(true);
                      }} 
                      className={`w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} 
                      placeholder={isPalestraMode ? "Ex: Eventos S.A." : "Ex: Ana Silva"} 
                    />
                    
                    {showStudentSuggestions && studentSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[100] max-h-48 overflow-y-auto no-scrollbar py-2">
                             <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 mb-1">Alunas encontradas</p>
                             {studentSuggestions.map((s) => (
                                <button key={s.id} type="button" onClick={() => selectStudent(s)} className={`w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${highlightBgClass} flex items-center gap-3`} >
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><UserIcon className="w-3.5 h-3.5" /></div>
                                    <div className="flex flex-col">
                                        <span>{s.name}</span>
                                        <span className="text-[10px] text-gray-400 font-normal">{s.phone || 'Sem telefone'}</span>
                                    </div>
                                </button>
                             ))}
                        </div>
                    )}
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>WhatsApp</label>
                    <div className="relative">
                        <WhatsAppIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                        <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>E-mail</label>
                    <div className="relative">
                        <EmailIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="exemplo@email.com" />
                    </div>
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Nome do Evento *</label>
                    <button 
                        type="button" 
                        onClick={() => setShowCourseDropdown(!showCourseDropdown)} 
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none text-left transition-all font-bold`} 
                    >
                        <span className={course ? 'font-bold' : 'text-gray-400'}>{course || "Selecione..."}</span>
                        <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showCourseDropdown ? 'rotate-90' : ''}`} />
                    </button>
                    {showCourseDropdown && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[150] max-h-48 overflow-y-auto no-scrollbar py-2">
                            {(() => {
                                const options = isPalestraMode ? lectureModels : courseTypes.filter(c => c.model !== 'Palestra').map(c => c.name);
                                
                                if (options.length === 0) {
                                    return (
                                        <div className="px-4 py-3 text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nenhum modelo cadastrado</p>
                                        </div>
                                    );
                                }

                                return options.map((option) => (
                                    <button key={String(option)} type="button" onClick={() => selectCourse(String(option))} className={`w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${highlightBgClass}`} >
                                        {String(option)}
                                    </button>
                                ));
                            })()}
                        </div>
                    )}
                  </div>

                  {isPalestraMode && (
                    <div className="animate-fade-in">
                      <label className="block text-[10px] font-black text-sky-500/70 uppercase tracking-widest mb-1">Tipo de Palestra</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button" 
                          onClick={() => setPalestraType('MEU')}
                          className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${palestraType === 'MEU' ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                          Meu
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPalestraType('CONVIDADA')}
                          className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${palestraType === 'CONVIDADA' ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                          Convidada
                        </button>
                      </div>
                    </div>
                  )}

                  {!(isPalestraMode && palestraType === 'MEU') && (
                    <div className="animate-fade-in">
                      <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Quantidade de Alunas</label>
                      <select 
                        value={studentCount} 
                        onChange={(e) => setStudentCount(Number(e.target.value))}
                        className={`w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold appearance-none`}
                      >
                        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Aluna' : 'Alunas'}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Local do Evento</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button 
                            type="button" 
                            onClick={() => setLocationType('interno')} 
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                ${locationType === 'interno' ? (isPalestraMode ? 'bg-sky-500 border-sky-500 text-white shadow-md' : 'bg-primary border-primary text-white shadow-md') : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                        >
                            <HomeIcon className="w-4 h-4" /> Interno
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setLocationType('externo')} 
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                ${locationType === 'externo' ? (isPalestraMode ? 'bg-sky-500 border-sky-500 text-white shadow-md' : 'bg-primary border-primary text-white shadow-md') : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                        >
                            <MapPinIcon className="w-4 h-4" /> Externo
                        </button>
                    </div>
                    {locationType === 'externo' && (
                        <div className="relative animate-fade-in">
                            <MapPinIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                            <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="Endereço completo..." />
                        </div>
                    )}
                  </div>

                  <div className="space-y-4">
                      <div className="flex flex-col">
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Data de Início</label>
                          <div className="relative">
                              <CalendarIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                              <input type="date" required value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} />
                          </div>
                      </div>
                      <div className="flex flex-col">
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Horário</label>
                          <div className="relative">
                              <ClockIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                              <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} />
                          </div>
                      </div>
                      <div className="flex flex-col relative" ref={durationDropdownRef}>
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>Duração (Dias)</label>
                          <button type="button" onClick={() => setShowDurationDropdown(!showDurationDropdown)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none font-bold text-left transition-all`} >
                              <span className={durationStr ? 'font-bold' : 'text-gray-400'}>{durationStr}</span>
                              <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showDurationDropdown ? 'rotate-90' : ''}`} />
                          </button>
                          {showDurationDropdown && (
                              <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[150] max-h-48 overflow-y-auto no-scrollbar py-2">
                                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                                      <button key={d} type="button" onClick={() => selectDuration(d)} className={`w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${highlightBgClass}`} >
                                          {d} {d === 1 ? 'dia' : 'dias'}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {!(isPalestraMode && palestraType === 'MEU') && (
                <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isPalestraMode ? 'text-sky-500/70' : 'text-gray-400'}`}>
                              Valor {isPalestraMode ? (palestraType === 'MEU' ? 'do Curso' : 'do Cachê') : 'Total'}
                            </label>
                            <div className="relative">
                                <DollarSignIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPalestraMode ? 'text-sky-300' : 'text-gray-300'}`} />
                                <input type="text" inputMode="numeric" value={valueStr} onChange={(e) => setValueStr(formatCurrencyInput(e.target.value))} className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="0,00" />
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
                          <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Método</label>
                                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none appearance-none transition-all font-bold`} >
                                      <option value="Facilitado">Facilitado</option>
                                      <option value="Pix">Pix</option>
                                      <option value="Cartão">Cartão</option>
                                      <option value="Dinheiro">Dinheiro</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{paymentMethod === 'Facilitado' ? 'SINAL RECEBIDO' : 'VALOR RECEBIDO'}</label>
                                  <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">R$</span>
                                      <input type="text" inputMode="numeric" value={depositStr} onChange={(e) => setDepositStr(formatCurrencyInput(e.target.value))} className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRingClass} outline-none transition-all font-bold`} placeholder="0,00" />
                                  </div>
                              </div>
                          </div>

                          {paymentMethod === 'Facilitado' && (
                            <div className="pt-2 animate-fade-in">
                                <label className="block text-[10px] font-black text-primary dark:text-blue-300 uppercase tracking-widest mb-2">Frequência de Pagamento</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setPaymentFrequency('weekly')} className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${paymentFrequency === 'weekly' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Semanal</button>
                                    <button type="button" onClick={() => setPaymentFrequency('biweekly')} className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${paymentFrequency === 'biweekly' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Quinzenal</button>
                                    <button type="button" onClick={() => setPaymentFrequency(undefined)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${paymentFrequency === undefined ? 'bg-primary border-primary text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Nenhum</button>
                                </div>
                                
                                <div className="animate-fade-in mt-4">
                                  <label className="block text-[10px] font-black text-primary dark:text-blue-300 uppercase tracking-widest mb-2">Quitar até quantos dias antes?</label>
                                  <div className="flex gap-4 mb-1">
                                      {[5, 15, 0].map((d) => (
                                          <button 
                                            key={d} 
                                            type="button" 
                                            onClick={() => setDeadlineDays(d)} 
                                            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all border ${deadlineDays === d ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white dark:bg-bg-dark border-gray-100 dark:border-gray-700 text-gray-400'}`} 
                                          > 
                                            {d === 0 ? 'Nenhum' : `${d} dias`} 
                                          </button>
                                      ))}
                                  </div>
                                </div>
                            </div>
                          )}
                        </>
                    )}
                </div>
              )}

              {!(isPalestraMode && palestraType === 'MEU') && (
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="includeInAnnualRevenue"
                      checked={includeInAnnualRevenue}
                      onChange={(e) => setIncludeInAnnualRevenue(e.target.checked)}
                      className={`w-5 h-5 rounded border-gray-300 focus:ring-2 cursor-pointer flex-shrink-0 ${isPalestraMode ? 'text-sky-500 focus:ring-sky-500' : 'text-primary focus:ring-primary'}`}
                    />
                    <label htmlFor="includeInAnnualRevenue" className="text-[10px] sm:text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-widest cursor-pointer truncate">
                      Adicionar ao Faturamento Anual
                    </label>
                  </div>
                </div>
              )}

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
