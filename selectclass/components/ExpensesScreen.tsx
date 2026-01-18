
import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { TrendingDownIcon, PlusIcon, TrashIcon, CalendarIcon } from './Icons';

interface ExpensesScreenProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  
  // Filters
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const years = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => 2026 + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const d = new Date(e.date);
        const matchYear = d.getFullYear() === selectedYear;
        const matchMonth = d.getMonth() === selectedMonth;
        const matchDay = selectedDay === 'all' || d.getDate() === Number(selectedDay);
        
        return matchYear && matchMonth && matchDay;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth, selectedYear, selectedDay]);

  const totalMonth = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amountStr) return;

    const amount = parseFloat(amountStr.replace(',', '.'));
    const [y, m, d] = dateStr.split('-').map(Number);

    onAddExpense({
        id: Date.now().toString(),
        title,
        amount,
        date: new Date(y, m - 1, d)
    });

    setTitle('');
    setAmountStr('');
  };

  return (
    <div className="p-4 pb-32">
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Despesas & Custos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie materiais e custos operacionais.</p>
        </div>

        {/* --- ADD EXPENSE FORM --- */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> Nova Despesa
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Apostilas, Camisas, Coffee Break"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="w-40">
                        <input 
                            type="date" 
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>
                <button 
                    type="submit"
                    disabled={!title || !amountStr}
                    className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                    Adicionar Custo
                </button>
            </form>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex gap-3 mb-6">
             {/* Day Selector */}
             <div className="w-24 relative">
                <select 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm"
                >
                    <option value="all">Dia</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>

             {/* Month Selector */}
             <div className="flex-1 relative">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm"
                >
                    {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>

             {/* Year Selector */}
             <div className="w-24 relative">
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
        </div>

        {/* --- TOTAL CARD --- */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl mb-6 flex justify-between items-center">
            <div>
                <p className="text-xs font-bold text-red-400 uppercase">
                    Total {selectedDay !== 'all' ? `(${selectedDay}/${monthNames[selectedMonth].substring(0,3)})` : `(${monthNames[selectedMonth]})`}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">R$ {totalMonth.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                <TrendingDownIcon className="w-5 h-5" />
            </div>
        </div>

        {/* --- LIST --- */}
        <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                    <p className="text-gray-500">Nenhum custo lançado.</p>
                </div>
            ) : (
                filteredExpenses.map(expense => (
                    <div key={expense.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500">
                                <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{expense.title}</h4>
                                <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-red-500">R$ {expense.amount.toFixed(2)}</span>
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
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
