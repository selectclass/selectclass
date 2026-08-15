
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarEvent, Expense, CourseType, LectureModel } from '../types';
import { PencilIcon, DollarSignIcon, TrendingDownIcon, BarChartIcon, XIcon, ChevronLeftIcon } from './Icons';
import { formatCurrencyInput, parseCurrency } from '../utils/currency';

interface FinancialScreenProps {
  events: CalendarEvent[];
  annualGoal?: number;
  annualGoalJhonatta?: number;
  annualGoalDaniele?: number;
  onUpdateGoal?: (goal: number) => void;
  onUpdateGoalJhonatta?: (goal: number) => void;
  onUpdateGoalDaniele?: (goal: number) => void;
  expenses: Expense[];
  courseTypes: CourseType[];
  lectureModels: LectureModel[];
  onClose?: () => void;
}

export const FinancialScreen: React.FC<FinancialScreenProps> = ({ 
  events, 
  annualGoal, 
  annualGoalJhonatta, 
  annualGoalDaniele, 
  onUpdateGoal, 
  onUpdateGoalJhonatta, 
  onUpdateGoalDaniele, 
  expenses, 
  courseTypes, 
  lectureModels, 
  onClose 
}) => {
  const now = new Date();
  
  const [selectedDay, setSelectedDay] = useState<number | 'all'>(now.getDate());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(now.getMonth());
  const [filterType, setFilterType] = useState<'cursos' | 'palestras'>('cursos');
  const [touchedMonth, setTouchedMonth] = useState<number | null>(null);

  const goalJhonatta = annualGoalJhonatta ?? annualGoal ?? 81000;
  const goalDaniele = annualGoalDaniele ?? 81000;

  const [isEditingGoalJhonatta, setIsEditingGoalJhonatta] = useState(false);
  const [tempGoalJhonatta, setTempGoalJhonatta] = useState(formatCurrencyInput(goalJhonatta));
  const goalInputRefJhonatta = useRef<HTMLInputElement>(null);

  const [isEditingGoalDaniele, setIsEditingGoalDaniele] = useState(false);
  const [tempGoalDaniele, setTempGoalDaniele] = useState(formatCurrencyInput(goalDaniele));
  const goalInputRefDaniele = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingGoalJhonatta && goalInputRefJhonatta.current) {
        goalInputRefJhonatta.current.focus();
    }
  }, [isEditingGoalJhonatta]);

  useEffect(() => {
    if (isEditingGoalDaniele && goalInputRefDaniele.current) {
        goalInputRefDaniele.current.focus();
    }
  }, [isEditingGoalDaniele]);

  const years = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => 2026 + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthShortNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const checkIfPalestra = (event: CalendarEvent) => {
    if (event.palestraType) return true;
    const config = courseTypes.find(c => c.name === event.title);
    return config?.model === 'Palestra' || 
           event.title === 'Palestra' || 
           event.title === 'Workshop' ||
           lectureModels.some(m => m.name === event.title);
  };

  const currentPeriodMetrics = useMemo(() => {
    const filteredEvents = events.filter(e => {
        if (!e.date) return false; 
        const eDate = new Date(e.date);
        const matchYear = eDate.getFullYear() === selectedYear;
        const matchMonth = selectedMonth === 'all' || eDate.getMonth() === selectedMonth;
        const matchDay = selectedDay === 'all' || eDate.getDate() === Number(selectedDay);
        const isPal = checkIfPalestra(e);
        const matchType = filterType === 'palestras' ? isPal : !isPal;
        return matchYear && matchMonth && matchDay && matchType;
    });

    const totalFaturamento = filteredEvents.reduce((acc, curr) => {
        if (curr.includeInAnnualRevenue === false) return acc;
        const isPal = checkIfPalestra(curr);
        const baseVal = parseCurrency(curr.value) || 0;
        const totalVal = (isPal && curr.palestraType === 'MEU') ? baseVal * (curr.studentCount || 1) : baseVal;
        return acc + totalVal;
    }, 0);

    const manualExpenses = expenses
        .filter(exp => {
            const d = new Date(exp.date);
            const matchesDate = d.getFullYear() === selectedYear && 
                               (selectedMonth === 'all' || d.getMonth() === selectedMonth) && 
                               (selectedDay === 'all' || d.getDate() === Number(selectedDay));
            return matchesDate && (exp.category === filterType);
        })
        .reduce((a, c) => a + parseCurrency(c.amount), 0);

    const checklistExpenses = filteredEvents.reduce((acc, event) => {
        const isPal = checkIfPalestra(event);
        const materials = event.materials || [];
        const matCost = materials.reduce((mAcc, m) => mAcc + parseCurrency(m.cost), 0);
        return acc + matCost;
    }, 0);

    const totalExpenses = manualExpenses + checklistExpenses;

    return { gross: totalFaturamento, net: totalFaturamento - totalExpenses, expenses: totalExpenses };
  }, [events, expenses, selectedYear, selectedMonth, selectedDay, filterType, courseTypes, lectureModels]);

  const annualChartData = useMemo(() => {
      const data = Array(12).fill(0).map(() => ({ gross: 0, net: 0 }));
      
      // Faturamento por mês
      events.forEach(e => {
          if (!e.date) return;
          const d = new Date(e.date);
          if (d.getFullYear() !== selectedYear) return;
          const isPal = checkIfPalestra(e);
          const matchType = filterType === 'palestras' ? isPal : !isPal;
          if (!matchType) return;
          
          const mIndex = d.getMonth();
          
          if (e.includeInAnnualRevenue !== false) {
              const baseVal = parseCurrency(e.value) || 0;
              const val = (isPal && e.palestraType === 'MEU') ? baseVal * (e.studentCount || 1) : baseVal;
              data[mIndex].gross += val;
          }
          
          const materials = e.materials || [];
          const matCost = materials.reduce((mAcc, m) => mAcc + parseCurrency(m.cost), 0);
          data[mIndex].net -= matCost;
      });

      // Despesas manuais por mês
      expenses.forEach(exp => {
        const d = new Date(exp.date);
        if (d.getFullYear() !== selectedYear) return;
        if (exp.category !== filterType) return;
        const mIndex = d.getMonth();
        data[mIndex].net -= parseCurrency(exp.amount);
      });

      for(let i=0; i<12; i++) data[i].net += data[i].gross;
      return data;
  }, [events, expenses, selectedYear, filterType, courseTypes, lectureModels]);

  const maxChartValue = Math.max(...annualChartData.map(d => d.gross), 100);

  const totalAnnualPaidJhonatta = useMemo(() => {
    return events.reduce((acc, e) => {
      if (!e.date) return acc;
      const d = new Date(e.date);
      if (d.getFullYear() !== selectedYear) return acc;
      
      if (e.includeInAnnualRevenue === false) return acc;

      const owner = e.annualRevenueOwner || 'jhonatta';
      if (owner !== 'jhonatta') return acc;
      
      const paymentsSum = e.payments?.reduce((pAcc, p) => pAcc + parseCurrency(p.amount), 0) || 0;
      if (e.paymentStatus === 'paid' && paymentsSum === 0) {
          const isPal = checkIfPalestra(e);
          const baseVal = parseCurrency(e.value) || 0;
          const totalVal = (isPal && e.palestraType === 'MEU') ? baseVal * (e.studentCount || 1) : baseVal;
          return acc + totalVal;
      }
      return acc + paymentsSum;
    }, 0);
  }, [events, selectedYear, courseTypes, lectureModels]);

  const totalAnnualPaidDaniele = useMemo(() => {
    return events.reduce((acc, e) => {
      if (!e.date) return acc;
      const d = new Date(e.date);
      if (d.getFullYear() !== selectedYear) return acc;
      
      if (e.includeInAnnualRevenue === false) return acc;

      const owner = e.annualRevenueOwner || 'jhonatta';
      if (owner !== 'daniele') return acc;
      
      const paymentsSum = e.payments?.reduce((pAcc, p) => pAcc + parseCurrency(p.amount), 0) || 0;
      if (e.paymentStatus === 'paid' && paymentsSum === 0) {
          const isPal = checkIfPalestra(e);
          const baseVal = parseCurrency(e.value) || 0;
          const totalVal = (isPal && e.palestraType === 'MEU') ? baseVal * (e.studentCount || 1) : baseVal;
          return acc + totalVal;
      }
      return acc + paymentsSum;
    }, 0);
  }, [events, selectedYear, courseTypes, lectureModels]);

  const progressJhonatta = goalJhonatta > 0 ? Math.min((totalAnnualPaidJhonatta / goalJhonatta) * 100, 100) : 0;
  const progressDaniele = goalDaniele > 0 ? Math.min((totalAnnualPaidDaniele / goalDaniele) * 100, 100) : 0;

  const handleSaveGoalJhonatta = () => {
    const val = parseCurrency(tempGoalJhonatta);
    if (!isNaN(val) && val > 0) {
      if (onUpdateGoalJhonatta) onUpdateGoalJhonatta(val);
      else if (onUpdateGoal) onUpdateGoal(val);
      setIsEditingGoalJhonatta(false);
    }
  };

  const handleSaveGoalDaniele = () => {
    const val = parseCurrency(tempGoalDaniele);
    if (!isNaN(val) && val > 0) {
      if (onUpdateGoalDaniele) onUpdateGoalDaniele(val);
      setIsEditingGoalDaniele(false);
    }
  };

  const isNetNegative = currentPeriodMetrics.net < 0;

  return (
    <div className="pb-32 px-4 pt-4">
      <div className="flex flex-col mb-4 gap-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-tighter">Financeiro</h2>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-gray-200 dark:border-gray-800 shadow-sm"
                  title="Fechar"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
          </div>
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner self-start">
                <button onClick={() => setFilterType('cursos')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'cursos' ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}>Cursos</button>
                <button onClick={() => setFilterType('palestras')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'palestras' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-400'}`}>Palestras</button>
          </div>
      </div>

      <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
                <select 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full appearance-none bg-white dark:bg-surface-dark py-3 pl-3 pr-8 rounded-xl text-[11px] font-black uppercase text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700"
                >
                    <option value="all">Dia</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            <div className="flex-[1.2] relative">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full appearance-none bg-white dark:bg-surface-dark py-3 pl-3 pr-8 rounded-xl text-[11px] font-black uppercase text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700"
                >
                    <option value="all">Mês</option>
                    {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            <div className="w-20 relative">
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full appearance-none bg-white dark:bg-surface-dark py-3 pl-2 pr-2 rounded-xl text-[11px] font-black uppercase text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700 text-center"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-6">
               <div className={`p-2 rounded-lg ${filterType === 'palestras' ? 'bg-sky-50 text-sky-500' : 'bg-blue-50 text-primary dark:text-blue-300'}`}>
                    <BarChartIcon className="w-5 h-5" />
               </div>
               <div>
                   <h3 className="font-black text-gray-800 dark:text-white text-base uppercase tracking-tight">{filterType === 'palestras' ? 'Recebimentos Palestras' : 'Recebimentos Cursos'}</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ano de {selectedYear}</p>
               </div>
          </div>
          <div className="relative h-56 w-full">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                  {[100, 75, 50, 25, 0].map((pct) => <div key={pct} className="w-full border-b border-gray-100 dark:border-gray-800 h-px border-dashed opacity-50"></div>)}
              </div>
              <div className="absolute inset-0 flex items-end justify-between gap-2 pt-4 px-1 pb-2">
                  {annualChartData.map((data, index) => {
                      const heightPct = maxChartValue > 0 ? (data.gross / maxChartValue) * 100 : 0;
                      const isSelected = index === selectedMonth;
                      const isTouched = index === touchedMonth;
                      
                      return (
                          <div 
                              key={index} 
                              className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end" 
                              onClick={() => setSelectedMonth(index)}
                              onMouseEnter={() => setTouchedMonth(index)}
                              onMouseLeave={() => setTouchedMonth(null)}
                          >
                              {(isTouched || isSelected) && data.gross > 0 && (
                                  <div className="absolute -top-12 z-20 bg-gray-900 dark:bg-gray-800 text-white text-[9px] font-black px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-fade-in pointer-events-none transform -translate-x-1/2 left-1/2 border border-white/10">
                                      R$ {data.gross.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                      <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 border-b border-r border-white/10"></div>
                                  </div>
                              )}

                              <div className={`w-3 sm:w-4 rounded-full transition-all duration-500 ease-out relative z-10 shadow-sm ${isSelected ? (filterType === 'palestras' ? 'bg-sky-500' : 'bg-primary shadow-blue-500/30') : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${Math.max(heightPct, 6)}%` }}></div>
                              <span className={`text-[9px] mt-3 font-black uppercase transition-colors ${isSelected ? (filterType === 'palestras' ? 'text-sky-500' : 'text-primary dark:text-blue-300') : 'text-gray-400'}`}>{monthShortNames[index]}</span>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`relative w-full rounded-2xl p-5 shadow-lg text-white ${filterType === 'palestras' ? 'bg-sky-500 shadow-sky-500/20' : 'bg-primary shadow-primary/20'}`}>
                <div className="flex justify-between items-start mb-1">
                    <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">{filterType === 'palestras' ? 'Cachê Total' : 'Faturamento Bruto'}</span>
                    <DollarSignIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-black tracking-tighter">R$ {currentPeriodMetrics.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className={`relative w-full rounded-2xl p-5 shadow-lg text-white transition-colors duration-300 ${isNetNegative ? 'bg-red-600 shadow-red-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}>
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isNetNegative ? 'text-red-200' : 'text-emerald-200'}`}>Lucro Líquido Previsto</span>
                    <TrendingDownIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-black tracking-tighter">R$ {currentPeriodMetrics.net.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
      </div>

      <div className="space-y-4">
        {/* Card 1: Jhonatta Guimarães */}
        <div className="relative w-full bg-gray-900 rounded-2xl p-5 shadow-lg text-white border border-gray-800">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] block">Faturamento Anual</span>
                       <span className="text-sky-400 text-xs font-bold block mt-0.5">(Jhonatta Guimarães)</span>
                   </div>
                   <button onClick={() => { setTempGoalJhonatta(formatCurrencyInput(goalJhonatta)); setIsEditingGoalJhonatta(!isEditingGoalJhonatta); }} className="p-1.5 bg-white/10 rounded-full transition-colors hover:bg-white/20" title="Editar Meta"><PencilIcon className="w-3 h-3 text-white" /></button>
               </div>
               {isEditingGoalJhonatta ? (
                  <div className="flex gap-2 items-center mb-2">
                      <span className="text-lg font-black">R$</span>
                      <input ref={goalInputRefJhonatta} type="text" inputMode="numeric" value={tempGoalJhonatta} onChange={(e) => setTempGoalJhonatta(formatCurrencyInput(e.target.value))} onBlur={handleSaveGoalJhonatta} onKeyDown={(e) => e.key === 'Enter' && handleSaveGoalJhonatta()} className="w-full bg-transparent border-b-2 border-white/30 text-2xl font-black text-white outline-none px-1" />
                      <button onClick={handleSaveGoalJhonatta} className="bg-white text-gray-900 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">OK</button>
                  </div>
               ) : (
                  <div className="flex flex-col mb-3">
                      <p className="text-3xl font-black text-white tracking-tighter">R$ {totalAnnualPaidJhonatta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Meta: R$ {goalJhonatta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
               )}
               <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{progressJhonatta.toFixed(1)}% atingido</span>
                  </div>
                  <div className="overflow-hidden h-2 mb-1 flex rounded-full bg-white/10">
                      <div style={{ width: `${progressJhonatta}%` }} className={`shadow-none flex flex-col text-center transition-all duration-1000 ${progressJhonatta > 90 ? 'bg-red-500' : 'bg-sky-500'}`}></div>
                  </div>
               </div>
        </div>

        {/* Card 2: Daniele Dias */}
        <div className="relative w-full bg-gray-900 rounded-2xl p-5 shadow-lg text-white border border-gray-800">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] block">Faturamento Anual</span>
                       <span className="text-sky-400 text-xs font-bold block mt-0.5">(Daniele Dias)</span>
                   </div>
                   <button onClick={() => { setTempGoalDaniele(formatCurrencyInput(goalDaniele)); setIsEditingGoalDaniele(!isEditingGoalDaniele); }} className="p-1.5 bg-white/10 rounded-full transition-colors hover:bg-white/20" title="Editar Meta"><PencilIcon className="w-3 h-3 text-white" /></button>
               </div>
               {isEditingGoalDaniele ? (
                  <div className="flex gap-2 items-center mb-2">
                      <span className="text-lg font-black">R$</span>
                      <input ref={goalInputRefDaniele} type="text" inputMode="numeric" value={tempGoalDaniele} onChange={(e) => setTempGoalDaniele(formatCurrencyInput(e.target.value))} onBlur={handleSaveGoalDaniele} onKeyDown={(e) => e.key === 'Enter' && handleSaveGoalDaniele()} className="w-full bg-transparent border-b-2 border-white/30 text-2xl font-black text-white outline-none px-1" />
                      <button onClick={handleSaveGoalDaniele} className="bg-white text-gray-900 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">OK</button>
                  </div>
               ) : (
                  <div className="flex flex-col mb-3">
                      <p className="text-3xl font-black text-white tracking-tighter">R$ {totalAnnualPaidDaniele.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Meta: R$ {goalDaniele.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
               )}
               <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{progressDaniele.toFixed(1)}% atingido</span>
                  </div>
                  <div className="overflow-hidden h-2 mb-1 flex rounded-full bg-white/10">
                      <div style={{ width: `${progressDaniele}%` }} className={`shadow-none flex flex-col text-center transition-all duration-1000 ${progressDaniele > 90 ? 'bg-red-500' : 'bg-sky-500'}`}></div>
                  </div>
               </div>
        </div>
      </div>
    </div>
  );
};
