import React, { useState, useMemo } from 'react';
import { CalendarEvent, CourseType, LectureModel } from '../types';
import { SearchIcon, XIcon, CalendarIcon, MapPinIcon, ClockIcon } from './Icons';

interface AllEventsListProps {
  events: CalendarEvent[];
  courseTypes: CourseType[];
  lectureModels: LectureModel[];
  onEventClick: (event: CalendarEvent) => void;
}

export const AllEventsList: React.FC<AllEventsListProps> = ({ events, courseTypes, lectureModels, onEventClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'cursos' | 'palestras'>('cursos');

  const checkIfPalestra = (event: CalendarEvent) => {
    const config = courseTypes.find(c => c.name === event.title);
    return config?.model === 'Palestra' || 
           event.title === 'Palestra' || 
           event.title === 'Workshop' || 
           lectureModels.some(m => m.name === event.title);
  };

  const filteredResults = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return events
      .filter(e => {
        const isPal = checkIfPalestra(e);
        const matchesCategory = activeTab === 'palestras' ? isPal : !isPal;
        if (!matchesCategory) return false;

        if (!search) return true;
        return (e.student || '').toLowerCase().includes(search) || 
               (e.title || '').toLowerCase().includes(search) ||
               (e.eventLocation || '').toLowerCase().includes(search);
      })
      .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB; // Ordem cronológica crescente: de janeiro em diante
      });
  }, [events, searchTerm, activeTab, courseTypes, lectureModels]);

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-32">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter whitespace-nowrap">TODOS AGENDAMENTOS</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Explore todos os seus agendamentos</p>
      </div>

      <div className="space-y-4">
        {/* Seletor de Categoria */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
          <button 
            onClick={() => setActiveTab('cursos')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${activeTab === 'cursos' 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
          >
            Cursos
          </button>
          <button 
            onClick={() => setActiveTab('palestras')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${activeTab === 'palestras' 
                ? 'bg-sky-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
          >
            Palestras
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className={`w-4 h-4 ${activeTab === 'palestras' ? 'text-sky-500' : 'text-primary'}`} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'cursos' ? "BUSCAR ALUNA OU CURSO..." : "BUSCAR LOCAL OU PALESTRA..."}
            className={`w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white dark:bg-surface-dark border transition-all outline-none text-xs font-black uppercase tracking-widest
              ${activeTab === 'palestras' 
                ? 'border-sky-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 text-sky-800 dark:text-white' 
                : 'border-gray-100 dark:border-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 text-gray-800 dark:text-white'
              }`}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
          {filteredResults.length} {filteredResults.length === 1 ? 'Agendamento encontrado' : 'Agendamentos encontrados'}
        </p>
        
        {filteredResults.length > 0 ? (
          filteredResults.map((event) => {
            const date = event.date ? new Date(event.date) : new Date();
            return (
              <button 
                key={event.id}
                onClick={() => onEventClick(event)}
                className="w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-left hover:scale-[1.01] transition-transform active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-800 dark:text-white text-base truncate uppercase tracking-tighter">
                            {activeTab === 'cursos' ? event.student : event.title}
                        </h4>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'palestras' ? 'text-sky-500' : 'text-primary dark:text-blue-300'}`}>
                            {activeTab === 'cursos' ? event.title : (event.student || 'Evento')}
                        </p>
                    </div>
                    <div className="bg-primary px-2.5 py-1.5 rounded-xl text-center flex-shrink-0 shadow-lg shadow-primary/20">
                        <span className="text-[10px] font-black text-white block leading-none">
                            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <span className="text-[8px] font-black text-white/80 uppercase mt-0.5 block">
                            {date.getFullYear()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[9px] font-bold uppercase truncate">{event.eventLocation || 'Meu Studio'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 justify-end">
                        <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[9px] font-bold uppercase">{event.time}</span>
                    </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-40 text-center px-6">
              <SearchIcon className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Nenhum agendamento encontrado para este termo de busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};