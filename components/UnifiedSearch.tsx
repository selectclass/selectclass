import React from 'react';
import { SearchIcon, XIcon, CalendarIcon } from './Icons';
import { CalendarEvent, CourseType } from '../types';

interface UnifiedSearchProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeTab: 'cursos' | 'palestras';
  onTabChange: (tab: 'cursos' | 'palestras') => void;
  allEvents: CalendarEvent[];
  courseTypes: CourseType[];
  onResultClick: (event: CalendarEvent) => void;
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  activeTab, 
  onTabChange,
  allEvents,
  courseTypes,
  onResultClick
}) => {
  const monthShortNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Lógica de Filtragem Global Refinada
  const results = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const search = searchTerm.toLowerCase();
    return allEvents.filter(e => {
      const config = courseTypes.find(c => c.name === e.title);
      const isPalestra = config?.model === "Palestra";
      const matchesCategory = activeTab === 'palestras' ? isPalestra : !isPalestra;
      
      if (!matchesCategory) return false;

      // Busca Inteligente por múltiplos campos
      if (activeTab === 'cursos') {
          return (e.student || '').toLowerCase().includes(search) || 
                 (e.title || '').toLowerCase().includes(search);
      } else {
          return (e.title || '').toLowerCase().includes(search) || 
                 (e.eventLocation || '').toLowerCase().includes(search) ||
                 (e.student || '').toLowerCase().includes(search);
      }
    }).slice(0, 10); // Limite aumentado para 10 resultados no dropdown
  }, [searchTerm, allEvents, activeTab, courseTypes]);

  return (
    <div className="px-4 mt-4 space-y-3 relative z-40">
      {/* Seletor de Categoria na Busca */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onTabChange('cursos')}
          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border
            ${activeTab === 'cursos' 
              ? 'bg-primary text-white border-primary shadow-sm' 
              : 'bg-white dark:bg-surface-dark text-gray-400 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
        >
          Buscar Alunas
        </button>
        <button 
          onClick={() => onTabChange('palestras')}
          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border
            ${activeTab === 'palestras' 
              ? 'bg-sky-500 text-white border-sky-500 shadow-sm' 
              : 'bg-white dark:bg-surface-dark text-gray-400 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
        >
          Buscar Palestras
        </button>
      </div>

      {/* Campo de Busca Dinâmico */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className={`w-4 h-4 transition-colors ${searchTerm ? (activeTab === 'palestras' ? 'text-sky-500' : 'text-primary') : 'text-gray-400'}`} />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={activeTab === 'cursos' ? "BUSCAR ALUNAS..." : "BUSCAR PALESTRAS..."}
          className={`w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white dark:bg-surface-dark border transition-all shadow-sm outline-none text-sm uppercase font-bold tracking-wider
            ${activeTab === 'palestras' 
              ? 'border-sky-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 text-sky-700 placeholder-sky-300' 
              : 'border-gray-100 dark:border-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 text-gray-800 dark:text-white placeholder-gray-400'
            }`}
        />

        {searchTerm && (
          <button 
            onClick={() => onSearchChange('')}
            className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${activeTab === 'palestras' ? 'text-sky-400 hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {/* Lista de Resultados Globais (Dropdown) */}
        {searchTerm.length >= 2 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
            {results.length > 0 ? (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                {results.map((event) => {
                  const d = event.date ? new Date(event.date) : new Date();
                  const dateLabel = `${monthShortNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
                  
                  return (
                    <li key={event.id}>
                      <button 
                        onClick={() => onResultClick(event)}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left
                          ${activeTab === 'palestras' ? 'hover:bg-sky-50 dark:hover:bg-sky-900/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}
                        `}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-bold truncate ${activeTab === 'palestras' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-800 dark:text-white'}`}>
                            {activeTab === 'cursos' ? event.student : event.title}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {activeTab === 'cursos' ? event.title : (event.student ? `${event.student} - ` : '') + (event.eventLocation || 'Palestra')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-lg flex-shrink-0">
                          <CalendarIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{dateLabel}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center text-xs text-gray-400 italic">
                Nenhum registro encontrado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};