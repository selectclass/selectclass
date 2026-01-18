
import React from 'react';
import { CalendarEvent, CourseType } from '../types';
import { TrashIcon, ShareIcon, PencilIcon, AlertCircleIcon, PlusIcon, CalendarIcon, MapPinIcon, WhatsAppIcon, ClockIcon, BoxIcon, SquareIcon, CheckSquareIcon } from './Icons';

interface EventListProps {
  date: Date;
  events: CalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onAddPayment: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onSaveEvent?: (eventData: Partial<CalendarEvent>, date: Date) => void;
  onToggleMaterial?: (eventId: string, materialId: string) => void;
  onUpdateMaterialCost?: (eventId: string, materialId: string, cost: number) => void;
  onShareEvent?: (event: CalendarEvent) => void; // New Prop
  courseTypes?: CourseType[];
}

export const EventList: React.FC<EventListProps> = ({ date, events, onDeleteEvent, onAddPayment, onEditEvent, onToggleMaterial, onUpdateMaterialCost, onShareEvent, courseTypes = [] }) => {
  const formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

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
        {events.map((event) => {
          // --- Financial Logic ---
          // Lookup course configuration to fallback default value if event value is 0 or undefined
          const courseConfig = courseTypes.find(c => c.name === event.title);
          const courseValue = event.value || courseConfig?.defaultValue || 0;

          const payments = event.payments || [];
          const sinalValue = payments.length > 0 ? payments[0].amount : 0;
          const manualPaymentsValue = payments.slice(1).reduce((acc, p) => acc + p.amount, 0);
          const totalPaid = sinalValue + manualPaymentsValue;
          const remaining = Math.max(0, courseValue - totalPaid);
          const isPaid = remaining < 0.01; 

          // --- Material Cost Logic ---
          // Sum only checked items
          const materialCost = event.materials?.reduce((acc, m) => m.checked ? acc + (m.cost || 0) : acc, 0) || 0;
          const projectedProfit = courseValue - materialCost;

          // Alert Logic (Date proximity)
          const today = new Date();
          today.setHours(0,0,0,0);
          const courseDate = event.date ? new Date(event.date) : new Date();
          courseDate.setHours(0,0,0,0);
          const diffTime = courseDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isCloseOrOverdue = !isPaid && diffDays <= 5;
          
          // --- Materials Logic ---
          const hasMaterials = event.materials && event.materials.length > 0;
          const allMaterialsChecked = hasMaterials && event.materials?.every(m => m.checked);

          return (
            <div 
              key={event.id}
              className={`bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-all duration-300
                 ${isCloseOrOverdue ? 'ring-2 ring-red-600 dark:ring-red-500' : ''}
              `}
            >
              {/* --- CARD HEADER --- */}
              <div className="bg-[#1A4373] p-3 flex flex-col items-center justify-center relative">
                  {isCloseOrOverdue && (
                      <div className="absolute top-3 right-3 text-red-400 animate-pulse" title="Pagamento Pendente / Próximo">
                          <AlertCircleIcon className="w-5 h-5" />
                      </div>
                  )}
                  {allMaterialsChecked && (
                       <div className="absolute top-3 left-3 bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 backdrop-blur-sm">
                           <BoxIcon className="w-3 h-3" /> OK
                       </div>
                  )}

                  <h3 className="text-lg font-bold text-white text-center leading-tight">
                    {event.student || 'Aluna sem nome'}
                  </h3>
                  <div className="text-blue-100 text-sm font-medium mt-0.5 flex items-center gap-2">
                     <ClockIcon className="w-3 h-3" /> {event.time}
                  </div>
              </div>

              {/* --- CARD BODY --- */}
              <div className="p-3 flex flex-col items-center text-center gap-1">
                 
                 {/* Course Title */}
                 <div className="mb-2">
                    <p className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-tight leading-tight">
                        {event.title}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {event.date ? new Date(event.date).toLocaleDateString('pt-BR', {weekday: 'long', day:'numeric', month:'long'}) : ''}
                    </p>
                 </div>
                 
                 {/* DETAILED INFO GRID */}
                 <div className="w-full bg-gray-50 dark:bg-white/5 rounded-lg p-2 mb-2 text-left">
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-400 font-bold">Duração</span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{event.duration || '-'}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] uppercase text-gray-400 font-bold">Pagamento</span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{event.paymentMethod}</span>
                        </div>
                        
                        {/* EVENT LOCATION ROW */}
                        {event.eventLocation && (
                             <div className="col-span-2 flex flex-col bg-white dark:bg-white/5 rounded p-1.5 border border-gray-100 dark:border-gray-700">
                                <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1">
                                    <MapPinIcon className="w-3 h-3 text-primary" /> LOCAL DO EVENTO
                                </span>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                                    {event.eventLocation}
                                </span>
                             </div>
                        )}

                        <div className="col-span-2 h-[1px] bg-gray-200 dark:bg-white/10 my-0.5"></div>
                        
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" /> Origem (Aluna)
                            </span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate pr-1" title={`${event.city} - ${event.state}`}>
                                {event.city} - {event.state}
                            </span>
                        </div>
                        <div className="flex flex-col text-right items-end">
                             <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1">
                                Contato <WhatsAppIcon className="w-3 h-3" /> 
                            </span>
                             <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                                {event.whatsapp}
                             </span>
                        </div>
                     </div>
                 </div>

                 {/* --- CHECKLIST SECTION (Dynamic Cost) --- */}
                 {hasMaterials && onToggleMaterial && onUpdateMaterialCost && (
                    <div className="w-full bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 mb-2 text-left border border-blue-100 dark:border-blue-900/30">
                        <div className="flex justify-between items-center mb-2">
                             <p className="text-[10px] font-bold text-primary dark:text-blue-300 uppercase flex items-center gap-1 pl-1">
                                <BoxIcon className="w-3 h-3" /> Checklist de Materiais
                             </p>
                             {materialCost > 0 && (
                                 <span className="text-[10px] font-bold text-orange-500">
                                     Gasto: R$ {materialCost.toFixed(2)}
                                 </span>
                             )}
                        </div>
                        <ul className="space-y-1.5">
                            {event.materials?.map(m => (
                                <li key={m.id} 
                                    className={`flex items-center justify-between gap-3 text-sm cursor-pointer group select-none transition-all rounded-lg p-2 border border-transparent
                                        ${m.checked 
                                            ? 'bg-white shadow-sm border-gray-100 dark:bg-white/5 dark:border-gray-700' 
                                            : 'text-gray-500 bg-gray-100/50 dark:bg-white/5 dark:text-gray-400'
                                        }`}
                                    onClick={() => onToggleMaterial(event.id, m.id)}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`flex-shrink-0 transition-transform ${m.checked ? 'text-green-500 scale-100' : 'text-gray-300 scale-90'}`}>
                                            {m.checked ? <CheckSquareIcon className="w-5 h-5" /> : <SquareIcon className="w-5 h-5" />}
                                        </div>
                                        <span className={`truncate ${m.checked ? 'text-gray-800 dark:text-white font-medium' : ''}`}>
                                            {m.name}
                                        </span>
                                    </div>
                                    
                                    {/* Manual Cost Input - Only Shows when Checked */}
                                    {m.checked && (
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-black/20 rounded-md px-2 py-1 border border-gray-200 dark:border-gray-600" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-[10px] font-bold text-gray-500">R$</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                className="w-16 bg-transparent text-xs font-bold text-gray-800 dark:text-white focus:outline-none text-right p-0"
                                                value={m.cost || ''}
                                                onChange={(e) => onUpdateMaterialCost(event.id, m.id, parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}

                 {/* FINANCIAL CALCULATION BLOCK */}
                 <div className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 shadow-sm">
                    {/* Line 1: Valor do Curso */}
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-gray-500 font-medium">Valor do Curso</span>
                        <span className="font-bold text-gray-800 dark:text-white">R$ {courseValue.toFixed(2)}</span>
                    </div>

                    {/* NEW: Costs and Profit */}
                    {hasMaterials && (
                        <>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-gray-400 font-medium">(-) Custos (Mat.)</span>
                                <span className="font-bold text-orange-500">R$ {materialCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mb-1 border-b border-gray-100 dark:border-gray-700 pb-1">
                                <span className="text-gray-400 font-medium">(=) Lucro Líquido</span>
                                <span className="font-bold text-green-600">R$ {projectedProfit.toFixed(2)}</span>
                            </div>
                        </>
                    )}

                    {/* Line 2: (-) Sinal */}
                    <div className="flex justify-between items-center text-xs mb-1 pt-1">
                        <span className="text-gray-500 font-medium">(-) Sinal Recebido</span>
                        <span className="font-bold text-green-600">R$ {sinalValue.toFixed(2)}</span>
                    </div>
                     {/* Line 2b: (-) Outros Pagamentos */}
                     {manualPaymentsValue > 0 && (
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-gray-500 font-medium">(-) Outros Pagamentos</span>
                            <span className="font-bold text-green-600">R$ {manualPaymentsValue.toFixed(2)}</span>
                        </div>
                     )}

                    {/* Line 3: Restante a Pagar */}
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Restante a Pagar</span>
                        <span className={`font-bold ${isPaid ? 'text-green-500' : 'text-red-500'}`}>
                            R$ {remaining.toFixed(2)}
                        </span>
                    </div>
                 </div>

                 {/* Inline History */}
                 {event.payments && event.payments.length > 1 && (
                    <div className="w-full text-left mb-2 px-2">
                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Histórico de Lançamentos</p>
                        <ul className="space-y-1">
                            {event.payments.slice(1).map((p, idx) => (
                                <li key={idx} className="flex justify-between text-[10px] text-gray-500 border-b border-gray-100 dark:border-gray-800 pb-1 last:border-0">
                                    <span>{new Date(p.date).toLocaleDateString('pt-BR')}</span>
                                    <span>R$ {p.amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
                 
                 {/* ACTIONS */}
                 {isPaid ? (
                     <div className="w-full py-3 bg-green-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                        ✅ CURSO PAGO
                     </div>
                 ) : (
                     <button 
                        onClick={() => onAddPayment(event)}
                        className="w-full py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors shadow-sm"
                     >
                        <PlusIcon className="w-4 h-4" /> Lançar Pagamento
                     </button>
                 )}
              </div>

              {/* --- CARD FOOTER --- */}
              <div className="flex border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800">
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (onShareEvent) onShareEvent(event); 
                    }}
                    className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                  >
                      <ShareIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEditEvent(event); }}
                    className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                  >
                      <PencilIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                    className="flex-1 py-3 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                  >
                      <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
