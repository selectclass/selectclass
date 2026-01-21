import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarEvent, Expense, CourseType } from '../types';
import { PencilIcon, DollarSignIcon, TrendingDownIcon, BarChartIcon } from './Icons';

interface FinancialScreenProps {
  events: CalendarEvent[];
  annualGoal: number;
  onUpdateGoal: (goal: number) => void;
  expenses: Expense[];
  courseTypes: CourseType[];
}

const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanValue = String(value).replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const FinancialScreen: React.FC<FinancialScreenProps> = ({ events, annualGoal, onUpdateGoal, expenses, courseTypes }) => {
  const now = new Date();
  
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [touchedMonth, setTouchedMonth] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'cursos' | 'palestras'>('cursos');

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(annualGoal.toString());
  const goalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingGoal && goalInputRef.current) {
        goalInputRef.current.focus();
    }
  }, [isEditingGoal]);

  const years = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => 2026 + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthShortNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const currentPeriodMetrics = useMemo(() => {
    const filtered = events.filter(e => {
        if (!e.date) return false; 
        const eDate = new Date(e.date);
        const matchYear = eDate.getFullYear() === selectedYear;
        const matchMonth = eDate.getMonth() === selectedMonth;
        const matchDay = selectedDay === 'all' || eDate.getDate() === Number(selectedDay);
        const config = courseTypes.find(c => c.name === e.title);
        const matchType = filterType === 'palestras' ? config?.model === 'Palestra' : config?.model !== 'Palestra';
        return matchYear && matchMonth && matchDay && matchType;
    });

    const gross = filtered.reduce((acc, curr) => {
        const paymentsSum = curr.payments?.reduce((pAcc, p) => pAcc + parseCurrency(p.amount), 0) || 0;
        if (curr.paymentStatus === 'paid' && paymentsSum === 0) return acc + parseCurrency(curr.value);
        return acc + paymentsSum;
    }, 0);

    const materialsCost = filtered.reduce((acc, event) => {
        const matCost = (event.materials || []).reduce((mAcc, m) => m.checked ? mAcc + parseCurrency(m.cost) : mAcc, 0);
        return acc + matCost;
    }, 0);

    return { gross, net: gross - materialsCost, expenses: materialsCost };
  }, [events, expenses, selectedYear, selectedMonth, selectedDay, filterType, courseTypes]);

  const annualChartData = useMemo(() => {
      const data = Array(12).fill(0).map(() => ({ gross: 0, net: 0 }));
      events.forEach(e => {
          if (!e.date) return;
          const d = new Date(e.date);
          if (d.getFullYear() !== selectedYear) return;
          const config = courseTypes.find(c => c.name === e.title);
          const matchType = filterType === 'palestras' ? config?.model === 'Palestra' : config?.model !== 'Palestra';
          if (!matchType) return;
          const mIndex = d.getMonth();
          const paymentsSum = e.payments?.reduce((pAcc, p) => pAcc + parseCurrency(p.amount), 0) || 0;
          const val = (e.paymentStatus === 'paid' && paymentsSum === 0) ? parseCurrency(e.value) : paymentsSum;
          data[mIndex].gross += val;
          const matCost = (e.materials || []).reduce((mAcc, m) => m.checked ? mAcc + parseCurrency(m.cost) : mAcc, 0);
          data[mIndex].net -= matCost;
      });
      for(let i=0; i<12; i++) data[i].net += data[i].gross;
      return data;
  }, [events, expenses, selectedYear, filterType, courseTypes]);

  const maxChartValue = Math.max(...annualChartData.map(d => d.gross), 100);
  const totalAnnualPaid = useMemo(() => annualChartData.reduce((acc, curr) => acc + curr.gross, 0), [annualChartData]);
  const progressPercentage = annualGoal > 0 ? Math.min((totalAnnualPaid / annualGoal) * 100, 100) : 0;

  const handleSaveGoal = () => {
    const val = parseFloat(tempGoal.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      onUpdateGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="pb-32 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-tighter">Financeiro</h2>
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner">
                <button onClick={() => setFilterType('cursos')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'cursos' ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}>Cursos</button>
                <button onClick={() => setFilterType('palestras')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'palestras' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-400'}`}>Palestras</button>
          </div>
      </div>

      <div className="flex gap-3 mb-6">
         <div className="w-24 relative flex flex-col">
            <label className="text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Dia</label>
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all">
                <option value="all">Todos</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>
         <div className="flex-1 relative flex flex-col">
            <label className="text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Mês</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all">
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
         </div>
         <div className="w-24 relative flex flex-col">
            <label className="text-[9px] font-black text-gray-400 uppercase mb-1 ml-1 text-center">Ano</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all text-center">
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
                   <h3 className="font-black text-gray-800 dark:text-white text-base uppercase tracking-tight">{filterType === 'palestras' ? 'Cachês de Palestras' : 'Rendimento Cursos'}</h3>
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
                      return (
                          <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end" onClick={() => setSelectedMonth(index)}>
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
                    <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">{filterType === 'palestras' ? 'Cachê Total' : 'Bruto Recebido'}</span>
                    <DollarSignIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-black tracking-tighter">R$ {currentPeriodMetrics.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="relative w-full bg-emerald-600 rounded-2xl p-5 shadow-lg shadow-emerald-500/20 text-white">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-emerald-200 text-[10px] font-black uppercase tracking-widest">Lucro Líquido</span>
                    <TrendingDownIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-black tracking-tighter">R$ {currentPeriodMetrics.net.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                {currentPeriodMetrics.expenses > 0 && <p className="text-[10px] font-bold text-emerald-100 mt-1 uppercase tracking-widest">✓ R$ {currentPeriodMetrics.expenses.toFixed(2).replace('.', ',')} descontados</p>}
          </div>
      </div>

      <div className="relative w-full bg-gray-900 rounded-2xl p-5 shadow-lg text-white border border-gray-800">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Meta Anual Acumulada</span>
                 <button onClick={() => { setTempGoal(annualGoal.toString()); setIsEditingGoal(!isEditingGoal); }} className="p-1.5 bg-white/10 rounded-full transition-colors"><PencilIcon className="w-3 h-3 text-white" /></button>
             </div>
             {isEditingGoal ? (
                <div className="flex gap-2 items-center mb-2">
                    <span className="text-lg font-black">R$</span>
                    <input ref={goalInputRef} type="text" inputMode="decimal" value={tempGoal} onChange={(e) => setTempGoal(e.target.value)} onBlur={handleSaveGoal} onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()} className="w-full bg-transparent border-b-2 border-white/30 text-2xl font-black text-white outline-none px-1" />
                    <button onClick={handleSaveGoal} className="bg-white text-gray-900 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">OK</button>
                </div>
             ) : (
                <div className="flex flex-col mb-3">
                    <p className="text-3xl font-black text-white tracking-tighter">R$ {totalAnnualPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Definida: R$ {annualGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
             )}
             <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{progressPercentage.toFixed(1)}% atingido</span>
                </div>
                <div className="overflow-hidden h-2 mb-1 flex rounded-full bg-white/10">
                    <div style={{ width: `${progressPercentage}%` }} className={`shadow-none flex flex-col text-center transition-all duration-1000 ${progressPercentage > 90 ? 'bg-red-500' : 'bg-primary'}`}></div>
                </div>
             </div>
      </div>
    </div>
  );
};