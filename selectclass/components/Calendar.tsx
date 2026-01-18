
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { CalendarEvent } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isDateBlocked?: (date: Date) => boolean;
  events?: CalendarEvent[];
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, isDateBlocked, events = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
       
       // Check if event is on this exact day
       const isStartDay = eDate.getDate() === dayDate.getDate() && 
                          eDate.getMonth() === dayDate.getMonth() && 
                          eDate.getFullYear() === dayDate.getFullYear();
       
       if (isStartDay) return true;

       // Check if it is the second day of a 2-day event
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

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const hasEvent = hasEventOnDay(date);
      
      // Determine if blocked
      const blocked = isDateBlocked ? isDateBlocked(date) : false;

      days.push(
        <div key={i} className="flex flex-col items-center">
          <button
            disabled={blocked}
            onClick={() => onSelectDate(date)}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-200
              ${blocked 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : isSelected 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 font-semibold' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 font-medium'
              }
              ${!blocked && isToday && !isSelected ? 'border border-primary text-primary dark:text-blue-300' : ''}
            `}
          >
            {i}
          </button>
          {/* Event Indicator Dot */}
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
      {/* Header */}
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

      {/* Week Days */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {renderDays()}
      </div>
    </div>
  );
};
