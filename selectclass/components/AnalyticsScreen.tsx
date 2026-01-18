
import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { BarChartIcon, MapPinIcon } from './Icons';

interface AnalyticsScreenProps {
  events: CalendarEvent[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ events }) => {
  const now = new Date();
  
  // --- State Initialization ---
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedCity, setSelectedCity] = useState('all'); // New City State
  const [touchedMonth, setTouchedMonth] = useState<number | null>(null);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const monthShortNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const years = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => 2026 + i);

  // --- Extract Unique Cities for the Dropdown (Based on Selected Year) ---
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    events.forEach(e => {
        if (!e.date) return;
        const d = new Date(e.date);
        // Only show cities present in the selected year to keep list relevant
        if (e.city && d.getFullYear() === selectedYear) {
            cities.add(e.city);
        }
    });
    return Array.from(cities).sort();
  }, [events, selectedYear]);

  // --- 1. Filter Logic for Rankings (Bottom Lists) ---
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        
        const matchesMonth = d.getMonth() === selectedMonth;
        const matchesYear = d.getFullYear() === selectedYear;
        const matchesCity = selectedCity === 'all' || e.city === selectedCity;

        return matchesMonth && matchesYear && matchesCity;
    });
  }, [events, selectedMonth, selectedYear, selectedCity]);

  // --- 2. Chart Data Calculation (Whole Year - Quantity) ---
  const annualChartData = useMemo(() => {
      const data = Array(12).fill(0);

      events.forEach(e => {
          if (!e.date) return;
          const d = new Date(e.date);
          
          if (d.getFullYear() !== selectedYear) return;
          if (selectedCity !== 'all' && e.city !== selectedCity) return; // Filter Chart by City
          
          const mIndex = d.getMonth();
          data[mIndex] += 1; // Count quantity
      });

      return data;
  }, [events, selectedYear, selectedCity]);

  const maxChartValue = Math.max(...annualChartData, 1); // Avoid division by zero

  // --- 3. COURSE RANKING (Quantity) ---
  const courseStats = useMemo(() => {
      const stats: Record<string, number> = {};
      
      filteredEvents.forEach(e => {
          const title = e.title || 'Outros';
          stats[title] = (stats[title] || 0) + 1;
      });

      // Sort by Count Descending
      return Object.entries(stats)
        .sort((a, b) => b[1] - a[1]);
  }, [filteredEvents]);

  // --- 4. LOCATION RANKING ---
  const locationStats = useMemo(() => {
      const stats: Record<string, number> = {};
      filteredEvents.forEach(e => {
          if (e.city && e.state) {
              const loc = `${e.city} - ${e.state}`;
              stats[loc] = (stats[loc] || 0) + 1;
          }
      });
      return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 cities
  }, [filteredEvents]);

  const getMedal = (index: number) => {
      if (index === 0) return '🏆';
      if (index === 1) return '🥈';
      if (index === 2) return '🥉';
      return `#${index + 1}`;
  };

  return (
    <div className="p-4 pb-32">
        <div className="mb-6 px-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Ranking de Cursos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analise o desempenho dos seus cursos e alcance.</p>
        </div>

        {/* --- FILTERS ROW --- */}
        <div className="flex gap-2 sm:gap-3 mb-6">
             {/* City Selector (Moved to Start) */}
             <div className="flex-1 relative">
                <select 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all"
                >
                    <option value="all">Todas Cidades</option>
                    {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>

             {/* Month Selector (Moved to Middle - Left of Year) */}
             <div className="flex-1 relative">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 sm:px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all"
                >
                    {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
             
             {/* Year Selector (Right) */}
             <div className="w-24 relative">
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-2 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-all text-center"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                 <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
        </div>

        {/* --- ANNUAL CHART SECTION --- */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary dark:text-blue-300">
                    <BarChartIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base">Volume de Cursos</h3>
                    <p className="text-xs text-gray-400">
                        {selectedCity === 'all' ? `Total em ${selectedYear}` : `${selectedCity} em ${selectedYear}`}
                    </p>
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
                    {annualChartData.map((count, index) => {
                        const heightPct = maxChartValue > 0 ? (count / maxChartValue) * 100 : 0;
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
                                {/* Tooltip Value on Hover/Touch */}
                                {(isTouched || isSelected) && count > 0 && (
                                    <div className="absolute -top-12 z-20 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in pointer-events-none transform -translate-x-1/2 left-1/2">
                                        {count} {count === 1 ? 'curso' : 'cursos'}
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

        {/* --- MAIN CONTENT GRID --- */}
        <div className="space-y-8">
            
            {/* COURSE RANKING SECTION */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <BarChartIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Cursos Mais Vendidos</h3>
                        <p className="text-xs text-gray-400">Ranking de {monthNames[selectedMonth]}</p>
                    </div>
                </div>

                {courseStats.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 dark:bg-white/5 rounded-xl border-dashed border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-400">Nenhum agendamento neste filtro.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {courseStats.map(([name, count], idx) => {
                             const maxVal = courseStats[0][1];
                             const percent = (count / maxVal) * 100;
                             
                             return (
                                <div key={name} className="relative group">
                                    <div className="flex items-center justify-between mb-2 z-10 relative">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg font-bold w-8 text-center ${idx < 3 ? 'scale-110' : 'text-gray-400 text-sm'}`}>
                                                {getMedal(idx)}
                                            </span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">
                                                {name}
                                            </span>
                                        </div>
                                        <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                                            {count} {count === 1 ? 'venda' : 'vendas'}
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar Background */}
                                    <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        {/* Actual Bar */}
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out 
                                                ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                                                  idx === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' : 
                                                  idx === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-500' : 
                                                  'bg-primary'
                                                }`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                )}
            </div>

            {/* LOCATION RANKING SECTION */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Onde estão minhas alunas?</h3>
                        <p className="text-xs text-gray-400">Ranking por Cidade em {monthNames[selectedMonth]}</p>
                    </div>
                </div>

                {locationStats.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 dark:bg-white/5 rounded-xl border-dashed border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-400">Sem dados de localização neste filtro.</p>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-2">
                        {locationStats.map(([loc, count], idx) => (
                            <div key={loc} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700/50 last:border-0 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                          idx === 1 ? 'bg-gray-200 text-gray-700' : 
                                          idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}
                                    `}>
                                        {idx + 1}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{loc}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-800 dark:text-white text-sm">{count}</span>
                                    <span className="text-[10px] text-gray-400 uppercase">Alunas</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};
