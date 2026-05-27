import { CalendarEvent, LectureModel } from '../types';
import { parseCurrency } from './currency';

export const isEventOverdue = (evt: CalendarEvent, lectureModels: LectureModel[] = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPal = (evt.palestraType || evt.title === 'Palestra' || evt.title === 'Workshop' || lectureModels.some(m => m.name === evt.title));
  if (isPal) return false;

  const baseValue = parseCurrency(evt.value) || 0;
  const totalPaid = (evt.payments || []).reduce((acc, p) => acc + (parseCurrency(p.amount) || 0), 0);
  const isPaid = (baseValue - totalPaid) < 0.01 && baseValue > 0;
  if (isPaid) return false;

  if (!evt.paymentFrequency || !evt.createdAt || !evt.date) return false;

  const startDate = new Date(evt.createdAt);
  const courseDate = new Date(evt.date);
  courseDate.setHours(0, 0, 0, 0);
  const deadlineDays = evt.paymentDeadlineDays || 0;
  const interval = evt.paymentFrequency === 'weekly' ? 7 : evt.paymentFrequency === 'monthly' ? 30 : 15;
  
  const maxDate = new Date(courseDate);
  maxDate.setDate(courseDate.getDate() - deadlineDays);
  
  let i = 1;
  while (true) {
    let d = new Date(startDate);
    d.setDate(startDate.getDate() + (interval * i));
    
    let isLast = false;
    if (d.getTime() >= maxDate.getTime()) {
      d = new Date(maxDate);
      isLast = true;
    }
    
    let finalD = d;
    let hasMoreCustomDates = false;
    if (evt.installmentDates) {
      const keys = Object.keys(evt.installmentDates).map(Number);
      if (keys.length > 0) {
         hasMoreCustomDates = i < Math.max(...keys);
      }
      if (evt.installmentDates[i]) {
        let dStr = evt.installmentDates[i];
        if (dStr.indexOf('T') === -1) dStr += 'T12:00:00';
        finalD = new Date(dStr);
      }
    }
    
    if (hasMoreCustomDates) {
       isLast = false;
    }
    
    const installmentDate = new Date(finalD);
    installmentDate.setHours(0, 0, 0, 0);
    
    const isPaidInstallment = evt.payments?.some(p => p.installment === i);
    if (!isPaidInstallment && installmentDate.getTime() <= today.getTime()) {
      return true;
    }

    if (isLast) break;
    i++;
    if (i > 50) break;
  }

  return false;
};
