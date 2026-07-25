import React, { useState, useEffect, useMemo } from "react";
import { Cotacao, CotacaoCategoria, CotacaoItem } from '../types';
import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon, GripVerticalIcon, AlertCircleIcon, HistoryIcon } from './Icons';
import { FailedCotacao } from '../types';
import { formatCurrencyInput, parseCurrency } from '../utils/currency';
import { Calendar } from './Calendar';

interface CotacoesScreenProps {
  targetCotacaoId?: string | null;
  onClearTargetCotacao?: () => void;
  api: {
    get: (path: string) => Promise<any>;
    put: (path: string, data: any) => Promise<void>;
    delete: (path: string) => Promise<void>;
  };
  generateId: () => string;
  onClose: () => void;
  events?: any[];
  courseTypes?: any[];
  lectureModels?: any[];
}

export const CotacoesScreen: React.FC<CotacoesScreenProps> = ({ 
  api, 
  generateId, 
  onClose, 
  events = [], 
  courseTypes = [], 
  lectureModels = [],
  targetCotacaoId,
  onClearTargetCotacao
}) => {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [categorias, setCategorias] = useState<CotacaoCategoria[]>([]);
  const [failedCotacoes, setFailedCotacoes] = useState<FailedCotacao[]>([]);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  
  const [editingQuote, setEditingQuote] = useState<Cotacao | null>(null);
  const [editingAnnouncementFor, setEditingAnnouncementFor] = useState<Cotacao | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAllDates, setShowAllDates] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});
  
  const toggleQuote = (id: string) => {
    setExpandedQuotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (targetCotacaoId && cotacoes.length > 0) {
      const target = cotacoes.find(c => c.id === targetCotacaoId);
      if (target) {
        setEditingQuote(target);
        setIsQuoteModalOpen(true);
        if (onClearTargetCotacao) onClearTargetCotacao();
      }
    }
  }, [targetCotacaoId, cotacoes, onClearTargetCotacao]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, quotesRes, failedRes] = await Promise.all([
        api.get('v1/data/cotacaoCategorias'),
        api.get('v1/data/cotacoes'),
        api.get('v1/data/failedCotacoes')
      ]);

      if (catsRes) {
        const catsArray = Object.values(catsRes) as CotacaoCategoria[];
        const uniqueCats = catsArray.reduce((acc: CotacaoCategoria[], curr: CotacaoCategoria) => {
          if (!acc.some(c => c.name.toLowerCase() === curr.name.toLowerCase())) {
            acc.push(curr);
          }
          return acc;
        }, []);
        uniqueCats.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategorias(uniqueCats);
      } else {
        // default categories
        const defaultCats = [
          { id: generateId(), name: 'Hotel', order: 0 },
          { id: generateId(), name: 'Passagem Aérea', order: 1 },
          { id: generateId(), name: 'Alimentação', order: 2 },
          { id: generateId(), name: 'Transporte', order: 3 },
        ];
        defaultCats.forEach(c => api.put(`v1/data/cotacaoCategorias/${c.id}`, c));
        setCategorias(defaultCats);
      }

      if (quotesRes) {
        const parsedQuotes = Object.values(quotesRes).map((q: any) => ({
          ...q,
          date: new Date(q.date),
          endDate: q.endDate ? new Date(q.endDate) : undefined,
          createdAt: new Date(q.createdAt),
          items: q.items || []
        }));
        setCotacoes(parsedQuotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
      
      if (failedRes) {
        const parsedFailed = Object.values(failedRes).map((f: any) => ({
          ...f,
          date: new Date(f.date),
          createdAt: new Date(f.createdAt)
        }));
        setFailedCotacoes(parsedFailed.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()));
      } else {
        setFailedCotacoes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (name: string) => {
    if (!name.trim()) return;
    
    // Check for existing category to prevent duplication
    const trimmedName = name.trim().toLowerCase();
    if (categorias.some(c => c.name.toLowerCase() === trimmedName)) {
      alert('Esta categoria já existe!');
      return;
    }

    const newCat = { id: generateId(), name: name.trim() };
    await api.put(`v1/data/cotacaoCategorias/${newCat.id}`, newCat);
    setCategorias(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = async (id: string) => {
    await api.delete(`v1/data/cotacaoCategorias/${id}`);
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  const handleEditCategory = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    
    // Check for existing category to prevent duplication (excluding the current one)
    const trimmedName = newName.trim().toLowerCase();
    if (categorias.some(c => c.id !== id && c.name.toLowerCase() === trimmedName)) {
      alert('Esta categoria já existe!');
      return;
    }

    setCategorias(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, name: newName.trim() };
        api.put(`v1/data/cotacaoCategorias/${id}`, updated);
        return updated;
      }
      return c;
    }));
  };

  const handleReorderCategory = async (fromIndex: number, toIndex: number) => {
    setCategorias(prev => {
      const newArray = [...prev];
      const [movedItem] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, movedItem);
      
      // Update order and save to DB
      newArray.forEach((cat, index) => {
        cat.order = index;
        api.put(`v1/data/cotacaoCategorias/${cat.id}`, cat);
      });
      return newArray;
    });
  };

  const handleSaveQuote = async (quote: Cotacao) => {
    await api.put(`v1/data/cotacoes/${quote.id}`, {
      ...quote,
      date: quote.date.toISOString(),
      createdAt: quote.createdAt.toISOString()
    });
    fetchData();
    setIsQuoteModalOpen(false);
  };

  const getAnnouncementDate = (quote: Cotacao) => {
    const d = new Date(quote.date);
    d.setMonth(d.getMonth() - (quote.announcementOffsetMonths ?? 3));
    d.setDate(d.getDate() - (quote.announcementOffsetDays ?? 7));
    return d;
  };

  const handleSaveFailedQuote = async (failedQuote: FailedCotacao) => {
    await api.put(`v1/data/failedCotacoes/${failedQuote.id}`, {
      ...failedQuote,
      date: failedQuote.date.toISOString(),
      createdAt: failedQuote.createdAt.toISOString()
    });
    await fetchData();
  };

  const handleDeleteFailedQuote = async (id: string) => {
    await api.delete(`v1/data/failedCotacoes/${id}`);
    await fetchData();
  };

  const handleDeleteQuote = async (id: string) => {
    await api.delete(`v1/data/cotacoes/${id}`);
    fetchData();
    setQuoteToDelete(null);
  };

  const getDayEventsList = (dayDate: Date): string[] => {
    const dayDateString = dayDate.toDateString();
    const eventNames: string[] = [];
    events.forEach(e => {
       if (!e.date) return;
       const eDate = new Date(e.date);
       const dStr = String(e.duration || '').toLowerCase();
       let durationNum = 1;
       if (dStr.includes('dia')) {
         durationNum = parseInt(dStr) || 1;
       }
       for (let j = 0; j < durationNum; j++) {
         const currentRangeDay = new Date(eDate);
         currentRangeDay.setDate(eDate.getDate() + j);
         if (currentRangeDay.toDateString() === dayDateString) {
           if (!eventNames.includes(e.title)) {
             eventNames.push(e.title);
           }
           break;
         }
       }
    });
    return eventNames;
  };

  const openNewQuote = () => {
    setEditingQuote({
      id: generateId(),
      title: '',
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0),
      items: categorias.map(c => ({ id: generateId(), categoryId: c.id, description: '', value: 0 })),
      createdAt: new Date()
    });
    setIsQuoteModalOpen(true);
  };

  const filteredCotacoes = cotacoes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = showAllDates;
    if (!showAllDates) {
      const qDate = quote.date.toISOString().split('T')[0];
      const sDate = selectedDate.toISOString().split('T')[0];
      if (quote.endDate) {
        const endDateStr = quote.endDate.toISOString().split('T')[0];
        matchesDate = sDate >= qDate && sDate <= endDateStr;
      } else {
        matchesDate = qDate === sDate;
      }
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] dark:bg-bg-dark animate-fade-in relative">
      <div className="bg-[#1A4373] text-white p-6 pb-8 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Cotações</h1>
          </div>
        </div>

        <div className="flex justify-end items-center">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button 
              onClick={openNewQuote}
              className="flex items-center justify-center gap-1 bg-white text-[#1A4373] px-2 py-2 rounded-xl font-bold uppercase tracking-tighter text-[10px] whitespace-nowrap hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-3.5 h-3.5 shrink-0" />
              Nova Cotação
            </button>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center justify-center gap-1 bg-white/20 text-white px-2 py-2 rounded-xl font-bold uppercase tracking-tighter text-[10px] whitespace-nowrap hover:bg-white/30 active:scale-95 transition-all shadow-md"
            >
              <TagIcon className="w-3.5 h-3.5 shrink-0" />
              Adicionar Categorias
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 -mt-4 relative z-0 pb-24">
        <div className="pt-6 space-y-4">
           <div className="flex items-center px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
               <SearchIcon className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
               <input 
                  type="text" 
                  placeholder="Buscar cotação..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-800 dark:text-white w-full font-medium" 
               />
           </div>

           <div className="flex items-center gap-2 mb-2">
               <button 
                  onClick={() => setShowAllDates(!showAllDates)} 
                  className={`flex-1 py-3 rounded-xl border shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all ${showAllDates ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-white/5 text-primary border-gray-200 dark:border-gray-800'}`}
               >
                   <div className={`p-1 rounded-full ${showAllDates ? 'bg-white/20' : 'bg-primary/5 dark:bg-primary/10'}`}>
                       <SearchIcon className={`w-4 h-4 ${showAllDates ? 'text-white' : 'text-primary'}`} />
                   </div>
                   <span className="text-[9px] font-black tracking-widest uppercase">
                       {showAllDates ? 'MOSTRAR POR DATA' : 'TODAS COTAÇÕES'}
                   </span>
               </button>
               <button 
                 onClick={() => setIsFailedModalOpen(true)}
                 className="flex-1 py-3 flex items-center justify-center gap-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 rounded-xl font-black tracking-widest uppercase text-[9px] hover:bg-red-500/20 active:scale-95 transition-all shadow-sm"
               >
                 <AlertCircleIcon className="w-4 h-4 shrink-0" />
                 Estados Testados
               </button>
           </div>
           
           {!showAllDates && (
             <Calendar 
               selectedDate={selectedDate} 
               onSelectDate={(date) => {
                 setSelectedDate(date);
               }} 
               events={events}
               courseTypes={courseTypes}
               lectureModels={lectureModels}
               showTooltipForEvents={true}
               hideEventHighlight={true}
               highlightedDates={cotacoes.reduce((acc: Date[], c) => {
                 if (c.date) acc.push(new Date(c.date));
                 if (c.endDate) {
                   const start = new Date(c.date);
                   const end = new Date(c.endDate);
                   let current = new Date(start);
                   current.setDate(current.getDate() + 1);
                   while (current <= end) {
                     acc.push(new Date(current));
                     current.setDate(current.getDate() + 1);
                   }
                 }
                 return acc;
               }, [])}
             />
           )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredCotacoes.length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mt-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Nenhuma cotação salva.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredCotacoes.map(quote => {
              const total = quote.items.reduce((sum, item) => item.included !== false ? sum + item.value : sum, 0);
              return (
                <div key={quote.id} className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col group relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">{quote.title}</h3>
                      <p className="text-xs font-bold text-black dark:text-white mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {quote.date.toLocaleDateString('pt-BR')}
                        {quote.endDate ? ` a ${quote.endDate.toLocaleDateString('pt-BR')}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingQuote(quote); setIsQuoteModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                        <Edit2Icon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setQuoteToDelete(quote.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {quote.date && (
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 rounded-2xl flex items-start gap-3 mb-4">
                       <div className="text-primary mt-0.5 shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-primary tracking-tight uppercase">Data de Lançamento</h4>
                            <button onClick={() => setEditingAnnouncementFor(quote)} className="p-1 text-primary/60 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Configurar dias de antecipação">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                          </div>
                          <p className="text-[12px] text-primary/80 dark:text-primary/70 mt-1 font-medium leading-relaxed">
                             Início da veiculação do anúncio em <span className="font-bold whitespace-nowrap bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded text-primary">{new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(getAnnouncementDate(quote))}</span>
                             <span className="block mt-0.5 text-[10px] opacity-80 font-normal">({quote.announcementOffsetMonths ?? 3} meses e {quote.announcementOffsetDays ?? 7} dias antes da data do curso)</span>
                          </p>
                       </div>
                    </div>
                  )}

                  <div className="flex-1">
                    {expandedQuotes[quote.id] && (
                      <div className="animate-fade-in">
                        <div className="space-y-3 mb-4">
                          {quote.items.filter(i => i.value > 0 || i.description).map(item => (
                            <div key={item.id} className={`flex justify-between items-center text-sm ${item.included === false ? 'opacity-50' : ''}`}>
                              <div className="flex items-center gap-2 max-w-[65%]">
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={item.included !== false}
                                    onChange={async (e) => {
                                      const newItems = quote.items.map(i => i.id === item.id ? { ...i, included: e.target.checked } : i);
                                      await handleSaveQuote({ ...quote, items: newItems });
                                    }}
                                  />
                                  <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                                <span className="text-gray-600 dark:text-gray-300 truncate">
                                  {categorias.find(c => c.id === item.categoryId)?.name || 'Outro'} {item.description && <span className="text-gray-400">- {item.description}</span>}
                                </span>
                              </div>
                              <span className={`font-semibold text-gray-800 dark:text-white ${item.included === false ? 'line-through' : ''}`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {quote.notes && (
                          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Observações</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{quote.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => toggleQuote(quote.id)} 
                    className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors w-full mb-4 uppercase tracking-widest"
                  >
                    {expandedQuotes[quote.id] ? 'Ocultar detalhes' : 'Ver detalhes'}
                    <svg className={`w-3.5 h-3.5 transition-transform ${expandedQuotes[quote.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 md:gap-4 mt-auto">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Custo Total</p>
                      <p className="text-sm md:text-base font-black text-[#1A4373] dark:text-sky-400 leading-none">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                      </p>
                    </div>
                    {(quote.targetAttendees && quote.ticketPrice) ? (
                      <>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex flex-col items-start">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Lucro Estimado</p>
                          <p className="text-sm md:text-base font-black text-green-600 dark:text-green-400 leading-none flex items-center gap-1.5">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((quote.targetAttendees * quote.ticketPrice) - total)}
                            <span className="text-[8px] text-gray-400 font-medium normal-case tracking-normal">
                              ({quote.targetAttendees}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.ticketPrice)})
                            </span>
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFailedModalOpen && (
        <FailedCotacoesModal
          isOpen={isFailedModalOpen}
          onClose={() => setIsFailedModalOpen(false)}
          failedCotacoes={failedCotacoes}
          onSave={handleSaveFailedQuote}
          onDelete={handleDeleteFailedQuote}
          generateId={generateId}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal 
          categorias={categorias} 
          onSave={handleSaveCategory} 
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory} 
          onReorder={handleReorderCategory}
          onClose={() => setIsCategoryModalOpen(false)} 
        />
      )}

      {editingAnnouncementFor && (
        <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-primary uppercase tracking-tighter">Antecipação do Anúncio</h3>
              <button onClick={() => setEditingAnnouncementFor(null)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Meses antes</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingAnnouncementFor.announcementOffsetMonths ?? 3}
                  onChange={e => setEditingAnnouncementFor({...editingAnnouncementFor, announcementOffsetMonths: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Dias antes</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingAnnouncementFor.announcementOffsetDays ?? 7}
                  onChange={e => setEditingAnnouncementFor({...editingAnnouncementFor, announcementOffsetDays: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
              </div>
            </div>
            <button 
              onClick={async () => {
                await handleSaveQuote(editingAnnouncementFor);
                setEditingAnnouncementFor(null);
              }}
              className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 active:scale-95"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {isQuoteModalOpen && editingQuote && (
        <QuoteModal 
          quote={editingQuote} 
          categorias={categorias} 
          onSave={handleSaveQuote} 
          onClose={() => setIsQuoteModalOpen(false)} 
          generateId={generateId}
          getDayEventsList={getDayEventsList}
        />
      )}

      {quoteToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-scale-in text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-2">Excluir Cotação</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Tem certeza que deseja excluir esta cotação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setQuoteToDelete(null)}
                className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeleteQuote(quoteToDelete)}
                className="flex-1 bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryModal = ({ categorias, onSave, onDelete, onEdit, onReorder, onClose }: any) => {
  const [newName, setNewName] = useState('');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 z-10">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-4 pr-8">Categorias de Cotação</h2>
        
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            placeholder="Nova categoria..." 
            className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white"
            onKeyDown={e => { if (e.key === 'Enter' && newName) { onSave(newName); setNewName(''); } }}
          />
          <button 
            onClick={() => { if (newName) { onSave(newName); setNewName(''); } }}
            className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {categorias.map((c: any, index: number) => (
            <div 
              key={c.id} 
              draggable={editingId !== c.id}
              onDragStart={() => setDraggedItem(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedItem !== null && draggedItem !== index) {
                  onReorder(draggedItem, index);
                }
                setDraggedItem(null);
              }}
              className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 cursor-move hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GripVerticalIcon className="w-4 h-4 text-gray-400 shrink-0" />
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onEdit(c.id, editName);
                        setEditingId(null);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    onBlur={() => {
                      onEdit(c.id, editName);
                      setEditingId(null);
                    }}
                    className="flex-1 w-full min-w-0 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-800 dark:text-white font-medium truncate">{c.name}</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                {editingId === c.id ? (
                  <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onEdit(c.id, editName); setEditingId(null); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                    <SaveIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setEditingId(c.id); setEditName(c.name); }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                    <Edit2Icon className="w-4 h-4" />
                  </button>
                )}
                <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuoteModal = ({ quote, categorias, onSave, onClose, generateId, getDayEventsList }: any) => {
  const [data, setData] = useState<Cotacao>(quote);

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
    }));
  };

  const handleAddItem = (categoryId: string) => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), categoryId, description: '', value: 0 }]
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    }));
  };

  // Ensure all categories have at least one item
  useEffect(() => {
    setData(prev => {
      const missingCats = categorias.filter((c: any) => !prev.items.some((i: any) => i.categoryId === c.id));
      if (missingCats.length === 0) return prev;
      
      return {
        ...prev,
        items: [
          ...prev.items,
          ...missingCats.map((c: any) => ({ id: generateId(), categoryId: c.id, description: '', value: 0 }))
        ]
      };
    });
  }, [categorias, generateId]);

  const total = data.items.reduce((sum: number, item: any) => item.included !== false ? sum + (item.value || 0) : sum, 0);

  const getAnnouncementDate = (quote: Cotacao) => {
    const d = new Date(quote.date);
    d.setMonth(d.getMonth() - (quote.announcementOffsetMonths ?? 3));
    d.setDate(d.getDate() - (quote.announcementOffsetDays ?? 7));
    return d;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4 py-8">
      <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-full rounded-3xl shadow-2xl flex flex-col relative animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-[#1A4373] dark:text-sky-400 uppercase tracking-tighter">
            {quote.title ? 'Editar Cotação' : 'Nova Cotação'}
          </h2>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 z-10 border border-gray-200 dark:border-gray-800 shadow-sm">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Título (Ex: Curso SP)</label>
              <input 
                type="text" 
                value={data.title} 
                onChange={e => setData({...data, title: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                placeholder="Destino ou Motivo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Data Início</label>
                <input 
                  type="date" 
                  value={(() => { const d = new Date(data.date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })()} 
                  onChange={e => {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const newDate = new Date(y, m - 1, d, 12, 0, 0);
                    setData({...data, date: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Data Fim</label>
                <input 
                  type="date" 
                  value={data.endDate ? (() => { const d = new Date(data.endDate); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })() : ''} 
                  onChange={e => {
                    if (!e.target.value) {
                      const newData = {...data};
                      delete newData.endDate;
                      setData(newData);
                      return;
                    }
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const newDate = new Date(y, m - 1, d, 12, 0, 0);
                    setData({...data, endDate: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {data.date && (
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 rounded-2xl flex items-start gap-3">
               <div className="text-primary mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                  <h4 className="text-sm font-bold text-primary tracking-tight uppercase">Data de Lançamento</h4>
                  <p className="text-[13px] text-primary/80 dark:text-primary/70 mt-1 font-medium leading-relaxed">
                     Para a data de evento selecionada, o anúncio para vender o curso deve entrar em veiculação <span className="font-bold underline decoration-primary/30">{data.announcementOffsetMonths ?? 3} meses e {data.announcementOffsetDays ?? 7} dias antes</span>, ou seja, a partir de <span className="font-bold whitespace-nowrap bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded text-primary">{new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(getAnnouncementDate(data))}</span>.
                  </p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Meta de Participantes (Meninas)</label>
              <input 
                type="number" 
                value={data.targetAttendees || ''} 
                onChange={e => setData({...data, targetAttendees: e.target.value ? parseInt(e.target.value) : undefined})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                placeholder="Ex: 20"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Valor do Ingresso</label>
              <input 
                type="text" 
                value={data.ticketPrice ? formatCurrencyInput(data.ticketPrice) : ''} 
                onChange={e => setData({...data, ticketPrice: e.target.value ? parseCurrency(formatCurrencyInput(e.target.value)) : undefined})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Itens da Cotação</h3>
            
            {categorias.map((cat: any) => {
              const catItems = data.items.filter((i: any) => i.categoryId === cat.id);
              return (
                <div key={cat.id} className="bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-700 dark:text-gray-200">{cat.name}</h4>
                  </div>
                  <div className="space-y-3">
                    {catItems.map((item: any, index: number) => (
                      <div key={item.id} className="flex gap-2 items-start relative">
                        <div className="pt-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={item.included !== false}
                              onChange={(e) => handleItemChange(item.id, 'included', e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={item.description} 
                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Descrição (opcional)"
                            className={`w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white mb-2 ${item.included === false ? 'opacity-50' : ''}`}
                          />
                        </div>
                        <div className="w-32">
                          <input 
                            type="text" 
                            value={formatCurrencyInput(item.value)}
                            onChange={e => handleItemChange(item.id, 'value', parseCurrency(formatCurrencyInput(e.target.value)))}
                            placeholder="R$ 0,00"
                            className={`w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white font-semibold text-right ${item.included === false ? 'opacity-50 line-through text-gray-400' : ''}`}
                            disabled={item.included === false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Observações</label>
            <textarea 
              value={data.notes || ''} 
              onChange={e => setData({...data, notes: e.target.value})}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white resize-none"
              rows={3}
              placeholder="Links, detalhes, contatos..."
            />
          </div>
        </div>

        <div className="p-4 px-5 border-t border-gray-100 dark:border-gray-800 shrink-0 flex flex-col gap-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-b-3xl">
          <div className="flex items-center justify-center w-full gap-3 md:gap-4 text-left">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Custo Total</p>
              <p className="text-sm md:text-base font-black text-[#1A4373] dark:text-sky-400 leading-none">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </p>
            </div>
            {(data.targetAttendees && data.ticketPrice) ? (
              <>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col items-start">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Lucro Estimado</p>
                  <p className="text-sm md:text-base font-black text-green-600 dark:text-green-400 leading-none flex items-center gap-1.5">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((data.targetAttendees * data.ticketPrice) - total)}
                    <span className="text-[8px] text-gray-400 font-medium normal-case tracking-normal">
                      ({data.targetAttendees}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.ticketPrice)})
                    </span>
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <button 
            onClick={() => onSave(data)}
            disabled={!data.title}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black uppercase tracking-tighter text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon className="w-5 h-5" />
            Salvar Cotação
          </button>
        </div>
      </div>
    </div>
  );
};


const FailedCotacoesModal = ({ isOpen, onClose, failedCotacoes, onSave, onDelete, generateId }: any) => {
  const [data, setData] = useState<Partial<FailedCotacao>>({});
  const [adSpendText, setAdSpendText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'menu' | 'add' | 'history'>('menu');
  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!data.name || !data.date) return;
    
    const isEditing = !!editingId;
    const finalData = {
      id: isEditing ? editingId : generateId(),
      name: data.name,
      date: new Date(data.date),
      adSpend: Number(data.adSpend) || 0,
      createdAt: isEditing && data.createdAt ? new Date(data.createdAt) : new Date()
    };
    
    await onSave(finalData);
    setData({});
    setEditingId(null);
    setViewMode('history'); // Go to history to see the added item
  };

  const handleEdit = (f: FailedCotacao) => {
    setViewMode('add');
    setEditingId(f.id);
    const d = new Date(f.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    setData({
      name: f.name,
      date: d,
      adSpend: f.adSpend,
      createdAt: f.createdAt
    });
    
    setAdSpendText(f.adSpend ? formatCurrencyInput(f.adSpend) : '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setData({});
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>(failedCotacoes.map((f: FailedCotacao) => new Date(f.date).getFullYear()));
    const currentYear = new Date().getFullYear();
    const minYear = Math.min(currentYear, ...Array.from(years).length > 0 ? Array.from(years) : [currentYear]);
    for (let y = minYear; y <= 2100; y++) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [failedCotacoes]);

  const sortedFailed = useMemo(() => {
    return [...failedCotacoes]
      .filter((f: FailedCotacao) => {
        const d = new Date(f.date);
        const matchMonth = filterMonth === 'all' || d.getMonth() === filterMonth;
        const matchYear = filterYear === 'all' || d.getFullYear() === filterYear;
        return matchMonth && matchYear;
      })
      .sort((a: FailedCotacao, b: FailedCotacao) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [failedCotacoes, filterMonth, filterYear]);

  const totalLoss = sortedFailed.reduce((sum, f) => sum + (f.adSpend || 0), 0);
  
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4 py-8">
      <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-full rounded-3xl shadow-2xl flex flex-col relative animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter truncate">Estados Testados</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap truncate">Relatório de estados testados sem sucesso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-gray-200 dark:border-gray-800 shadow-sm">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-row justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}
              className="flex-1 h-32 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                <PlusIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">Adicionar Estado</h3>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className="flex-1 h-32 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">Ver Estados</h3>
            </button>
          </div>
        )}

        {viewMode === 'add' && (
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50 dark:bg-black/20">
            <div className="mb-4">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                {editingId ? 'Editar Registro' : 'Novo Registro'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data da Tentativa</label>
                  <div className="flex gap-2">
                    <select
                      value={data.date ? (data.date as Date).getMonth() : new Date().getMonth()}
                      onChange={e => {
                        const m = Number(e.target.value);
                        const y = data.date ? (data.date as Date).getFullYear() : new Date().getFullYear();
                        setData({...data, date: new Date(y, m, 1, 12, 0, 0)});
                      }}
                      className="w-1/2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    >
                      {months.map((m, i) => (
                        <option key={i} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <select
                      value={data.date ? (data.date as Date).getFullYear() : new Date().getFullYear()}
                      onChange={e => {
                        const y = Number(e.target.value);
                        const m = data.date ? (data.date as Date).getMonth() : new Date().getMonth();
                        setData({...data, date: new Date(y, m, 1, 12, 0, 0)});
                      }}
                      className="w-1/2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    >
                      {Array.from({ length: 2100 - new Date().getFullYear() + 1 }, (_, i) => new Date().getFullYear() + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Estado</label>
                  <input 
                    type="text" 
                    value={data.name || ''} 
                    onChange={e => setData({...data, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    placeholder="Ex: São Paulo, Rio de Janeiro"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gasto em Anúncios</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                    <input 
                      type="text" 
                      value={adSpendText} 
                      onChange={e => {
                        const val = formatCurrencyInput(e.target.value);
                        setAdSpendText(val);
                        setData({...data, adSpend: parseCurrency(val)});
                      }}
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  {editingId && (
                    <button 
                      onClick={() => setViewMode('history')}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={!data.name || !data.date}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                  >
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'history' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-gray-50 dark:bg-black/20">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors shrink-0"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Voltar
              </button>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 sm:w-32"
                >
                  <option value="all">Todos os Meses</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 w-auto"
                >
                  <option value="all">Todos os Anos</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {sortedFailed.map(f => (
                <div key={f.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                  {deleteConfirmId === f.id ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-sm font-bold text-red-500">Confirmar exclusão?</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200">Cancelar</button>
                        <button onClick={() => { onDelete(f.id); setDeleteConfirmId(null); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg shadow-sm shadow-red-500/20">Excluir</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                          <span className="text-base font-black text-gray-800 dark:text-white uppercase leading-none">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white text-sm">{f.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded tracking-wide">
                              Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.adSpend || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(f)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                          <Edit2Icon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(f.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {sortedFailed.length === 0 && (
                 <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <AlertCircleIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Nenhum estado marcado como testado.</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'history' && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark rounded-b-3xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total de Gastos</span>
              <span className="text-lg font-black text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
