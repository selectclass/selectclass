import React, { useState, useMemo } from 'react';
import { Expense, CalendarEvent, CourseType, LectureModel } from '../types';
import { TrendingDownIcon, PlusIcon, TrashIcon, CalendarIcon, BoxIcon, DollarSignIcon } from './Icons';

interface ExpensesScreenProps {
  expenses: Expense[];
  events: CalendarEvent[];
  courseTypes: CourseType[];
  lectureModels: LectureModel[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ expenses, events, courseTypes, lectureModels, onAddExpense, onDeleteExpense }) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  
  // Filters - Inicializando com 'all' para o mês conforme solicitado
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
           event.title === 'Workshop' || 
           lectureModels.some(m => m.name === event.title);
  };

  const filteredExpenses = useMemo(() => {
    // 1. Despesas Manuais Filtradas por Categoria e Data
    const manual = expenses.filter(e => {
        const d = new Date(e.date);
        const matchesDate = d.getFullYear() === selectedYear && 
                           (selectedMonth === 'all' || d.getMonth() === selectedMonth) && 
                           (selectedDay === 'all' || d.getDate() === Number(selectedDay));
        
        const expenseCategory = e.category || 'cursos';
        const matchesCategory = expenseCategory === filterType;

        return matchesDate && matchesCategory;
    }).map(e => ({ ...e, type: 'manual' as const }));

    // 2. Gastos Automáticos do Checklist (Filtrados por Tipo de Evento)
    const automatic: any[] = [];
    events.forEach(evt => {
        if (!evt.date) return;
        const d = new Date(evt.date);
        const isPal = checkIfPalestra(evt);
        const matchType = filterType === 'palestras' ? isPal : !isPal;

        if (matchType && d.getFullYear() === selectedYear && (selectedMonth === 'all' || d.getMonth() === selectedMonth) && (selectedDay === 'all' || d.getDate() === Number(selectedDay))) {
            (evt.materials || []).forEach(m => {
                if (m.checked) {
                    automatic.push({
                        id: m.id,
                        title: `${m.name} (${evt.student || 'Evento'})`,
                        amount: parseCurrency(m.cost),
                        date: d,
                        type: 'automatic' as const
                    });
                }
            });
        }
    });

    return [...manual, ...automatic].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, events, selectedMonth, selectedYear, selectedDay, filterType, courseTypes, lectureModels]);

  const { totalRevenue, totalExpenses, netBalance } = useMemo(() => {
    let rev = 0;
    const exp = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    if (filterType === 'palestras') {
        events.forEach(evt => {
            if (!evt.date) return;
            const d = new Date(evt.date);
            const isPal = checkIfPalestra(evt);
            const matchDate = d.getFullYear() === selectedYear && (selectedMonth === 'all' || d.getMonth() === selectedMonth) && (selectedDay === 'all' || d.getDate() === Number(selectedDay));
            
            if (isPal && matchDate) {
                rev += (evt.value || 0);
            }
        });
    }

    return { totalRevenue: rev, totalExpenses: exp, netBalance: rev - exp };
  }, [filteredExpenses, events, filterType, selectedYear, selectedMonth, selectedDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amountStr) return;

    const amount = parseFloat(amountStr.replace(',', '.'));
    const [y, m, d] = dateStr.split('-').map(Number);

    onAddExpense({
        id: Date.now().toString(),
        title,
        amount,
        date: new Date(y, m - 1, d),
        category: filterType 
    });

    setTitle('');
    setAmountStr('');
  };

  const isPal = filterType === 'palestras';
  const isAllMonths = selectedMonth === 'all';
  
  // Cores: azul para palestras e coral/laranja para cursos
  const bgColor = isPal ? 'bg-sky-50 dark:bg-sky-900/10' : 'bg-orange-50 dark:bg-orange-900/10';
  const borderColor = isPal ? 'border-sky-100 dark:border-sky-900/30' : 'border-orange-100 dark:border-orange-900/30';
  const labelColor = isPal ? 'text-sky-400' : 'text-orange-400';
  const valueColor = isPal ? 'text-sky-600 dark:text-sky-400' : 'text-orange-600 dark:text-orange-400';
  const iconColor = isPal ? 'text-sky-500' : 'text-orange-500';
  const iconBg = isPal ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-orange-100 dark:bg-orange-900/30';
  const focusRing = isPal ? 'focus:ring-sky-500' : 'focus:ring-orange-500';

  return (
    <div className="p-4 pb-32">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Despesas & Custos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestão de materiais e operacionais.</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner">
                <button 
                    onClick={() => setFilterType('cursos')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'cursos' ? 'bg-[#1A4373] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Cursos
                </button>
                <button 
                    onClick={() => setFilterType('palestras')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterType === 'palestras' ? 'bg-[#1A4373] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Palestras
                </button>
            </div>
        </div>

        {/* --- ADD EXPENSE FORM --- */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> {filterType === 'cursos' ? 'Nova Despesa de Curso' : 'Nova Despesa de Palestra'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Aluguel, Apostilas, Camisas..."
                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRing} outline-none`}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                        <input 
                            type="number" 
                            step="0.01"
                            value={amountStr}
                            onChange={(e) => setAmountStr(e.target.value)}
                            placeholder="0,00"
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRing} outline-none font-bold`}
                        />
                    </div>
                    <div className="w-40">
                        <input 
                            type="date" 
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 ${focusRing} outline-none`}
                        />
                    </div>
                </div>
                <button 
                    type="submit"
                    disabled={!title || !amountStr}
                    className={`w-full py-3 text-white rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50 ${isPal ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                >
                    Adicionar Custo
                </button>
            </form>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex gap-3 mb-6">
             <div className="w-24 relative flex flex-col">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Dia</label>
                <div className="relative">
                    <select 
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 ${focusRing} outline-none appearance-none shadow-sm`}
                    >
                        <option value="all">Todos</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
             </div>

             <div className="flex-1 relative flex flex-col">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Mês</label>
                <div className="relative">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 ${focusRing} outline-none appearance-none shadow-sm`}
                    >
                        <option value="all">Todos</option>
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
             </div>

             <div className="w-24 relative flex flex-col">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Ano</label>
                <div className="relative">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 ${focusRing} outline-none appearance-none shadow-sm`}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
             </div>
        </div>

        {/* --- TOTAL CARD --- */}
        <div className={`${bgColor} border ${borderColor} p-4 rounded-xl mb-6 flex justify-between items-center transition-colors duration-300 shadow-sm`}>
            <div>
                <p className={`text-xs font-bold ${labelColor} uppercase`}>
                    {isAllMonths ? 'TOTAL (GERAL)' : (selectedDay !== 'all' ? `Total (${selectedDay}/${monthNames[selectedMonth as number].substring(0,3)})` : `Total (${monthNames[selectedMonth as number]})`)}
                </p>
                <p className={`text-2xl font-bold ${valueColor}`}>
                    R$ {((isPal && isAllMonths) ? netBalance : totalExpenses).toFixed(2).replace('.', ',')}
                </p>
                {isPal && isAllMonths && (
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                        Saldo Líquido (Cachê - Gastos)
                    </p>
                )}
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center ${iconColor}`}>
                {(isPal && isAllMonths) ? <DollarSignIcon className="w-5 h-5" /> : <TrendingDownIcon className="w-5 h-5" />}
            </div>
        </div>

        {/* --- LIST --- */}
        <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                    <p className="text-gray-500">Nenhum custo lançado para {filterType} neste período.</p>
                </div>
            ) : (
                filteredExpenses.map(expense => (
                    <div key={expense.id} className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border flex justify-between items-center transition-all ${expense.type === 'automatic' ? 'border-blue-100 dark:border-blue-900/20' : 'border-gray-100 dark:border-gray-800'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${expense.type === 'automatic' ? 'bg-blue-50 text-primary dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                {expense.type === 'automatic' ? <BoxIcon className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white text-sm">{expense.title}</h4>
                                <p className="text-[10px] text-gray-400 uppercase font-black">{expense.type === 'automatic' ? 'Checklist Automático' : 'Despesa Manual'} • {new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-red-500 text-sm whitespace-nowrap">R$ {parseCurrency(expense.amount).toFixed(2).replace('.', ',')}</span>
                            {expense.type === 'manual' && (
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDeleteExpense(expense.id);
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};