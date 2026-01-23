import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { CalendarEvent, CourseType, LectureModel } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  isDateBlocked?: (date: Date) => boolean;
  events?: CalendarEvent[];
  courseTypes?: CourseType[];
  lectureModels?: LectureModel[];
}

export const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate, 
  onSelectDate, 
  onMonthChange, 
  isDateBlocked, 
  events = [],
  courseTypes = [],
  lectureModels = []
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    const newMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    if (newMonth.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(newMonth);
      if (onMonthChange) onMonthChange(newMonth);
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

  const checkIfPalestra = (evt: CalendarEvent) => {
    const courseConfig = courseTypes.find(c => c.name === evt.title);
    return courseConfig?.model === 'Palestra' || 
           evt.title === 'Palestra' || 
           evt.title === 'Workshop' || 
           lectureModels.some(m => m.name === evt.title);
  };

  const getDayEventType = (dayDate: Date): 'palestra' | 'curso' | null => {
    let type: 'palestra' | 'curso' | null = null;
    
    events.forEach(e => {
       if (!e.date) return;
       const eDate = new Date(e.date);
       const isStartDay = eDate.getDate() === dayDate.getDate() && 
                          eDate.getMonth() === dayDate.getMonth() && 
                          eDate.getFullYear() === dayDate.getFullYear();
       
       let isWithinRange = isStartDay;
       if (!isStartDay && e.duration && (e.duration.toLowerCase().includes('2 dia') || e.duration.toLowerCase().includes('2 day'))) {
           const secondDay = new Date(eDate);
           secondDay.setDate(eDate.getDate() + 1);
           if (secondDay.getDate() === dayDate.getDate() && 
               secondDay.getMonth() === dayDate.getMonth() && 
               secondDay.getFullYear() === dayDate.getFullYear()) {
               isWithinRange = true;
           }
       }

       if (isWithinRange) {
         const isPal = checkIfPalestra(e);
         if (isPal) type = 'palestra';
         else if (!type) type = 'curso';
       }
    });

    return type;
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const eventType = getDayEventType(date);
      const isPast = date < today;
      const blocked = (isDateBlocked ? isDateBlocked(date) : false) || (isPast && !eventType);

      let dayStyle = '';
      if (blocked) {
        dayStyle = 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50';
      } else if (eventType === 'palestra') {
        dayStyle = `bg-sky-500 text-white font-black shadow-md ${isSelected ? 'ring-4 ring-sky-200 dark:ring-sky-900/50 scale-110' : ''}`;
      } else if (eventType === 'curso') {
        dayStyle = `bg-primary text-white font-black shadow-md ${isSelected ? 'ring-4 ring-primary/30 dark:ring-blue-900/50 scale-110' : ''}`;
      } else if (isSelected) {
        dayStyle = 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 font-semibold';
      } else {
        dayStyle = 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 font-medium';
      }

      days.push(
        <div key={i} className="flex flex-col items-center">
          <button
            disabled={blocked}
            onClick={() => onSelectDate(date)}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${dayStyle}
              ${!blocked && isToday && !isSelected && !eventType ? 'border border-primary text-primary dark:text-blue-300' : ''}
            `}
          >
            {i}
          </button>
          <div className="h-1.5"></div>
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
          <div key={idx} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">{renderDays()}</div>
    </div>
  );
};
