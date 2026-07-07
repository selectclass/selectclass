import React, { useState, useEffect } from 'react';
import { Cotacao, CotacaoCategoria, CotacaoItem } from '../types';
import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon } from './Icons';
import { formatCurrencyInput, parseCurrency } from '../utils/currency';
import { Calendar } from './Calendar';

interface CotacoesScreenProps {
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

export const CotacoesScreen: React.FC<CotacoesScreenProps> = ({ api, generateId, onClose, events = [], courseTypes = [], lectureModels = [] }) => {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [categorias, setCategorias] = useState<CotacaoCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  
  const [editingQuote, setEditingQuote] = useState<Cotacao | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAllDates, setShowAllDates] = useState(false);

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
        setCategorias(uniqueCats);
      } else {
        // default categories
        const defaultCats = [
          { id: generateId(), name: 'Hotel' },
          { id: generateId(), name: 'Passagem Aérea' },
          { id: generateId(), name: 'Alimentação' },
          { id: generateId(), name: 'Transporte' },
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
    if (confirm('Tem certeza que deseja excluir esta cotação?')) {
      await api.delete(`v1/data/cotacoes/${id}`);
      fetchData();
    }
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
    const courses = getDayEventsList(selectedDate);
    if (courses.length > 0) {
       alert(`Neste dia já tem o curso: ${courses.join(', ')}`);
       return;
    }
    setEditingQuote({
      id: generateId(),
      title: '',
      date: selectedDate,
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
                 const courses = getDayEventsList(date);
                 if (courses.length > 0) {
                   alert(`Neste dia já tem o curso: ${courses.join(', ')}`);
                   // We don't block the selection, but they can't quote
                 }
                 setSelectedDate(date);
               }} 
               events={events}
               courseTypes={courseTypes}
               lectureModels={lectureModels}
               showTooltipForEvents={true}
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
              const total = quote.items.reduce((sum, item) => sum + item.value, 0);
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
                      <button onClick={() => handleDeleteQuote(quote.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 flex-1">
                    {quote.items.filter(i => i.value > 0 || i.description).slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[60%]">
                          {categorias.find(c => c.id === item.categoryId)?.name || 'Outro'} {item.description && <span className="text-gray-400">- {item.description}</span>}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                        </span>
                      </div>
                    ))}
                    {quote.items.filter(i => i.value > 0 || i.description).length > 3 && (
                      <div className="text-xs text-gray-400 text-center pt-1">+ {quote.items.filter(i => i.value > 0 || i.description).length - 3} itens</div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center mt-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Previsto</span>
                    <span className="text-xl font-black text-[#1A4373] dark:text-sky-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </span>
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
          onDelete={handleDeleteCategory} 
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
    </div>
  );
};

const CategoryModal = ({ categorias, onSave, onDelete, onClose }: any) => {
  const [newName, setNewName] = useState('');

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
          {categorias.map((c: any) => (
            <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-white font-medium">{c.name}</span>
              <button onClick={() => onDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
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

  const total = data.items.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

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
                  value={data.date.toISOString().split('T')[0]} 
                  onChange={e => {
                    const newDate = new Date(e.target.value);
                    const courses = getDayEventsList(newDate);
                    if (courses.length > 0) {
                      alert(`Neste dia já tem o curso: ${courses.join(', ')}`);
                      return;
                    }
                    setData({...data, date: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Data Fim</label>
                <input 
                  type="date" 
                  value={data.endDate ? data.endDate.toISOString().split('T')[0] : ''} 
                  onChange={e => {
                    if (!e.target.value) {
                      const newData = {...data};
                      delete newData.endDate;
                      setData(newData);
                      return;
                    }
                    const newDate = new Date(e.target.value);
                    const courses = getDayEventsList(newDate);
                    if (courses.length > 0) {
                      alert(`Neste dia já tem o curso: ${courses.join(', ')}`);
                      return;
                    }
                    setData({...data, endDate: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
              </div>
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
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={item.description} 
                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Descrição (opcional)"
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white mb-2"
                          />
                        </div>
                        <div className="w-32">
                          <input 
                            type="text" 
                            value={formatCurrencyInput(item.value)}
                            onChange={e => handleItemChange(item.id, 'value', parseCurrency(formatCurrencyInput(e.target.value)))}
                            placeholder="R$ 0,00"
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white font-semibold text-right"
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

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-b-3xl">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total da Cotação</p>
            <p className="text-2xl font-black text-[#1A4373] dark:text-sky-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </p>
          </div>
          <button 
            onClick={() => onSave(data)}
            disabled={!data.title}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-tighter text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon className="w-5 h-5" />
            Salvar Cotação
          </button>
        </div>
      </div>
    </div>
  );
};
