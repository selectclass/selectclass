
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarEvent, CourseType, MaterialItem, LectureModel } from '../types';
import { TrashIcon, ShareIcon, PencilIcon, AlertCircleIcon, PlusIcon, CalendarIcon, MapPinIcon, WhatsAppIcon, ClockIcon, BoxIcon, CheckIcon, XIcon, MailIcon } from './Icons';
import { formatCurrencyInput, parseCurrency } from '../utils/currency';

interface EventListProps {
  date: Date;
  events: CalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onAddPayment: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onSaveEvent?: (eventData: Partial<CalendarEvent>, date: Date) => void;
  onToggleMaterial?: (eventId: string, materialId: string) => void;
  onQuickAddMaterial?: (eventId: string, name: string, cost: number) => void;
  onUpdateMaterial?: (eventId: string, materialId: string, name: string, cost: number) => void;
  onRemoveMaterial?: (eventId: string, materialId: string, materialName: string) => void;
  onShareEvent?: (event: CalendarEvent) => void;
  onToggleAbate?: (eventId: string) => void;
  onQuickInstallmentPaid?: (event: CalendarEvent, installment: number) => void;
  onDirectInstallmentPaid?: (event: CalendarEvent, installment: number) => void;
  onChangeInstallmentDate?: (event: CalendarEvent, installment: number, newDate: string) => void;
  onShareFinancialSummary?: (event: CalendarEvent) => void;
  onAddDailyMaterial?: (name: string, cost: number, eventsList: CalendarEvent[]) => void;
  onAddAllChecklistToEvent?: (eventId: string, matsToAdd: {name: string, cost: number}[]) => void;
  onEditDailyMaterial?: (oldName: string, newName: string, cost: number, eventsList: CalendarEvent[]) => void;
  onDeleteDailyMaterial?: (name: string, eventsList: CalendarEvent[]) => void;
  courseTypes?: CourseType[];
  lectureModels?: LectureModel[];
  hideCount?: boolean;
  allEvents?: CalendarEvent[];
  highlightEventId?: string | null;
  filterMode?: 'cursos' | 'palestras';
}

