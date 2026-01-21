import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { CalendarEvent } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (date: Date) => void; // Novo callback para sincronização
  isDateBlocked?: (date: Date) => boolean;
  events?: CalendarEvent[];
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, onMonthChange, isDateBlocked, events = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  // Sincroniza o estado interno se a data selecionada mudar drasticamente por fora
  useEffect(() => {
    if (selectedDate.getMonth() !== currentMonth.getMonth() || selectedDate.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newDate);
    if (onMonthChange) onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newDate);
    if (onMonthChange) onMonthChange(newDate);
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const hasEventOnDay = (dayDate: Date) => {
    return events.some(e => {
       if (!e.date) return false;
       const eDate = new Date(e.date);
       
       const isStartDay = eDate.getDate() === dayDate.getDate() && 
                          eDate.getMonth() === dayDate.getMonth() && 
                          eDate.getFullYear() === dayDate.getFullYear();
       
       if (isStartDay) return true;

       if (e.duration && (e.duration.toLowerCase().includes('2 dia') || e.duration.toLowerCase().includes('2 day'))) {
           const secondDay = new Date(eDate);
           secondDay.setDate(eDate.getDate() + 1);
           
           if (secondDay.getDate() === dayDate.getDate() && 
               secondDay.getMonth() === dayDate.getMonth() && 
               secondDay.getFullYear() === dayDate.getFullYear()) {
               return true;
           }
       }

       return false;
    });
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    const days = [];
    
    // Referência de "Hoje" para o bloqueio inteligente
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const hasEvent = hasEventOnDay(date);
      
      // Regra de Bloqueio Inteligente:
      // Bloqueia se (forçado via prop) OU (for data passada E não tiver eventos)
      const isPast = date < today;
      const blocked = (isDateBlocked ? isDateBlocked(date) : false) || (isPast && !hasEvent);

      days.push(
        <div key={i} className="flex flex-col items-center">
          <button
            disabled={blocked}
            onClick={() => onSelectDate(date)}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-200
              ${blocked 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50' 
                : isSelected 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 font-semibold' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 font-medium'
              }
              ${!blocked && isToday && !isSelected ? 'border border-primary text-primary dark:text-blue-300' : ''}
            `}
          >
            {i}
          </button>
          {!isSelected && hasEvent && (
            <div className="w-1 h-1 bg-primary/80 dark:bg-blue-400 rounded-full mt-0.5"></div>
          )}
          {isSelected && hasEvent && (
            <div className="w-1 h-1 bg-white/70 rounded-full mt-0.5"></div>
          )}
          {!hasEvent && <div className="h-1.5"></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-surface-dark shadow-sm p-3 rounded-b-[1.5rem] mb-2">
      <div className="flex items-center justify-between mb-3 px-2 pt-1">
        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-gray-800 dark:text-white capitalize tracking-tight">
          {monthNames[currentMonth.getMonth()]} <span className="font-normal text-gray-500 dark:text-gray-400 ml-1">{currentMonth.getFullYear()}</span>
        </h3>
        <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {renderDays()}
      </div>
    </div>
  );
};