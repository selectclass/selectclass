
import React, { useState, useMemo } from 'react';
import { CalendarEvent, CourseType } from '../types';
import { SearchIcon, CalendarIcon, CheckCircleIcon, AlertCircleIcon, BoxIcon } from './Icons';

interface HistoryScreenProps {
  events: CalendarEvent[];
  courseTypes: CourseType[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ events, courseTypes }) => {
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'cursos' | 'palestras'>('cursos');

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const years = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => 2026 + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Helper para verificar se o evento é uma palestra
  const checkIfPalestra = (event: CalendarEvent) => {
    const config = courseTypes.find(c => c.name === event.title);
    return config?.model === 'Palestra' || 
           event.title === 'Palestra' || 
           event.title === 'Workshop';
  };

  // Filter Logic: Category + Month + Year + Search Term + Day
  // Ordenação alterada para ASCENDENTE (do menor mês/data para o maior)
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      
      // Filtro de Categoria
      const isPal = checkIfPalestra(e);
      const matchesCategory = filterType === 'palestras' ? isPal : !isPal;
      if (!matchesCategory) return false;

      // Filtro de Data
      const matchesYear = d.getFullYear() === selectedYear;
      const matchesMonth = selectedMonth === 'all' || d.getMonth() === selectedMonth;
      const matchesDay = selectedDay === 'all' || d.getDate() === Number(selectedDay);
      
      // Filtro de Busca
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
                            (e.student?.toLowerCase() || '').includes(searchLower) ||
                            (e.title?.toLowerCase() || '').includes(searchLower) ||
                            (e.eventLocation?.toLowerCase() || '').includes(searchLower);

      return matchesYear && matchesMonth && matchesDay && matchesSearch;
    }).sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
  }, [events, selectedMonth, selectedYear, searchTerm, selectedDay, filterType, courseTypes]);

  return (
    <div className="p-4 pb-32">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Histórico</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Consulte atendimentos passados.</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner">
                <button onClick={() => setFilterType('cursos')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'cursos' ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}>Cursos</button>
                <button onClick={() => setFilterType('palestras')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'palestras' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-400'}`}>Palestras</button>
            </div>
        </div>

        {/* --- CAPSULE FILTERS (Day & Month & Year) --- */}
        <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1.5 rounded-full border border-gray-200 dark:border-gray-700/50 shadow-inner overflow-x-auto no-scrollbar">
                
                {/* Day Selector */}
                <div className="relative group min-w-[70px]">
                    <select 
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full appearance-none bg-white dark:bg-surface-dark py-2 pl-3 pr-6 rounded-full text-[11px] font-black uppercase text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700"
                    >
                        <option value="all">Dia</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                {/* Month Selector */}
                <div className="relative group min-w-[90px]">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full appearance-none bg-white dark:bg-surface-dark py-2 pl-3 pr-8 rounded-full text-[11px] font-black uppercase text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700"
                    >
                        <option value="all">Mês</option>
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                {/* Year Selector */}
                <div className="relative group">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none bg-white dark:bg-surface-dark py-2 pl-4 pr-8 rounded-full text-[11px] font-black uppercase text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SMART SEARCH --- */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className={`h-5 w-5 ${filterType === 'palestras' ? 'text-sky-400' : 'text-primary'}`} />
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all shadow-sm ${filterType === 'palestras' ? 'border-sky-100 focus:ring-sky-500' : 'border-gray-200 focus:ring-primary dark:border-gray-700'}`}
            placeholder={filterType === 'palestras' ? "Buscar contratante ou palestra..." : "Buscar aluna ou curso..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- LIST --- */}
        <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Agendamento encontrado' : 'Agendamentos encontrados'}
            </p>
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nenhum registro encontrado para este período.</p>
                </div>
            ) : (
                filteredEvents.map(event => {
                    const totalPaid = event.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
                    const isFullyPaid = (event.paymentStatus === 'paid') || (totalPaid >= (event.value || 0));
                    const isPal = checkIfPalestra(event);
                    
                    return (
                        <div key={event.id} className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border flex items-start gap-4 transition-colors ${isPal ? 'border-sky-100 dark:border-sky-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                            {/* Status Icon */}
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                ${isFullyPaid ? (isPal ? 'bg-sky-100 text-sky-600' : 'bg-green-100 text-green-600 dark:bg-green-900/20') : 'bg-red-100 text-red-500 dark:bg-red-900/20'}
                            `}>
                                {isFullyPaid ? <CheckCircleIcon className="w-5 h-5" /> : <AlertCircleIcon className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-800 dark:text-white text-base truncate pr-2 uppercase tracking-tighter">
                                        {event.student || (isPal ? 'Evento Corporativo' : 'Aluna')}
                                    </h4>
                                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                                        {event.date ? new Date(event.date).toLocaleDateString('pt-BR') : ''}
                                    </span>
                                </div>
                                <p className={`text-xs font-black uppercase tracking-widest truncate mb-1 ${isPal ? 'text-sky-500' : 'text-primary dark:text-blue-300'}`}>
                                    {event.title}
                                </p>
                                
                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                    <span className="flex items-center gap-1">
                                        <BoxIcon className="w-3 h-3" /> {event.materials?.length || 0} {isPal ? 'gastos' : 'itens'}
                                    </span>
                                    <span className={isFullyPaid ? 'text-emerald-500' : 'text-red-500'}>
                                        {isFullyPaid ? '✓ Quitado' : '! Pendente'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};