export const EventList: React.FC<EventListProps> = ({ 
  date, 
  events, 
  onDeleteEvent, 
  onAddPayment, 
  onEditEvent, 
  onToggleMaterial, 
  onQuickAddMaterial,
  onRemoveMaterial,
  onShareEvent, 
  onToggleAbate,
  onUpdateMaterial,
  onQuickInstallmentPaid,
  onDirectInstallmentPaid,
  onChangeInstallmentDate,
  onShareFinancialSummary,
  onAddDailyMaterial,
  onAddAllChecklistToEvent,
  onEditDailyMaterial,
  onDeleteDailyMaterial,
  courseTypes = [],
  lectureModels = [],
  hideCount = false,
  allEvents = [],
  highlightEventId = null,
  filterMode = 'cursos'
}) => {
  const [quickMaterialName, setQuickMaterialName] = useState<{ [key: string]: string }>({});
  const [quickMaterialCost, setQuickMaterialCost] = useState<{ [key: string]: string }>({});
  const [editingMaterialId, setEditingMaterialId] = useState<{ [key: string]: string | null }>({});
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [installmentChoice, setInstallmentChoice] = useState<{eventId: string, installment: number} | null>(null);
  const [isDailyChecklistOpen, setIsDailyChecklistOpen] = useState(false);
  const [isAddingAllToStudentOpen, setIsAddingAllToStudentOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [dailyMaterialInput, setDailyMaterialInput] = useState('');
  const [dailyMaterialCostInput, setDailyMaterialCostInput] = useState('');
  const [editingDailyMaterialName, setEditingDailyMaterialName] = useState<string | null>(null);
  const [editingDailyInput, setEditingDailyInput] = useState('');
  const [editingDailyCostInput, setEditingDailyCostInput] = useState('');
  
  // Reset activeGroup when filterMode changes
  useEffect(() => {
    setActiveGroup('all');
  }, [filterMode]);
  
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const lastScrolledRef = useRef<{ id: string | null; date: string | null }>({ id: null, date: null });

  const checkIfPalestra = (evt: CalendarEvent) => {
    const courseConfig = courseTypes.find(c => c.name === evt.title);
    return courseConfig?.model === 'Palestra' || 
           evt.title === 'Palestra' || 
           evt.title === 'Workshop' || 
           lectureModels.some(m => m.name === evt.title);
  };

  const handleCopyEmail = (email: string, eventId: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(eventId);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Efeito para rolar até o dia selecionado no calendário ou evento destacado
  useEffect(() => {
    const dateKey = date.toISOString().split('T')[0];
    
    // Se temos um destaque, rolamos para ele apenas UMA vez
    if (highlightEventId) {
      if (lastScrolledRef.current.id === highlightEventId) return;
      
      const targetEvent = events.find(e => e.id === highlightEventId);
      if (targetEvent) {
        lastScrolledRef.current.id = highlightEventId;
        lastScrolledRef.current.date = dateKey; // Marca como rolado para esta data também

        const isPal = checkIfPalestra(targetEvent);
        const baseValue = parseCurrency(targetEvent.value) || 0;
        const totalValue = (isPal && targetEvent.palestraType === 'MEU') ? baseValue * (targetEvent.studentCount || 1) : baseValue;
        const totalPaid = (targetEvent.payments || []).reduce((acc, p) => acc + parseCurrency(p.amount), 0);
        const isPaid = (totalValue - totalPaid) < 0.01 && totalValue > 0;

        let group: 'zero' | 'partial' | 'paid' = 'zero';
        if (isPaid) {
          group = 'paid';
        } else if (!isPal && targetEvent.paymentMethod === 'Facilitado') {
          if ((targetEvent.payments || []).length <= 1) {
            group = 'zero';
          } else {
            group = 'partial';
          }
        } else {
          if (totalPaid > 0) {
            group = 'partial';
          } else {
            group = 'zero';
          }
        }

        // Expand the group
        setActiveGroup(group);

        // Small delay to allow expansion to render
        setTimeout(() => {
          const targetElement = eventRefs.current[highlightEventId];
          if (targetElement) {
            const headerHeight = 80;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: elementPosition - headerHeight,
              behavior: 'smooth'
            });
          }
        }, 150);
      }
    } else {
      // Se não tem destaque, rolamos para a data apenas se ela mudou
      if (lastScrolledRef.current.date === dateKey) return;
      
      const targetElement = eventRefs.current[dateKey];
      if (targetElement) {
        lastScrolledRef.current.date = dateKey;
        lastScrolledRef.current.id = null; // Reseta o ID de destaque quando muda a data manualmente

        const headerHeight = 80;
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [date, highlightEventId, events]);

  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  const year = date.getFullYear();
  const formattedFullDate = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} de ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;

  const handleQuickAdd = (eventId: string) => {
    const name = quickMaterialName[eventId];
    const cost = parseCurrency(quickMaterialCost[eventId] || '0');
    const materialId = editingMaterialId[eventId];

    if (name) {
      if (materialId && onUpdateMaterial) {
        onUpdateMaterial(eventId, materialId, name, cost);
      } else if (onQuickAddMaterial) {
        onQuickAddMaterial(eventId, name, cost);
      }
      
      setQuickMaterialName({ ...quickMaterialName, [eventId]: '' });
      setQuickMaterialCost({ ...quickMaterialCost, [eventId]: '' });
      setEditingMaterialId({ ...editingMaterialId, [eventId]: null });
    }
  };

  const toggleGroup = (group: string) => {
    setActiveGroup(group);
  };

  const groupedEvents = useMemo(() => {
    const groups = {
      zero: [] as CalendarEvent[],
      partial: [] as CalendarEvent[],
      paid: [] as CalendarEvent[]
    };

    events.forEach(evt => {
      const isPal = checkIfPalestra(evt);
      const baseValue = parseCurrency(evt.value) || 0;
      const totalValue = (isPal && evt.palestraType === 'MEU') ? baseValue * (evt.studentCount || 1) : baseValue;
      const totalPaid = (evt.payments || []).reduce((acc, p) => acc + parseCurrency(p.amount), 0);
      const isPaid = (totalValue - totalPaid) < 0.01 && totalValue > 0;

      if (isPaid) {
        groups.paid.push(evt);
      } else if (!isPal && evt.paymentMethod === 'Facilitado') {
        // Para Facilitado: se tem 0 ou 1 pagamento (apenas o sinal), cai em "Nenhum Pagamento"
        // Pagamento Parcial só aparece se tiver dado algo ALÉM do sinal (mais de 1 registro)
        if ((evt.payments || []).length <= 1) {
          groups.zero.push(evt);
        } else {
          groups.partial.push(evt);
        }
      } else {
        // Lógica padrão para outros casos
        if (totalPaid > 0) {
          groups.partial.push(evt);
        } else {
          groups.zero.push(evt);
        }
      }
    });

    return groups;
  }, [events, courseTypes, lectureModels]);

  const dailyMaterialsReport = useMemo(() => {
    if (filterMode === 'palestras') return [];
    
    const uniqueMats = new Map<string, {name: string, maxCost: number}>();
    const validEvents = events.filter(e => !checkIfPalestra(e));

    validEvents.forEach(e => {
        (e.materials || []).forEach(m => {
            const key = m.name.toLowerCase().trim();
            const existing = uniqueMats.get(key);
            if (!existing || ((m.cost || 0) > existing.maxCost)) {
                uniqueMats.set(key, { name: m.name, maxCost: m.cost || 0 });
            }
        });
    });

    const report: { 
        name: string, 
        cost: number, 
        notAssignedEvents: CalendarEvent[], 
        notBoughtEvents: CalendarEvent[] 
    }[] = [];

    uniqueMats.forEach((val, key) => {
        const notAssigned: CalendarEvent[] = [];
        const notBought: CalendarEvent[] = [];
        
        validEvents.forEach(e => {
            const mat = (e.materials || []).find(m => m.name.toLowerCase().trim() === key);
            if (!mat) {
                notAssigned.push(e);
            } else {
                if (!mat.checked) { // Checked now means bought according to user
                    notBought.push(e);
                }
            }
        });
        
        report.push({
            name: val.name,
            cost: val.maxCost,
            notAssignedEvents: notAssigned,
            notBoughtEvents: notBought
        });
    });
    
    return report.sort((a, b) => a.name.localeCompare(b.name));
  }, [events, filterMode, courseTypes, lectureModels]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center opacity-60 mt-10">
        <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
          <CalendarIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Agenda livre para {formattedFullDate}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-32">
      <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1 text-center">
        {formattedFullDate}
      </h3>
      {!hideCount && filterMode === 'cursos' && (
        <div className="mb-8 space-y-3">
          <div className="text-[14px] font-black text-primary dark:text-blue-300 uppercase tracking-[0.2em] mb-4 text-center">
            {events.length} {events.length === 1 ? 'Agendamento' : 'Agendamentos'}
          </div>
          
          <div className="grid grid-cols-4 gap-1.5 px-1">
            <button 
              onClick={() => toggleGroup('all')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${activeGroup === 'all' ? 'bg-primary/10 border-primary/30' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] mb-1 ${activeGroup === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                {events.length}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter text-center leading-tight ${activeGroup === 'all' ? 'text-primary dark:text-blue-300' : 'text-gray-500'}`}>
                Todos
              </span>
            </button>

            <button 
              onClick={() => toggleGroup('zero')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${activeGroup === 'zero' ? 'bg-primary/10 border-primary/30' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] mb-1 ${activeGroup === 'zero' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                {groupedEvents.zero.length}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter text-center leading-tight ${activeGroup === 'zero' ? 'text-primary dark:text-blue-300' : 'text-gray-500'}`}>
                Sinal
              </span>
            </button>

            <button 
              onClick={() => toggleGroup('partial')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${activeGroup === 'partial' ? 'bg-primary/10 border-primary/30' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] mb-1 ${activeGroup === 'partial' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                {groupedEvents.partial.length}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter text-center leading-tight ${activeGroup === 'partial' ? 'text-primary dark:text-blue-300' : 'text-gray-500'}`}>
                Parcial
              </span>
            </button>

            <button 
              onClick={() => toggleGroup('paid')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${activeGroup === 'paid' ? 'bg-primary/10 border-primary/30' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] mb-1 ${activeGroup === 'paid' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                {groupedEvents.paid.length}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter text-center leading-tight ${activeGroup === 'paid' ? 'text-primary dark:text-blue-300' : 'text-gray-500'}`}>
                Pago
              </span>
            </button>
          </div>

          {/* CHECKLIST DO DIA VERIFICATION */}
          {(() => {
            const hasMissingMaterials = dailyMaterialsReport.some(m => m.notAssignedEvents.length > 0);
            
            let headerClasses = "text-[11px] font-black uppercase p-4 flex items-center justify-between cursor-pointer transition-colors duration-500 ";
            let headerText = "Checklist do Dia";
            let iconColor = "";

            if (!isDailyChecklistOpen && hasMissingMaterials) {
              headerClasses += "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]";
              headerText = "MATERIAIS PENDENTES";
              iconColor = "text-white";
            } else {
              headerClasses += "text-primary dark:text-blue-300";
            }

            return (
              <div className="mt-8 bg-blue-50 dark:bg-surface-dark border border-blue-100 dark:border-blue-900/30 rounded-xl shadow-sm mx-1 overflow-hidden transition-all duration-300">
                <h4 
                  className={headerClasses}
                  onClick={() => setIsDailyChecklistOpen(!isDailyChecklistOpen)}
                >
                  <div className="flex items-center gap-1">
                     <BoxIcon className={`w-4 h-4 ${iconColor}`} /> {headerText}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${(!isDailyChecklistOpen && hasMissingMaterials) ? 'bg-black/20 text-white' : 'text-gray-400 bg-white dark:bg-black/20'}`}>
                    {isDailyChecklistOpen ? 'OCULTAR' : 'MOSTRAR'}
                  </span>
                </h4>
                
                {isDailyChecklistOpen && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-2 mb-4">
                   <div className="flex flex-col sm:flex-row gap-2">
                     <input
                       type="text"
                       placeholder="Nome do Material..."
                       className="w-full sm:flex-[2] bg-white dark:bg-black/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                       value={dailyMaterialInput}
                       onChange={(e) => setDailyMaterialInput(e.target.value)}
                     />
                     <input
                       type="tel"
                       placeholder="R$ 0,00"
                       className="w-full sm:flex-[1] bg-white dark:bg-black/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                       value={dailyMaterialCostInput}
                       onChange={(e) => setDailyMaterialCostInput(formatCurrencyInput(e.target.value))}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && dailyMaterialInput.trim() && onAddDailyMaterial) {
                           onAddDailyMaterial(dailyMaterialInput.trim(), parseCurrency(dailyMaterialCostInput), events);
                           setDailyMaterialInput('');
                           setDailyMaterialCostInput('');
                         }
                       }}
                     />
                     <button
                       onClick={() => {
                         if (dailyMaterialInput.trim() && onAddDailyMaterial) {
                           onAddDailyMaterial(dailyMaterialInput.trim(), parseCurrency(dailyMaterialCostInput), events);
                           setDailyMaterialInput('');
                           setDailyMaterialCostInput('');
                         }
                       }}
                       className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow hover:bg-primary-dark transition-colors"
                     >
                       Adicionar
                     </button>
                   </div>
                   
                   {/* Botão de adicionar todos os materiais em uma aluna e Dropdown */}
                   <div className="mt-1 text-center relative max-w-sm ml-auto mr-auto">
                      <button 
                        onClick={() => setIsAddingAllToStudentOpen(!isAddingAllToStudentOpen)}
                        className="w-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-3 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                         <PlusIcon className="w-3.5 h-3.5" /> Adicionar CHECKLIST COMPLETO EM ALUNA
                      </button>

                      {isAddingAllToStudentOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                           {events.filter(e => !checkIfPalestra(e)).length === 0 ? (
                             <div className="p-3 text-[10px] text-gray-400 font-medium">Nenhuma aluna de curso neste dia.</div>
                           ) : (
                             events.filter(e => !checkIfPalestra(e)).map(studentEvent => (
                               <button 
                                 key={studentEvent.id} 
                                 onClick={() => {
                                   if (onAddAllChecklistToEvent) {
                                      const matsToAdd = dailyMaterialsReport
                                        .filter(m => !studentEvent.materials?.some(item => item.name.toLowerCase().trim() === m.name.toLowerCase().trim()))
                                        .map(m => ({ name: m.name, cost: m.cost }));
                                      
                                      if (matsToAdd.length > 0) {
                                        onAddAllChecklistToEvent(studentEvent.id, matsToAdd);
                                      }
                                   }
                                   setIsAddingAllToStudentOpen(false);
                                 }}
                                 className="w-full text-left p-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
                               >
                                 <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{studentEvent.student || 'Sem nome'}</span>
                                 <PlusIcon className="w-3 h-3 text-emerald-500" />
                               </button>
                             ))
                           )}
                        </div>
                      )}
                   </div>
                </div>

                {dailyMaterialsReport.length > 0 ? (
                  <div className="space-y-3">
                    {dailyMaterialsReport.map((m, idx) => {
                      const isEditing = editingDailyMaterialName === m.name;
                      return (
                        <div key={idx} className="flex flex-col gap-1.5 border-b border-blue-100 dark:border-blue-900/40 last:border-0 pb-3 last:pb-0">
                          {materialToDelete === m.name ? (
                             <div className="flex flex-col gap-2 p-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded">
                               <p className="text-[10px] font-bold text-red-600 dark:text-red-400">Tem certeza que deseja excluir de todas as alunas?</p>
                               <div className="flex gap-2">
                                 <button onClick={() => setMaterialToDelete(null)} className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded px-2 py-1 text-[9px] font-bold uppercase transition-colors hover:bg-gray-300">Cancelar</button>
                                 <button onClick={() => { 
                                   if(onDeleteDailyMaterial) onDeleteDailyMaterial(m.name, events);
                                   setMaterialToDelete(null);
                                 }} className="flex-1 bg-red-500 text-white rounded px-2 py-1 text-[9px] font-bold uppercase transition-colors hover:bg-red-600">Sim, excluir</button>
                               </div>
                             </div>
                          ) : isEditing ? (
                            <div className="flex flex-col gap-2 p-2 bg-blue-50/50 dark:bg-black/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                 type="text"
                                 className="w-full sm:flex-[2] bg-white dark:bg-black/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                                 value={editingDailyInput}
                                 onChange={(e) => setEditingDailyInput(e.target.value)}
                                />
                                <input
                                 type="text"
                                 className="w-full sm:flex-[1] bg-white dark:bg-black/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                                 value={editingDailyCostInput}
                                 onChange={(e) => setEditingDailyCostInput(formatCurrencyInput(e.target.value))}
                                />
                              </div>
                              <div className="flex gap-2 w-full mt-1">
                                <button onClick={() => setEditingDailyMaterialName(null)} className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-[10px] font-black hover:bg-gray-300 uppercase transition-colors shadow-sm">Cancelar</button>
                                <button onClick={() => {
                                  if(onEditDailyMaterial) onEditDailyMaterial(m.name, editingDailyInput, parseCurrency(editingDailyCostInput), events);
                                  setEditingDailyMaterialName(null);
                                }} className="flex-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-[10px] font-black hover:bg-emerald-600 uppercase transition-colors shadow-sm">Salvar</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center group">
                              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                                {m.name} 
                                <span className="text-[9px] font-black text-primary/70 bg-primary/10 px-1.5 rounded-full">R$ {m.cost.toFixed(2).replace('.', ',')}</span>
                              </span>
                              <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => {
                                   setEditingDailyMaterialName(m.name);
                                   setEditingDailyInput(m.name);
                                   setEditingDailyCostInput(formatCurrencyInput(m.cost.toFixed(2).replace('.', ',')));
                                 }} className="text-gray-400 hover:text-blue-500 px-1">
                                   <PencilIcon className="w-3 h-3" />
                                 </button>
                                 <button onClick={() => setMaterialToDelete(m.name)} className="text-gray-400 hover:text-red-500 px-1">
                                   <TrashIcon className="w-3 h-3" />
                                 </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Display Status */}
                          <div className="flex flex-col gap-0.5 mt-0.5">
                             {m.notAssignedEvents.length > 0 ? (
                               <div className="flex flex-col items-start gap-1 mt-1">
                                  <span className="text-[9px] font-black text-red-500 uppercase tracking-tight">
                                    Não adicionado em: {m.notAssignedEvents.map(e => e.student || 'Sem nome').join(', ')}
                                  </span>
                                  <button onClick={() => onAddDailyMaterial && onAddDailyMaterial(m.name, m.cost, m.notAssignedEvents)} className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase hover:bg-emerald-200 transition-colors">
                                    + ADICIONAR NESTAS ALUNAS
                                  </button>
                               </div>
                             ) : (
                               <div className="mt-1">
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight flex items-center gap-1">
                                   <CheckIcon className="w-2.5 h-2.5" /> Adicionado em todas
                                 </span>
                               </div>
                             )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                   <p className="text-[10px] text-gray-400 font-medium mt-2">Nenhum material listado para este dia.</p>
                )}
              </div>
            )}
          </div>
         );
       })()}
       </div>
      )}

      <div className="space-y-8">
        {(hideCount || filterMode === 'palestras' ? events : (
          activeGroup === 'all' ? events : (groupedEvents[activeGroup as keyof typeof groupedEvents] || [])
        )).map((evt, index) => {
          const isPalestra = checkIfPalestra(evt);
          const baseValue = parseCurrency(evt.value) || 0;
          const courseValue = (isPalestra && evt.palestraType === 'MEU') 
            ? baseValue * (evt.studentCount || 1) 
            : baseValue;
          const dateKey = evt.date ? new Date(evt.date).toISOString().split('T')[0] : '';

          const payments = evt.payments || [];
          const totalPaid = payments.reduce((acc, p) => acc + parseCurrency(p.amount), 0);
          const remaining = Math.max(0, courseValue - totalPaid);
          const isPaid = remaining < 0.01 && courseValue > 0; 

          const materials = evt.materials || [];
          const totalMaterialCost = materials.reduce((acc, m) => acc + parseCurrency(m.cost), 0);
          const finalLiquid = courseValue - totalMaterialCost;

          const today = new Date();
          today.setHours(0,0,0,0);
          const courseDate = evt.date ? new Date(evt.date) : new Date();
          courseDate.setHours(0,0,0,0);
          
          // Cálculo do cronograma de pagamento
          const scheduleDates: Date[] = [];
          if (!isPalestra && evt.paymentFrequency && evt.createdAt) {
            const startDate = new Date(evt.createdAt);
            const deadlineDays = evt.paymentDeadlineDays || 0;
            const interval = evt.paymentFrequency === 'weekly' ? 7 : 15;
            
            const maxDate = new Date(courseDate);
            maxDate.setDate(courseDate.getDate() - deadlineDays);
            
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
              if (evt.installmentDates && evt.installmentDates[i]) {
                let dStr = evt.installmentDates[i];
                if (dStr.indexOf('T') === -1) {
                  dStr += 'T12:00:00';
                }
                finalD = new Date(dStr);
              }
              
              scheduleDates.push(finalD);
              if (isLast) break;
              i++;
              if (i > 50) break; // limite de segurança
            }
          }

          const hasPendingInstallmentNear = scheduleDates.some((d, i) => {
            const isPaidInstallment = evt.payments?.some(p => p.installment === i + 1);
            if (isPaidInstallment) return false;
            
            const installmentDate = new Date(d);
            installmentDate.setHours(0,0,0,0);
            const diff = installmentDate.getTime() - today.getTime();
            
            // Se for a última parcela, usa regra de 1 dia
            if (i === scheduleDates.length - 1) return diff <= (1 * 24 * 60 * 60 * 1000);
            // Para as demais, a regra de 1 dia aqui é apenas para o "deadlineDisplay"
            return diff <= (1 * 24 * 60 * 60 * 1000);
          });

          const isLastInstallmentNear = scheduleDates.length > 0 && (() => {
            const lastIdx = scheduleDates.length - 1;
            const isPaidLast = evt.payments?.some(p => p.installment === lastIdx + 1);
            if (isPaidLast) return false;
            const lastDate = new Date(scheduleDates[lastIdx]);
            lastDate.setHours(0,0,0,0);
            return (lastDate.getTime() - today.getTime()) <= (1 * 24 * 60 * 60 * 1000);
          })();

          const isCourseDateNear = (courseDate.getTime() - today.getTime()) <= (1 * 24 * 60 * 60 * 1000);

          const isCloseOrOverdue = !isPalestra && !isPaid && (
            isCourseDateNear || isLastInstallmentNear
          );
          const waLink = evt.whatsapp ? `https://wa.me/${evt.whatsapp.replace(/\D/g, '')}` : '#';

          let deadlineDisplay = '';
          let isNearDeadline = isCloseOrOverdue;

          if (hasPendingInstallmentNear) {
            const nextDue = scheduleDates.find((d, i) => {
              const isPaidInstallment = evt.payments?.some(p => p.installment === i + 1);
              if (isPaidInstallment) return false;
              const installmentDate = new Date(d);
              installmentDate.setHours(0,0,0,0);
              return (installmentDate.getTime() - today.getTime()) <= (1 * 24 * 60 * 60 * 1000);
            });
            if (nextDue) {
              deadlineDisplay = `PARCELA DEVIDA EM ${nextDue.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
            }
          }

          if (!deadlineDisplay && !isPalestra && !isPaid && evt.paymentDueDate) {
            const d = new Date(evt.paymentDueDate);
            const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0];
            const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const shortDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            deadlineDisplay = `${capitalizedWeekday} - ${shortDate}`;

            const deadlineDate = new Date(evt.paymentDueDate);
            deadlineDate.setHours(0,0,0,0);
            const oneDayBefore = new Date(deadlineDate);
            oneDayBefore.setDate(deadlineDate.getDate() - 1);
            
            if (today.getTime() >= oneDayBefore.getTime()) {
              isNearDeadline = true;
            }
          }

          const courseConfig = courseTypes.find(c => c.name === evt.title);
          const courseShortcuts = courseConfig?.defaultMaterials?.map(m => m.name) || [];

          return (
            <div 
              key={evt.id}
              ref={el => { eventRefs.current[evt.id] = el; if (dateKey && !eventRefs.current[dateKey]) eventRefs.current[dateKey] = el; }}
              className={`bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-all duration-300
                 ${highlightEventId === evt.id ? 'ring-4 ring-yellow-400 scale-[1.02] z-10' : (isCloseOrOverdue ? 'ring-2 ring-red-600 dark:ring-red-50' : '')}
              `}
            >
              <div className="bg-[#1A4373] py-3 px-4 flex flex-col items-center justify-center relative min-h-[50px]">
                  <h3 className="text-[14px] font-black text-white text-center leading-tight truncate px-8 uppercase tracking-tighter">
                    {evt.student || (isPalestra ? 'Evento Corporativo' : 'Aluna sem nome')}
                  </h3>
                  {isPalestra && evt.palestraType === 'MEU' && evt.studentCount && (
                    <div className="text-[10px] font-black text-white uppercase tracking-tight mt-0.5">
                      {evt.studentCount} {evt.studentCount === 1 ? 'Aluna' : 'Alunas'}
                    </div>
                  )}
                  {isNearDeadline && (
                    <div className="absolute right-4 animate-soft-blink top-1/2 -translate-y-1/2">
                      <AlertCircleIcon className="w-6 h-6 text-red-500" />
                    </div>
                  )}
              </div>

              <div className="p-3 flex flex-col items-center text-center gap-1">
                 <div className="mb-2">
                    <p className="text-[12px] font-bold uppercase tracking-tight leading-tight text-gray-800 dark:text-white">
                        {evt.title}
                    </p>
                    <p className="text-[11px] text-gray-800 dark:text-white mt-0.5 font-bold">
                        {evt.date ? (
                          <>
                            <span className="capitalize">{new Date(evt.date).toLocaleDateString('pt-BR', {weekday: 'long', day:'numeric', month:'long'}).toLowerCase()}</span>
                            <span> às {evt.time}</span>
                          </>
                        ) : ''}
                    </p>
                    {evt.createdAt && (
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                        Adicionado em: {new Date(evt.createdAt).toLocaleDateString('pt-BR')} - {new Date(evt.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                 </div>
                 
                 <div className="w-full bg-gray-50 dark:bg-white/5 rounded-lg p-2 mb-2 border-y border-gray-100 dark:border-gray-800">
                     <div className={`grid ${isPalestra && evt.palestraType === 'MEU' ? 'grid-cols-2' : 'grid-cols-3'} gap-1 divide-x divide-gray-200 dark:divide-gray-800 text-[10px] font-bold uppercase tracking-widest ${isPalestra ? 'text-sky-500/50' : 'text-gray-400'}`}>
                        <div className="px-1 flex flex-col">
                            <span>DURAÇÃO</span>
                            <span className={`${isPalestra ? 'text-sky-600' : 'text-gray-800 dark:text-white'} font-black`}>{evt.duration || '-'}</span>
                        </div>
                        {!(isPalestra && evt.palestraType === 'MEU') && (
                          <div className="px-1 flex flex-col">
                              <span>PAGAMENTO</span>
                              <div className="flex flex-col">
                                  <span className={`font-black ${isPaid ? (isPalestra ? 'text-sky-500' : 'text-emerald-500') : 'text-red-500'}`}>
                                      {isPaid ? 'FINALIZADO' : 'PENDENTE'}
                                  </span>
                              </div>
                          </div>
                        )}
                        <div className="px-1 flex flex-col">
                            <span>LOCAL</span>
                            <span className={`${isPalestra ? 'text-sky-600' : 'text-gray-800 dark:text-white'} font-black truncate`}>{evt.eventLocation || 'Meu Studio'}</span>
                        </div>
                     </div>
                 </div>

                 {/* PAGAMENTO (APENAS FACILITADO) */}
                 {!isPalestra && scheduleDates.length > 0 && (
                   <div className="w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 mb-2 text-left">
                      <p className="text-[10px] font-black uppercase text-primary dark:text-blue-300 mb-2 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> PAGAMENTO {evt.paymentFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {scheduleDates.map((d, i) => {
                          const isPaidInstallment = evt.payments?.some(p => p.installment === i + 1);
                          const installmentDate = new Date(d);
                          installmentDate.setHours(0,0,0,0);
                          const isBlinkingButton = !isPaidInstallment && (installmentDate.getTime() - today.getTime()) <= (1 * 24 * 60 * 60 * 1000);
                          
                          const isEditing = installmentChoice?.eventId === evt.id && installmentChoice?.installment === i + 1;

                          return (
                            <div key={i} className={`text-[10px] text-gray-600 dark:text-gray-400 py-0.5 ${isEditing ? 'col-span-2 animate-in fade-in zoom-in-95 duration-200' : 'flex justify-between items-center'}`}>
                               {isEditing ? (
                                  <div className="w-full bg-white dark:bg-black/20 p-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col gap-2.5 mt-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-gray-500 dark:text-gray-400 uppercase text-[10px]">Opções - Parcela {i+1}</span>
                                      <button 
                                        onClick={() => setInstallmentChoice(null)}
                                        className="bg-gray-100 dark:bg-white/10 text-gray-500 py-1 px-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                      >
                                        <XIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    <div className="flex gap-2 w-full">
                                      <button 
                                        onClick={() => {
                                          onDirectInstallmentPaid?.(evt, i + 1);
                                          setInstallmentChoice(null);
                                        }}
                                        className="flex-1 bg-emerald-500 text-white py-2 rounded-lg font-black uppercase text-[9px] shadow hover:bg-emerald-600 transition-colors text-center"
                                      >
                                        Dar Baixa
                                      </button>
                                      <button 
                                        onClick={() => {
                                          onQuickInstallmentPaid?.(evt, i + 1);
                                          setInstallmentChoice(null);
                                        }}
                                        className="flex-1 bg-primary text-white py-2 rounded-lg font-black uppercase text-[9px] shadow hover:bg-primary-dark transition-colors text-center"
                                      >
                                        Lançar
                                      </button>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 border-t border-gray-100 dark:border-gray-800 pt-2.5 mt-0.5">
                                       <span className="font-black text-gray-400 uppercase text-[8px] tracking-wider">Alterar Vencimento:</span>
                                       <div className="flex gap-2 w-full">
                                         <input 
                                           id={`date-input-${evt.id}-${i}`}
                                           type="date" 
                                           className="flex-1 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 font-bold focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                                           defaultValue={`${installmentDate.getFullYear()}-${String(installmentDate.getMonth()+1).padStart(2,'0')}-${String(installmentDate.getDate()).padStart(2,'0')}`}
                                         />
                                         <button 
                                           onClick={() => {
                                             const input = document.getElementById(`date-input-${evt.id}-${i}`) as HTMLInputElement;
                                             if (input && input.value) {
                                               onChangeInstallmentDate?.(evt, i + 1, input.value);
                                               setInstallmentChoice(null);
                                             }
                                           }}
                                           className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-gray-300 transition-colors"
                                         >
                                           Salvar
                                         </button>
                                       </div>
                                    </div>
                                  </div>
                               ) : (
                                  <>
                                     <span className="font-bold">Parcela {i+1}:</span>
                                     {isPaidInstallment ? (
                                       <span className="font-black text-emerald-500 uppercase flex items-center gap-1">
                                         <CheckIcon className="w-3 h-3" /> PAGO
                                       </span>
                                     ) : (
                                       <button 
                                         onClick={() => setInstallmentChoice({ eventId: evt.id, installment: i + 1 })}
                                         className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-black border ${isBlinkingButton ? 'bg-red-500 text-white border-red-600 animate-soft-blink shadow-lg shadow-red-500/20' : 'bg-primary/10 text-primary dark:text-blue-300 border-primary/20 hover:bg-primary/20'}`}
                                         title="Opções de pagamento"
                                       >
                                         <span className="mr-1 whitespace-nowrap">{d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                                         <div className={`${isBlinkingButton ? 'bg-white text-red-500' : 'bg-primary text-white'} rounded-full p-0.5 flex-shrink-0`}>
                                           <PlusIcon className="w-2.5 h-2.5" />
                                         </div>
                                       </button>
                                     )}
                                  </>
                               )}
                            </div>
                          );
                        })}
                      </div>
                   </div>
                 )}

                 {/* CHECKLIST DE MATERIAIS / GASTOS */}
                 <div className={`w-full rounded-lg p-3 mb-2 text-left border ${isPalestra ? 'bg-sky-50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <p className={`text-[11px] font-black uppercase flex items-center gap-1 ${isPalestra ? 'text-sky-500' : 'text-primary dark:text-blue-300'}`}>
                           <BoxIcon className="w-3.5 h-3.5" /> {isPalestra ? 'GASTOS DO EVENTO' : 'CHECKLIST DE MATERIAIS'}
                        </p>
                        
                        {!isPalestra && (
                            <span className="text-[10px] font-black text-red-500">Total: R$ {totalMaterialCost.toFixed(2).replace('.', ',')}</span>
                        )}
                    </div>
                    
                    <ul className="space-y-1.5">
                        {evt.materials?.map(m => (
                            <li key={m.id} className="flex justify-between items-center text-xs p-1">
                               <div className="flex items-center gap-2 overflow-hidden">
                                  <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{m.name}</span>
                               </div>
                               <div className="flex items-center gap-2 shrink-0">
                                  {m.cost !== undefined && <span className="text-[10px] font-bold text-red-500">R$ {parseCurrency(m.cost).toFixed(2).replace('.', ',')}</span>}
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => {
                                        setQuickMaterialName({ ...quickMaterialName, [evt.id]: m.name });
                                        setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: m.cost?.toString() || '0' });
                                        setEditingMaterialId({ ...editingMaterialId, [evt.id]: m.id });
                                      }} 
                                      className="text-gray-400 hover:text-primary p-1 transition-colors"
                                    >
                                      <PencilIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => onRemoveMaterial?.(evt.id, m.id, m.name)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                               </div>
                            </li>
                        ))}
                    </ul>

                    {isPalestra && !evt.abateExpenses && (
                        <div className="mt-2 flex justify-end">
                             <span className="text-[10px] font-black text-red-500">Total: R$ {totalMaterialCost.toFixed(2).replace('.', ',')}</span>
                        </div>
                    )}
                    
                    {isPalestra ? (
                      <div className="mt-2 pt-2 border-t border-sky-100 dark:border-sky-900/30 flex flex-col gap-2">
                        <div className="flex gap-1 items-center">
                          <input 
                            type="text" 
                            placeholder="Despesa..." 
                            value={quickMaterialName[evt.id] || ''}
                            onChange={(e) => setQuickMaterialName({ ...quickMaterialName, [evt.id]: e.target.value })}
                            className="flex-1 text-[10px] bg-white dark:bg-bg-dark border border-sky-100 dark:border-sky-800 rounded px-2 py-2.5 outline-none text-gray-800 dark:text-white font-bold"
                          />
                          <input 
                            type="text" 
                            inputMode="numeric"
                            placeholder="R$ 0" 
                            value={quickMaterialCost[evt.id] || ''}
                            onChange={(e) => setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: formatCurrencyInput(e.target.value) })}
                            className="w-14 text-[10px] bg-white dark:bg-bg-dark border border-sky-100 dark:border-sky-800 rounded px-1 py-2.5 outline-none text-gray-800 dark:text-white font-bold text-center"
                          />
                          <button 
                            onClick={() => handleQuickAdd(evt.id)}
                            className={`w-8 h-8 ${editingMaterialId[evt.id] ? 'bg-green-500 hover:bg-green-600' : 'bg-sky-500 hover:bg-sky-600'} text-white rounded-lg transition-all shadow-sm flex items-center justify-center flex-shrink-0`}
                          >
                            {editingMaterialId[evt.id] ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                          </button>
                          {editingMaterialId[evt.id] && (
                            <button 
                              onClick={() => {
                                setQuickMaterialName({ ...quickMaterialName, [evt.id]: '' });
                                setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: '' });
                                setEditingMaterialId({ ...editingMaterialId, [evt.id]: null });
                              }}
                              className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Abate automático conforme solicitado */}
                        
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          {['Hotel', 'Passagem', 'Ônibus', 'Alimentação', 'Uber', '99'].map(shortcut => (
                            <button
                              key={shortcut}
                              onClick={() => setQuickMaterialName({ ...quickMaterialName, [evt.id]: shortcut })}
                              className="w-full text-[9px] font-black px-1 py-2 bg-white dark:bg-bg-dark border border-sky-100 dark:border-sky-800 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors whitespace-nowrap"
                            >
                              {shortcut}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-900/30 flex flex-col gap-2">
                        <div className="flex gap-1">
                          <input 
                            type="text" 
                            placeholder="Adicionar custo..." 
                            value={quickMaterialName[evt.id] || ''}
                            onChange={(e) => setQuickMaterialName({ ...quickMaterialName, [evt.id]: e.target.value })}
                            className="flex-1 text-[10px] bg-white dark:bg-bg-dark border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white"
                          />
                          <input 
                            type="text" 
                            inputMode="numeric"
                            placeholder="R$ 0,00" 
                            value={quickMaterialCost[evt.id] || ''}
                            onChange={(e) => setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: formatCurrencyInput(e.target.value) })}
                            className="w-16 text-[10px] bg-white dark:bg-bg-dark border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white font-bold text-center"
                          />
                          <button 
                            onClick={() => handleQuickAdd(evt.id)}
                            className={`w-7 h-7 ${editingMaterialId[evt.id] ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-dark'} text-white rounded-lg transition-all shadow-sm flex items-center justify-center flex-shrink-0`}
                          >
                            {editingMaterialId[evt.id] ? <CheckIcon className="w-3.5 h-3.5" /> : <PlusIcon className="w-3.5 h-3.5" />}
                          </button>
                          {editingMaterialId[evt.id] && (
                            <button 
                              onClick={() => {
                                setQuickMaterialName({ ...quickMaterialName, [evt.id]: '' });
                                setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: '' });
                                setEditingMaterialId({ ...editingMaterialId, [evt.id]: null });
                              }}
                              className="w-7 h-7 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {courseShortcuts.length > 0 && (
                          <div className="grid grid-cols-3 gap-1 pt-0.5">
                            {courseShortcuts.map(shortcut => (
                              <button
                                key={shortcut}
                                onClick={() => setQuickMaterialName({ ...quickMaterialName, [evt.id]: shortcut })}
                                className="w-full text-[9px] font-black px-1 py-2 bg-white dark:bg-bg-dark border border-blue-100 dark:border-blue-800 text-primary rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                              >
                                {shortcut}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                 </div>

                 {/* RESUMO FINANCEIRO */}
                 <div className={`w-full bg-white dark:bg-surface-dark border rounded-lg p-3 mb-2 shadow-sm ${isPalestra ? 'border-sky-100' : 'border-gray-200'}`}>
                    <div className="space-y-1.5">
                        {!(isPalestra && evt.palestraType === 'MEU') && (
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-bold">
                                {isPalestra ? 'Cachê Acordado:' : 'Valor do Curso:'}
                              </span>
                              <span className="font-bold text-gray-800 dark:text-white">R$ {courseValue.toFixed(2).replace('.', ',')}</span>
                          </div>
                        )}
                        
                        {!isPalestra && payments.length > 0 && (
                          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 space-y-1">
                            {payments.map((p, idx) => (
                              <div key={p.id || idx} className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-bold">Lançado ({p.method || 'Pix'}):</span>
                                <span className={`font-bold text-emerald-600`}>R$ {parseCurrency(p.amount).toFixed(2).replace('.', ',')}</span>
                              </div>
                            ))}
                            {payments.length > 1 && (
                                <div className={`flex justify-between items-center text-[10px] pt-1 font-black border-t text-emerald-600 border-emerald-50`}>
                                    <span>VALOR TOTAL RECEBIDO:</span>
                                    <span>R$ {totalPaid.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                          </div>
                        )}

                        <div className={`flex justify-between items-center text-[10px] ${!(isPalestra && evt.palestraType === 'MEU') ? 'pt-1.5 border-t border-gray-100 dark:border-gray-800' : ''}`}>
                            <span className="text-gray-500 font-bold uppercase">Total de Gastos:</span>
                            <span className="font-bold text-red-600 dark:text-red-500">- R$ {totalMaterialCost.toFixed(2).replace('.', ',')}</span>
                        </div>

                        {!(isPalestra && evt.palestraType === 'MEU') && (
                          <>
                            <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 font-bold uppercase">Lucro Líquido:</span>
                                <span className="font-bold text-emerald-600">R$ {finalLiquid.toFixed(2).replace('.', ',')}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-1.5 border-t border-dashed border-gray-200 dark:border-gray-700">
                                <span className="font-black text-gray-800 dark:text-white uppercase text-[10px]">
                                    {isPaid ? 'TOTAL PAGO' : 'Restante a Pagar:'}
                                </span>
                                <span className={`font-black ${isPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                                    R$ {(isPaid ? totalPaid : remaining).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                          </>
                        )}
                    </div>
                 </div>
                 
                  {isPalestra ? null : (
                    !isPaid && deadlineDisplay && !evt.paymentFrequency && (
                        <div className={`w-full bg-gray-50 dark:bg-white/5 rounded-lg p-2.5 mb-2 flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden ${isNearDeadline ? 'animate-soft-blink' : ''}`}>
                            <span className="text-red-600 dark:text-red-500 text-[12px] font-black uppercase tracking-tighter text-center whitespace-nowrap">
                                ✓ {deadlineDisplay.startsWith('PARCELA') ? deadlineDisplay : `PRAZO LIMITE DE PAGAMENTO: ${deadlineDisplay}`}
                            </span>
                        </div>
                    )
                 )}
                 
                 {/* Caso tenha frequência, mostra apenas se for PARCELA */}
                 {!isPalestra && !isPaid && deadlineDisplay && evt.paymentFrequency && deadlineDisplay.startsWith('PARCELA') && (
                    <div className={`w-full bg-gray-50 dark:bg-white/5 rounded-lg p-2.5 mb-2 flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden ${isNearDeadline ? 'animate-soft-blink' : ''}`}>
                        <span className="text-red-600 dark:text-red-500 text-[12px] font-black uppercase tracking-tighter text-center whitespace-nowrap">
                            ✓ {deadlineDisplay}
                        </span>
                    </div>
                 )}
                 
                 {!isPalestra && (
                   isPaid ? (
                       <div className={`w-full py-3.5 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest bg-emerald-500 shadow-emerald-500/20`}>
                          <CheckIcon className="w-5 h-5" /> CURSO PAGO
                       </div>
                   ) : (
                       <>
                        <button 
                           onClick={() => onAddPayment(evt)}
                           className={`w-full py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100`}
                        >
                           <PlusIcon className="w-4 h-4" /> Lançar Pagamento
                        </button>
                        <button 
                           onClick={() => onShareFinancialSummary?.(evt)}
                           className={`w-full py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 mt-2 border border-blue-100 dark:border-blue-800`}
                        >
                           <ShareIcon className="w-4 h-4" /> Compartilhar Resumo
                        </button>
                       </>
                   )
                 )}
              </div>

              <div className="flex border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-white/5">
                  {isPalestra ? (
                    <a 
                      href={waLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-sky-500 active:text-sky-600 transition-all" 
                      title="WhatsApp"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                    </a>
                  ) : (
                    <button 
                      onClick={() => onShareEvent?.(evt)} 
                      className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all" 
                      title="Compartilhar"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  )}
                  {evt.email && (
                    <button 
                      onClick={() => handleCopyEmail(evt.email!, evt.id)}
                      className={`flex-1 py-3 flex items-center justify-center transition-all ${copiedEmailId === evt.id ? 'text-emerald-500' : 'text-gray-400 hover:text-primary'}`}
                      title="Copiar E-mail"
                    >
                      {copiedEmailId === evt.id ? <CheckIcon className="w-5 h-5" /> : <MailIcon className="w-5 h-5" />}
                    </button>
                  )}
                  <button onClick={() => onEditEvent(evt)} className={`flex-1 py-3 flex items-center justify-center text-gray-400 ${isPalestra ? 'hover:text-sky-500' : 'hover:text-blue-500'} transition-all`} title="Editar"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDeleteEvent(evt.id)} className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
