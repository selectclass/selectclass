
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarEvent, Expense } from '../types';
import { PencilIcon, DollarSignIcon, TrendingDownIcon, BarChartIcon } from './Icons';

interface FinancialScreenProps {
  events: CalendarEvent[];
  annualGoal: number;
  onUpdateGoal: (goal: number) => void;
  expenses: Expense[];
}

export const FinancialScreen: React.FC<FinancialScreenProps> = ({ events, annualGoal, onUpdateGoal, expenses }) => {
  const now = new Date();
  
  // --- State Initialization ---
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [touchedMonth, setTouchedMonth] = useState<number | null>(null);

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
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const monthShortNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // --- 1. Metrics Calculation for Top Cards (Respects Day/Month/Year filters) ---
  const currentPeriodMetrics = useMemo(() => {
    const filtered = events.filter(e => {
        if (!e.date) return false; 
        const eDate = new Date(e.date);
        const matchYear = eDate.getFullYear() === selectedYear;
        const matchMonth = eDate.getMonth() === selectedMonth;
        const matchDay = selectedDay === 'all' || eDate.getDate() === Number(selectedDay);
        return matchYear && matchMonth && matchDay;
    });

    // Gross Revenue
    const gross = filtered.reduce((acc, curr) => {
        const paymentsSum = curr.payments?.reduce((pAcc, p) => pAcc + p.amount, 0) || 0;
        if (curr.paymentStatus === 'paid' && paymentsSum === 0) return acc + (curr.value || 0);
        return acc + paymentsSum;
    }, 0);

    // Expenses
    const periodExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        const matchYear = d.getFullYear() === selectedYear;
        const matchMonth = d.getMonth() === selectedMonth;
        const matchDay = selectedDay === 'all' || d.getDate() === Number(selectedDay);
        return matchYear && matchMonth && matchDay;
    }).reduce((acc, curr) => acc + curr.amount, 0);

    // Materials Cost
    const materialsCost = filtered.reduce((acc, event) => {
        const matCost = event.materials?.reduce((mAcc, m) => m.checked ? mAcc + (m.cost || 0) : mAcc, 0) || 0;
        return acc + matCost;
    }, 0);

    return {
        gross,
        net: gross - periodExpenses - materialsCost,
        expenses: periodExpenses + materialsCost
    };
  }, [events, expenses, selectedYear, selectedMonth, selectedDay]);


  // --- 2. Chart Data Calculation (Whole Year) ---
  const annualChartData = useMemo(() => {
      const data = Array(12).fill(0).map(() => ({ gross: 0, net: 0 }));

      // 1. Process Events (Revenue & Material Costs)
      events.forEach(e => {
          if (!e.date) return;
          const d = new Date(e.date);
          if (d.getFullYear() !== selectedYear) return;
          
          const mIndex = d.getMonth();
          
          // Revenue
          const paymentsSum = e.payments?.reduce((pAcc, p) => pAcc + p.amount, 0) || 0;
          const val = (e.paymentStatus === 'paid' && paymentsSum === 0) ? (e.value || 0) : paymentsSum;
          data[mIndex].gross += val;

          // Material Cost Deduction for Net
          const matCost = e.materials?.reduce((mAcc, m) => m.checked ? mAcc + (m.cost || 0) : mAcc, 0) || 0;
          data[mIndex].net -= matCost;
      });

      // 2. Process Expenses
      expenses.forEach(e => {
          const d = new Date(e.date);
          if (d.getFullYear() !== selectedYear) return;
          const mIndex = d.getMonth();
          data[mIndex].net -= e.amount;
      });

      // 3. Finalize Net (Gross - Costs)
      for(let i=0; i<12; i++) {
          data[i].net += data[i].gross;
      }

      return data;
  }, [events, expenses, selectedYear]);

  // Chart Scaling
  const maxChartValue = Math.max(...annualChartData.map(d => d.gross), 100); // Avoid division by zero


  // --- 3. Annual Goal Progress ---
  const totalAnnualPaid = useMemo(() => {
    return annualChartData.reduce((acc, curr) => acc + curr.gross, 0);
  }, [annualChartData]);

  const progressPercentage = annualGoal > 0 ? Math.min((totalAnnualPaid / annualGoal) * 100, 100) : 0;

  const handleSaveGoal = () => {
    const val = parseFloat(tempGoal);
    if (!isNaN(val) && val > 0) {
      onUpdateGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="pb-32 px-4 pt-4">
      
      <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Financeiro</h2>
      </div>

      {/* --- FILTERS ROW --- */}
      <div className="flex gap-3 mb-6">
         <div className="w-24 relative">
            <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all"
            >
                <option value="all">Dia</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
         </div>

         <div className="flex-1 relative">
            <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all"
            >
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
         </div>
         
         <div className="w-24 relative">
            <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all text-center"
            >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
         </div>
      </div>

      {/* --- ANNUAL CHART SECTION (MOVED TO TOP) --- */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary dark:text-blue-300">
                    <BarChartIcon className="w-5 h-5" />
               </div>
               <div>
                   <h3 className="font-bold text-gray-800 dark:text-white text-base">Desempenho Anual</h3>
                   <p className="text-xs text-gray-400">Visão geral de {selectedYear}</p>
               </div>
          </div>

          <div className="relative h-56 w-full">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                  {[100, 75, 50, 25, 0].map((pct) => (
                      <div key={pct} className="w-full border-b border-gray-100 dark:border-gray-800 h-px border-dashed opacity-50"></div>
                  ))}
              </div>

              {/* Bars (Candle Style) */}
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
                              {/* Tooltip Value on Hover/Touch (RESTORED TO TOP) */}
                              {(isTouched || isSelected) && data.gross > 0 && (
                                  <div className="absolute -top-12 z-20 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in pointer-events-none transform -translate-x-1/2 left-1/2">
                                      R$ {data.gross.toLocaleString('pt-BR', { notation: 'compact' })}
                                      {/* Little arrow */}
                                      <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                  </div>
                              )}

                              {/* Candle Track (Background Bar) */}
                              <div className="w-1.5 h-full bg-gray-100 dark:bg-white/5 rounded-full absolute bottom-8 z-0"></div>

                              {/* Active Candle Bar */}
                              <div 
                                className={`w-3 sm:w-4 rounded-full transition-all duration-500 ease-out relative z-10 shadow-sm
                                    ${isSelected 
                                        ? 'bg-gradient-to-t from-primary to-blue-400 shadow-blue-500/30' 
                                        : 'bg-gray-300 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-gray-600'
                                    }
                                `}
                                style={{ height: `${Math.max(heightPct, 6)}%` }} // Minimum height for visibility
                              >
                              </div>
                              
                              {/* Label */}
                              <span className={`text-[9px] sm:text-[10px] mt-3 font-medium transition-colors ${isSelected ? 'text-primary dark:text-blue-300 font-bold' : 'text-gray-400'}`}>
                                  {monthShortNames[index]}
                              </span>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* --- KPIS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Card 1: Gross Revenue (Classic Blue) */}
          <div className="relative w-full bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 shadow-lg shadow-primary/20 text-white overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">
                         Faturamento Mensal
                    </span>
                    <div className="bg-white/10 p-1.5 rounded-lg">
                        <DollarSignIcon className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight">
                        R$ {currentPeriodMetrics.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
              </div>
          </div>

          {/* Card 2: Net Revenue (Profit Green) */}
          <div className="relative w-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 shadow-lg shadow-emerald-500/20 text-white overflow-hidden">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">
                         Faturamento Líquido
                    </span>
                    <div className="bg-white/10 p-1.5 rounded-lg">
                        <TrendingDownIcon className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold tracking-tight">
                        R$ {currentPeriodMetrics.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                {currentPeriodMetrics.expenses > 0 && (
                     <p className="text-[10px] text-emerald-100 mt-1 opacity-80">
                         - R$ {currentPeriodMetrics.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em despesas
                     </p>
                )}
              </div>
          </div>
      </div>

      {/* --- ANNUAL GOAL CARD --- */}
      <div className="relative w-full bg-gray-900 dark:bg-black rounded-2xl p-5 shadow-lg text-white overflow-hidden border border-gray-800">
             {/* Decorative */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-center mb-4">
                     <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        Limite Anual (MEI)
                     </span>
                     <button 
                        onClick={() => {
                            setTempGoal(annualGoal.toString());
                            setIsEditingGoal(!isEditingGoal);
                        }}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                     >
                        <PencilIcon className="w-3 h-3 text-white" />
                     </button>
                 </div>

                 {isEditingGoal ? (
                    <div className="flex gap-2 items-center mb-2">
                        <span className="text-lg font-bold">R$</span>
                        <input 
                            ref={goalInputRef}
                            type="number" 
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            onBlur={handleSaveGoal}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                            className="w-full bg-transparent border-b-2 border-white/30 text-2xl font-bold text-white focus:outline-none focus:border-white px-1"
                        />
                        <button onClick={handleSaveGoal} className="bg-white text-gray-900 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                            OK
                        </button>
                    </div>
                 ) : (
                    <div className="flex flex-col mb-3">
                        <span className="text-3xl font-bold text-white">
                            R$ {totalAnnualPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                        <span className="text-gray-400 text-xs mt-1">
                           Meta: R$ {annualGoal.toLocaleString('pt-BR')}
                        </span>
                    </div>
                 )}

                 {/* Progress Bar */}
                 <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div className="text-right w-full">
                        <span className="text-xs font-bold inline-block text-white">
                            {progressPercentage.toFixed(1)}% atingido
                        </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-white/10">
                        <div 
                            style={{ width: `${progressPercentage}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center transition-all duration-1000
                                ${progressPercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'}
                            `}
                        ></div>
                    </div>
                 </div>

             </div>
      </div>

    </div>
  );
};
