import React, { useState, useEffect } from 'react';
import { Cotacao, CotacaoCategoria, CotacaoItem } from '../types';
import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon, GripVerticalIcon } from './Icons';
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
  const [isLoading, setIsLoading] = useState(true);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  
  const [editingQuote, setEditingQuote] = useState<Cotacao | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAllDates, setShowAllDates] = useState(false);

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
      const [catsRes, quotesRes] = await Promise.all([
        api.get('v1/data/cotacaoCategorias'),
        api.get('v1/data/cotacoes')
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
  });

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

           <div className="flex justify-end mb-2">
               <button 
                  onClick={() => setShowAllDates(!showAllDates)} 
                  className={`w-full py-3 rounded-xl border shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all ${showAllDates ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-white/5 text-primary border-gray-200 dark:border-gray-800'}`}
               >
                   <div className={`p-1 rounded-full ${showAllDates ? 'bg-white/20' : 'bg-primary/5 dark:bg-primary/10'}`}>
                       <SearchIcon className={`w-4 h-4 ${showAllDates ? 'text-white' : 'text-primary'}`} />
                   </div>
                   <span className="text-[9px] font-black tracking-widest uppercase">
                       {showAllDates ? 'MOSTRAR POR DATA' : 'TODAS COTAÇÕES'}
                   </span>
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
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
                  
                  <div className="space-y-3 mb-4 flex-1">
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
