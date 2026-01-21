import React, { useState, useMemo } from 'react';
import { CalendarEvent, CourseType, MaterialItem } from '../types';
import { TrashIcon, ShareIcon, PencilIcon, AlertCircleIcon, PlusIcon, CalendarIcon, MapPinIcon, WhatsAppIcon, ClockIcon, BoxIcon, SquareIcon, CheckSquareIcon, CheckIcon, XIcon, DollarSignIcon } from './Icons';
import { ConfirmationModal } from './ConfirmationModal';

interface EventListProps {
  date: Date;
  events: CalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onAddPayment: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onSaveEvent?: (eventData: Partial<CalendarEvent>, date: Date) => void;
  onToggleMaterial?: (eventId: string, materialId: string) => void;
  onQuickAddMaterial?: (eventId: string, name: string, cost: number) => void;
  onRemoveMaterial?: (eventId: string, materialId: string) => void;
  onShareEvent?: (event: CalendarEvent) => void;
  onToggleAbate?: (eventId: string) => void;
  courseTypes?: CourseType[];
}

const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

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
  courseTypes = [] 
}) => {
  const [quickMaterialName, setQuickMaterialName] = useState<{ [key: string]: string }>({});
  const [quickMaterialCost, setQuickMaterialCost] = useState<{ [key: string]: string }>({});
  const [removeConfirm, setRemoveConfirm] = useState<{ isOpen: boolean; eventId: string; materialId: string } | null>(null);

  // Identifica contextualmente se o item a ser removido é de uma palestra para mudar o texto e cor do modal
  const isPalestraTarget = useMemo(() => {
    if (!removeConfirm) return false;
    const targetEvent = events.find(e => e.id === removeConfirm.eventId);
    if (!targetEvent) return false;
    const courseConfig = courseTypes.find(c => c.name === targetEvent.title);
    return courseConfig?.model === 'Palestra' || targetEvent.title === 'Palestra' || targetEvent.title === 'Workshop';
  }, [removeConfirm, events, courseTypes]);

  const formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase();

  const handleQuickAdd = (eventId: string) => {
    const name = quickMaterialName[eventId];
    const cost = parseFloat(quickMaterialCost[eventId]?.replace(',', '.') || '0');
    if (name && onQuickAddMaterial) {
      onQuickAddMaterial(eventId, name, cost);
      setQuickMaterialName({ ...quickMaterialName, [eventId]: '' });
      setQuickMaterialCost({ ...quickMaterialCost, [eventId]: '' });
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center opacity-60 mt-10">
        <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
          <CalendarIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Agenda livre</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-32">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1 text-center">
        {formattedDate}
      </h3>
      <div className="space-y-4">
        {events.map((evt) => {
          const courseConfig = courseTypes.find(c => c.name === evt.title);
          const isPalestra = courseConfig?.model === 'Palestra' || evt.title === 'Palestra' || evt.title === 'Workshop';
          const courseValue = parseCurrency(evt.value) || 0;

          const payments = evt.payments || [];
          const totalPaid = payments.reduce((acc, p) => acc + parseCurrency(p.amount), 0);
          const remaining = Math.max(0, courseValue - totalPaid);
          const isPaid = remaining < 0.01 && courseValue > 0; 

          const checkedMaterials = evt.materials?.filter(m => m.checked) || [];
          const totalMaterialCost = checkedMaterials.reduce((acc, m) => acc + parseCurrency(m.cost), 0);
          
          const shouldAbate = isPalestra && !!evt.abateExpenses;
          const finalLiquid = isPalestra 
            ? (shouldAbate ? courseValue - totalMaterialCost : courseValue)
            : (courseValue - totalMaterialCost);

          const today = new Date();
          today.setHours(0,0,0,0);
          const courseDate = evt.date ? new Date(evt.date) : new Date();
          courseDate.setHours(0,0,0,0);
          
          const isCloseOrOverdue = !isPalestra && !isPaid && (courseDate.getTime() - today.getTime()) <= (5 * 24 * 60 * 60 * 1000);
          const waLink = evt.whatsapp ? `https://wa.me/${evt.whatsapp.replace(/\D/g, '')}` : '#';

          let deadlineDisplay = '';
          if (!isPalestra && evt.paymentDueDate) {
            const d = new Date(evt.paymentDueDate);
            const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0];
            const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const shortDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            deadlineDisplay = `${capitalizedWeekday} - ${shortDate}`;
          }

          return (
            <div 
              key={evt.id}
              className={`bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-all duration-300
                 ${isCloseOrOverdue ? 'ring-2 ring-red-600 dark:ring-red-500' : ''}
              `}
            >
              <div className={`${isPalestra ? 'bg-sky-500' : 'bg-[#1A4373]'} py-3 px-4 flex items-center justify-center relative min-h-[50px]`}>
                  <h3 className="text-xl font-black text-white text-center leading-tight truncate px-8 uppercase tracking-tighter">
                    {evt.student || (isPalestra ? 'Evento Corporativo' : 'Aluna sem nome')}
                  </h3>
              </div>

              <div className="p-3 flex flex-col items-center text-center gap-1">
                 <div className="mb-2">
                    <p className={`text-base font-bold uppercase tracking-tight leading-tight ${isPalestra ? 'text-sky-600 dark:text-sky-400' : 'text-gray-800 dark:text-white'}`}>
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
                 </div>
                 
                 <div className="w-full bg-gray-50 dark:bg-white/5 rounded-lg p-2 mb-2 border-y border-gray-100 dark:border-gray-800">
                     <div className="grid grid-cols-3 gap-1 divide-x divide-gray-200 dark:divide-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="px-1 flex flex-col">
                            <span>DURAÇÃO</span>
                            <span className="text-gray-800 dark:text-white font-black">{evt.duration || '-'}</span>
                        </div>
                        <div className="px-1 flex flex-col">
                            <span>PAGAMENTO</span>
                            <div className="flex flex-col">
                                <span className={`font-black ${isPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isPaid ? 'FINALIZADO' : 'PENDENTE'}
                                </span>
                            </div>
                        </div>
                        <div className="px-1 flex flex-col">
                            <span>LOCAL</span>
                            <span className="text-gray-800 dark:text-white font-black truncate">{evt.eventLocation || 'Meu Studio'}</span>
                        </div>
                     </div>
                 </div>

                 {/* CHECKLIST DE MATERIAIS / GASTOS */}
                 <div className={`w-full rounded-lg p-3 mb-2 text-left border ${isPalestra ? 'bg-sky-50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <p className={`text-[11px] font-black uppercase flex items-center gap-1 ${isPalestra ? 'text-sky-600 dark:text-sky-300' : 'text-primary dark:text-blue-300'}`}>
                           <BoxIcon className="w-3.5 h-3.5" /> {isPalestra ? 'GASTOS DO EVENTO' : 'CHECKLIST DE MATERIAIS'}
                        </p>
                        
                        {!isPalestra && (
                            <span className="text-[10px] font-black text-red-500">Total: R$ {totalMaterialCost.toFixed(2).replace('.', ',')}</span>
                        )}
                    </div>
                    
                    {/* Se for palestra e o abatimento estiver desligado, mostramos o total aqui em cima para controle */}
                    {isPalestra && !evt.abateExpenses && (
                        <div className="mb-2 flex justify-end">
                             <span className="text-[10px] font-black text-red-500">Total: R$ {totalMaterialCost.toFixed(2).replace('.', ',')}</span>
                        </div>
                    )}

                    <ul className="space-y-1.5">
                        {evt.materials?.map(m => (
                            <li key={m.id} className="flex justify-between items-center text-xs p-1">
                               <div className="flex items-center gap-2">
                                  <div className="cursor-pointer" onClick={() => onToggleMaterial?.(evt.id, m.id)}>
                                    {m.checked ? <CheckSquareIcon className="w-4 h-4 text-emerald-500" /> : <SquareIcon className="w-4 h-4 text-gray-300" />}
                                  </div>
                                  <span className={`font-medium ${m.checked ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{m.name}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  {m.cost !== undefined && <span className={`text-[10px] font-bold ${m.checked ? 'text-red-500' : 'text-gray-400'}`}>R$ {parseCurrency(m.cost).toFixed(2).replace('.', ',')}</span>}
                                  <button onClick={() => setRemoveConfirm({ isOpen: true, eventId: evt.id, materialId: m.id })} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </li>
                        ))}
                    </ul>
                    
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
                            placeholder="R$ 0" 
                            value={quickMaterialCost[evt.id] || ''}
                            onChange={(e) => setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: e.target.value })}
                            className="w-14 text-[10px] bg-white dark:bg-bg-dark border border-sky-100 dark:border-sky-800 rounded px-1 py-2.5 outline-none text-gray-800 dark:text-white font-bold text-center"
                          />
                          <button 
                            onClick={() => handleQuickAdd(evt.id)}
                            className="w-10 h-10 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Botão de Abater de Largura Total servindo como divisória */}
                        <button 
                            onClick={() => onToggleAbate?.(evt.id)}
                            className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border shadow-sm
                                ${evt.abateExpenses ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-bg-dark text-sky-500 border-sky-100'}`}
                        >
                            {evt.abateExpenses ? <CheckIcon className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}
                            Abater do Cachê
                        </button>
                        
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          {['Hotel', 'Passagem', 'Ônibus', 'Alimentação', 'Uber', '99'].map(shortcut => (
                            <button
                              key={shortcut}
                              onClick={() => setQuickMaterialName({ ...quickMaterialName, [evt.id]: shortcut })}
                              className="w-full text-[9px] font-black px-1 py-2 bg-white dark:bg-bg-dark border border-sky-100 dark:border-sky-800 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors whitespace-nowrap"
                            >
                              {shortcut}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-900/30 flex gap-1">
                          <input 
                            type="text" 
                            placeholder="Adicionar custo..." 
                            value={quickMaterialName[evt.id] || ''}
                            onChange={(e) => setQuickMaterialName({ ...quickMaterialName, [evt.id]: e.target.value })}
                            className="flex-1 text-[10px] bg-white dark:bg-bg-dark border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white font-bold"
                          />
                          <input 
                            type="text" 
                            placeholder="R$ 0,00" 
                            value={quickMaterialCost[evt.id] || ''}
                            onChange={(e) => setQuickMaterialCost({ ...quickMaterialCost, [evt.id]: e.target.value })}
                            className="w-16 text-[10px] bg-white dark:bg-bg-dark border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white font-bold text-center"
                          />
                          <button 
                            onClick={() => handleQuickAdd(evt.id)}
                            className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-sm flex items-center justify-center"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                      </div>
                    )}
                 </div>

                 {/* RESUMO FINANCEIRO */}
                 <div className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 shadow-sm">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold">{isPalestra ? 'Cachê Acordado:' : 'Valor do Curso:'}</span>
                            <span className="font-bold text-gray-800 dark:text-white">R$ {courseValue.toFixed(2).replace('.', ',')}</span>
                        </div>
                        
                        {/* Seção de Lançamentos */}
                        {payments.length > 0 && (
                          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 space-y-1">
                            {payments.map((p, idx) => (
                              <div key={p.id || idx} className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-bold">Lançado ({p.method || 'Pix'}):</span>
                                <span className="font-bold text-emerald-600">R$ {parseCurrency(p.amount).toFixed(2).replace('.', ',')}</span>
                              </div>
                            ))}
                            {payments.length > 1 && (
                                <div className="flex justify-between items-center text-[10px] pt-1 font-black text-emerald-600 border-t border-emerald-50">
                                    <span>VALOR TOTAL RECEBIDO:</span>
                                    <span>R$ {totalPaid.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                          </div>
                        )}

                        {/* Gastos (Sempre aparece em Palestra se o abatimento estiver ligado) */}
                        {isPalestra && shouldAbate && (
                             <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 font-bold uppercase">Total de Gastos:</span>
                                <span className="font-bold text-red-600 dark:text-red-500">- R$ {totalMaterialCost.toFixed(2).replace('.', ',')}</span>
                             </div>
                        )}

                        {/* Lucro Líquido para Cursos */}
                        {!isPalestra && (
                          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100 dark:border-gray-800">
                              <span className="text-gray-500 font-bold">Lucro Líquido:</span>
                              <span className="font-bold text-emerald-600">R$ {finalLiquid.toFixed(2).replace('.', ',')}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-sm pt-1.5 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <span className="font-black text-gray-800 dark:text-white uppercase text-[10px]">
                                {isPalestra ? 'SALDO LÍQUIDO FINAL:' : (isPaid ? 'TOTAL PAGO' : 'Restante a Pagar:')}
                            </span>
                            <span className={`font-black ${isPaid ? 'text-emerald-500' : (isPalestra ? 'text-sky-600' : 'text-red-500')}`}>
                                R$ {(isPalestra ? finalLiquid : (isPaid ? totalPaid : remaining)).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>
                 </div>
                 
                 {isPalestra ? (
                    !isPaid && (
                        <div className="w-full bg-sky-100 dark:bg-sky-900/20 rounded-lg p-2.5 mb-2 flex items-center justify-center border border-sky-200 dark:border-sky-800 overflow-hidden">
                            <span className="text-sky-600 dark:text-sky-400 text-[12px] font-black uppercase tracking-tighter text-center">
                                ✓ PAGAMENTO PENDENTE: R$ {remaining.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    )
                 ) : (
                    !isPaid && deadlineDisplay && (
                        <div className="w-full bg-gray-50 dark:bg-white/5 rounded-lg p-2.5 mb-2 flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <span className="text-red-600 dark:text-red-500 text-[12px] font-black uppercase tracking-tighter text-center whitespace-nowrap">
                                ✓ PRAZO LIMITE DE PAGAMENTO: {deadlineDisplay}
                            </span>
                        </div>
                    )
                 )}
                 
                 {isPaid ? (
                     <div className={`w-full py-3.5 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest ${isPalestra ? 'bg-sky-500 shadow-sky-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                        <CheckIcon className="w-5 h-5" /> {isPalestra ? 'PAGAMENTO CONCLUÍDO' : 'CURSO PAGO'}
                     </div>
                 ) : (
                     <button 
                        onClick={() => onAddPayment(evt)}
                        className={`w-full py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-widest ${isPalestra ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 hover:bg-sky-100' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'}`}
                     >
                        <PlusIcon className="w-4 h-4" /> Lançar Pagamento
                     </button>
                 )}
              </div>

              <div className="flex border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-white/5">
                  {isPalestra ? (
                    <a 
                      href={waLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 py-3 flex items-center justify-center text-gray-400 active:text-[#25D366] transition-all" 
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
                  <button onClick={() => onEditEvent(evt)} className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDeleteEvent(evt.id)} className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmationModal 
        isOpen={!!removeConfirm} 
        onClose={() => setRemoveConfirm(null)} 
        onConfirm={() => {
          if (removeConfirm) {
            onRemoveMaterial?.(removeConfirm.eventId, removeConfirm.materialId);
          }
        }} 
        title={isPalestraTarget ? "Deseja remover este gasto?" : "Deseja remover este material?"} 
        message=""
        confirmLabel="SIM"
        cancelLabel="NÃO"
        variant={isPalestraTarget ? 'palestra' : 'default'}
      />
    </div>
  );
};
