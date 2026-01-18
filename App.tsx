import React, { useState, useEffect, useCallback } from 'react';
import { AppView, CalendarEvent, CourseType, Student, Expense } from './types';
import { Drawer } from './components/Drawer';
import { Calendar } from './components/Calendar';
import { EventList } from './components/EventList';
import { AddEventModal } from './components/AddEventModal';
import { PaymentModal } from './components/PaymentModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { WarningModal } from './components/WarningModal'; 
import { ShareModal } from './components/ShareModal';
import { CourseManager } from './components/CourseManager';
import { FinancialScreen } from './components/FinancialScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StudentsList } from './components/StudentsList';
import { MaterialsScreen } from './components/MaterialsScreen'; 
import { AnalyticsScreen } from './components/AnalyticsScreen'; 
import { HistoryScreen } from './components/HistoryScreen'; 
import { ExpensesScreen } from './components/ExpensesScreen';
import { StudentModal } from './components/StudentModal';
import { LoginScreen } from './components/LoginScreen'; 
import { MenuIcon, PlusIcon, MoonIcon, SunIcon, EyeIcon, EyeOffIcon, CalendarIcon, AlertCircleIcon } from './components/Icons';

// URL Base do Firebase Realtime Database
const FIREBASE_URL = "https://selectclass-dd1d0-default-rtdb.firebaseio.com/";

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
     return localStorage.getItem('is_logged_in') === 'true';
  });

  const [loginError, setLoginError] = useState(false);
  const [credentials, setCredentials] = useState(() => {
     const saved = localStorage.getItem('auth_credentials');
     return saved ? JSON.parse(saved) : { user: 'admin', pass: '1234' };
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#1A4373';
  });

  const [instructorName, setInstructorName] = useState(() => {
    return localStorage.getItem('instructorName') || 'Seu Nome';
  });

  const [annualGoal, setAnnualGoal] = useState(() => {
    const saved = localStorage.getItem('annualGoal');
    return saved ? parseFloat(saved) : 81000;
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Funções de API via Fetch (REST)
  const api = {
    get: async (path: string) => {
        try {
            const response = await fetch(`${FIREBASE_URL}${path}.json`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar ${path}:`, error);
            return null;
        }
    },
    put: async (path: string, data: any) => {
        try {
            await fetch(`${FIREBASE_URL}${path}.json`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error(`Erro ao salvar ${path}:`, error);
        }
    },
    delete: async (path: string) => {
        try {
            await fetch(`${FIREBASE_URL}${path}.json`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error(`Erro ao excluir ${path}:`, error);
        }
    }
  };

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;

    const [eventsData, coursesData, studentsData, expensesData] = await Promise.all([
        api.get('v1/appointments'),
        api.get('v1/courses'),
        api.get('v1/students'),
        api.get('v1/expenses')
    ]);

    // Garantia de arrays vazios caso o retorno seja nulo para evitar quebra de componentes
    if (eventsData) {
        const eventsList = Object.values(eventsData).map((e: any) => ({
          ...e,
          date: e.date ? new Date(e.date) : undefined,
          paymentDueDate: e.paymentDueDate ? new Date(e.paymentDueDate) : undefined,
          payments: e.payments ? e.payments.map((p: any) => ({...p, date: new Date(p.date)})) : []
        }));
        setAllEvents(eventsList);
    } else {
        setAllEvents([]);
    }

    if (coursesData) {
        setCourseTypes(Object.values(coursesData));
    } else {
        setCourseTypes([]);
    }

    if (studentsData) {
        setStudents(Object.values(studentsData).map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })));
    } else {
        setStudents([]);
    }

    if (expensesData) {
        setExpenses(Object.values(expensesData).map((e: any) => ({ ...e, date: new Date(e.date) })));
    } else {
        setExpenses([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
        refreshData();
        const interval = setInterval(refreshData, 10000); // Polling 10s
        return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshData]);

  useEffect(() => {
    localStorage.setItem('auth_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '26 67 115';
    };
    const rgb = hexToRgb(primaryColor);
    const rgbValues = rgb.split(' ').map(Number);
    const darkRgb = rgbValues.map(v => Math.max(0, v - 40)).join(' ');
    document.documentElement.style.setProperty('--color-primary-rgb', rgb);
    document.documentElement.style.setProperty('--color-primary-dark-rgb', darkRgb);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('annualGoal', annualGoal.toString());
  }, [annualGoal]);

  useEffect(() => {
    localStorage.setItem('instructorName', instructorName);
  }, [instructorName]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
      const handleScroll = () => {
          if (window.scrollY > 150) setShowFab(true);
          else setShowFab(false);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [deleteData, setDeleteData] = useState<{ isOpen: boolean, eventId: string | null }>({ isOpen: false, eventId: null });
  const [deleteStudentData, setDeleteStudentData] = useState<{ isOpen: boolean, studentId: string | null }>({ isOpen: false, studentId: null });
  const [warningData, setWarningData] = useState<{ isOpen: boolean, title: string, message: string }>({ isOpen: false, title: '', message: '' });
  const [shareData, setShareData] = useState<{ isOpen: boolean, event: CalendarEvent | null }>({ isOpen: false, event: null });
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardDate, setDashboardDate] = useState(new Date());
  const [showDashboardRevenue, setShowDashboardRevenue] = useState(false);

  // Login via Fetch conforme estratégia bem-sucedida
  const handleLogin = async (user: string, pass: string) => {
      try {
          // Despertar conexão e validar opcionalmente via remote settings
          await api.get('settings');
          
          if (user === credentials.user && pass === credentials.pass) {
              setAllEvents([]);
              setStudents([]);
              setExpenses([]);
              setIsAuthenticated(true);
              setLoginError(false);
              localStorage.setItem('is_logged_in', 'true');
          } else {
              setLoginError(true);
          }
      } catch (e) {
          console.error("Erro no login fetch:", e);
          setLoginError(true);
      }
  };

  const handleLogout = useCallback(() => {
      localStorage.removeItem('is_logged_in');
      setIsAuthenticated(false);
      setIsDrawerOpen(false);
      setCurrentView(AppView.HOME);
      setLoginError(false);
  }, []);

  const handleUpdateCredentials = (user: string, pass: string) => {
      setCredentials({ user, pass });
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const currentEvents = allEvents.filter(event => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const isSameStartDay = eventDate.toDateString() === selectedDate.toDateString();
    let isSecondDay = false;
    if (event.duration && (event.duration.toLowerCase().includes('2 dia') || event.duration.toLowerCase().includes('2 day'))) {
        const secondDay = new Date(eventDate);
        secondDay.setDate(eventDate.getDate() + 1);
        isSecondDay = secondDay.toDateString() === selectedDate.toDateString();
    }
    return isSameStartDay || isSecondDay;
  });

  const dashboardEvents = allEvents.filter(e => 
    e.date && 
    new Date(e.date).getMonth() === dashboardDate.getMonth() &&
    new Date(e.date).getFullYear() === dashboardDate.getFullYear()
  );

  const dashboardTotalValue = dashboardEvents.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const dashboardStudentCount = dashboardEvents.length;
  const dashboardExpensesValue = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === dashboardDate.getMonth() && d.getFullYear() === dashboardDate.getFullYear();
    }).reduce((acc, curr) => acc + curr.amount, 0);
  const dashboardMaterialsValue = dashboardEvents.reduce((acc, event) => {
      const cost = event.materials?.reduce((mAcc, m) => m.checked ? mAcc + (m.cost || 0) : mAcc, 0) || 0;
      return acc + cost;
  }, 0);
  const dashboardNetValue = dashboardTotalValue - dashboardExpensesValue - dashboardMaterialsValue;

  const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const yearsList = Array.from({length: 2100 - 2026 + 1}, (_, i) => 2026 + i);

  const handleDashboardMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(dashboardDate);
    newDate.setMonth(parseInt(e.target.value));
    setDashboardDate(newDate);
  };

  const handleDashboardYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(dashboardDate);
    newDate.setFullYear(parseInt(e.target.value));
    setDashboardDate(newDate);
  };

  const handleAddCourse = async (course: CourseType) => {
    await api.put('v1/courses/' + course.id, course);
    refreshData();
  };

  const handleUpdateCourse = async (updatedCourse: CourseType) => {
    await api.put('v1/courses/' + updatedCourse.id, updatedCourse);
    refreshData();
  };

  const handleRemoveCourse = async (id: string) => {
    await api.delete('v1/courses/' + id);
    refreshData();
  };

  const handleUpdateInstructorName = (name: string) => setInstructorName(name);

  const handleToggleMaterial = async (eventId: string, materialId: string) => {
      const event = allEvents.find(e => e.id === eventId);
      if (!event || !event.materials) return;
      const targetMaterial = event.materials.find(m => m.id === materialId);
      if (!targetMaterial) return;
      const isChecking = !targetMaterial.checked;
      let newExpenseId = targetMaterial.expenseId;
      if (isChecking) {
          newExpenseId = generateId();
          const newExpense: Expense = {
              id: newExpenseId,
              title: `${targetMaterial.name} - ${event.student || 'Aluna'}`,
              amount: targetMaterial.cost || 0,
              date: event.date ? new Date(event.date) : new Date()
          };
          await api.put('v1/expenses/' + newExpenseId, { ...newExpense, date: newExpense.date.toISOString() });
      } else if (targetMaterial.expenseId) {
          await api.delete('v1/expenses/' + targetMaterial.expenseId);
          newExpenseId = undefined;
      }
      const updatedMaterials = event.materials.map(m => m.id === materialId ? { ...m, checked: isChecking, expenseId: newExpenseId } : m);
      const updatedEvent = { ...event, materials: updatedMaterials };
      await api.put('v1/appointments/' + eventId, { ...updatedEvent, date: event.date?.toISOString(), paymentDueDate: event.paymentDueDate?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date.toISOString()})) });
      refreshData();
  };

  const handleUpdateMaterialCost = async (eventId: string, materialId: string, cost: number) => {
      const event = allEvents.find(e => e.id === eventId);
      if (!event || !event.materials) return;
      const updatedMaterials = event.materials.map(m => {
          if (m.id === materialId) {
              if (m.expenseId) {
                  const exp = expenses.find(x => x.id === m.expenseId);
                  if (exp) api.put('v1/expenses/' + m.expenseId, { ...exp, amount: cost, date: exp.date.toISOString() });
              }
              return { ...m, cost: cost };
          }
          return m;
      });
      const updatedEvent = { ...event, materials: updatedMaterials };
      await api.put('v1/appointments/' + eventId, { ...updatedEvent, date: event.date?.toISOString(), paymentDueDate: event.paymentDueDate?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date.toISOString()})) });
      refreshData();
  };

  const handleEditStudent = (student: Student) => {
      setEditingStudent(student);
      setIsStudentModalOpen(true);
  };

  const executeStudentDelete = async () => {
      if (deleteStudentData.studentId) {
          await api.delete('v1/students/' + deleteStudentData.studentId);
          refreshData();
      }
      setDeleteStudentData({ isOpen: false, studentId: null });
  };

  const handleSaveStudent = async (studentData: Student) => {
      await api.put('v1/students/' + studentData.id, { ...studentData, createdAt: studentData.createdAt.toISOString() });
      refreshData();
  };

  const handleAddExpense = async (expense: Expense) => {
      await api.put('v1/expenses/' + expense.id, { ...expense, date: expense.date.toISOString() });
      refreshData();
  };

  const handleDeleteExpense = async (id: string) => {
      await api.delete('v1/expenses/' + id);
      allEvents.forEach(async ev => {
          if (ev.materials) {
              const linked = ev.materials.find(m => m.expenseId === id);
              if (linked) {
                const updatedMaterials = ev.materials.map(m => m.expenseId === id ? { ...m, expenseId: undefined, checked: false } : m);
                await api.put('v1/appointments/' + ev.id, { ...ev, materials: updatedMaterials, date: ev.date?.toISOString(), paymentDueDate: ev.paymentDueDate?.toISOString(), payments: ev.payments?.map(p => ({...p, date: p.date.toISOString()})) });
              }
          }
      });
      refreshData();
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>, date: Date) => {
    if (eventData.student) {
        const studentName = eventData.student || '';
        const studentPhone = eventData.whatsapp || '';
        const studentCity = eventData.city || '';
        const studentState = eventData.state || '';
        const existingStudent = students.find(s => s.name.toLowerCase() === studentName.toLowerCase() || (studentPhone && s.phone === studentPhone));
        if (existingStudent) {
            await api.put('v1/students/' + existingStudent.id, { ...existingStudent, name: studentName, phone: studentPhone, city: studentCity, state: studentState, createdAt: existingStudent.createdAt.toISOString() });
        } else {
            const newStudentId = generateId();
            await api.put('v1/students/' + newStudentId, { id: newStudentId, name: studentName, phone: studentPhone, city: studentCity, state: studentState, createdAt: new Date().toISOString() });
        }
    }
    if (editingEvent) {
        const currentPayments = eventData.payments || editingEvent.payments || [];
        const totalPaid = currentPayments.reduce((acc, p) => acc + p.amount, 0);
        const newValue = eventData.value !== undefined ? eventData.value : editingEvent.value;
        let newStatus = eventData.paymentStatus || editingEvent.paymentStatus || 'pending';
        if (newValue && totalPaid >= newValue) newStatus = 'paid';
        const updatedEvent = { ...editingEvent, ...eventData, date: date.toISOString(), paymentStatus: newStatus, payments: currentPayments.map(p => ({ ...p, date: p.date.toISOString() })), paymentDueDate: eventData.paymentDueDate ? eventData.paymentDueDate.toISOString() : editingEvent.paymentDueDate?.toISOString(), materials: eventData.materials || editingEvent.materials };
        await api.put('v1/appointments/' + editingEvent.id, updatedEvent);
    } else {
        const uniqueId = generateId(); 
        const totalValue = eventData.value || 0;
        const initialPayments = eventData.payments || [];
        const totalPaid = initialPayments.reduce((acc, p) => acc + p.amount, 0);
        const finalStatus = totalPaid >= totalValue && totalValue > 0 ? 'paid' : (eventData.paymentStatus || 'pending');
        const newEvent = { 
            id: uniqueId, 
            title: eventData.title || 'Evento', 
            time: eventData.time || '00:00', 
            duration: eventData.duration || '1 dia', 
            type: 'class', 
            student: eventData.student, 
            whatsapp: eventData.whatsapp, 
            city: eventData.city, 
            state: eventData.state, 
            eventLocation: eventData.eventLocation, 
            paymentMethod: eventData.paymentMethod, 
            paymentStatus: finalStatus, 
            paymentDueDate: eventData.paymentDueDate ? eventData.paymentDueDate.toISOString() : undefined, 
            payments: initialPayments.map(p => ({ ...p, date: p.date.toISOString() })), 
            value: totalValue, 
            date: date.toISOString(), 
            materials: eventData.materials || [] 
        };
        await api.put('v1/appointments/' + uniqueId, newEvent);
    }
    setSelectedDate(date);
    refreshData();
    if (currentView !== AppView.HOME) setCurrentView(AppView.HOME);
  };

  const handleEditEvent = (event: CalendarEvent) => {
      setEditingEvent(event);
      setIsAddEventOpen(true);
  };

  const executeDelete = async () => {
     if (deleteData.eventId) {
        const eventToDelete = allEvents.find(e => e.id === deleteData.eventId);
        if (eventToDelete?.materials) {
            eventToDelete.materials.filter(m => !!m.expenseId).forEach(async m => await api.delete('v1/expenses/' + m.expenseId));
        }
        await api.delete('v1/appointments/' + deleteData.eventId);
        refreshData();
     }
     setDeleteData({ isOpen: false, eventId: null });
  };

  const handleConfirmPayment = async (amount: number, date: Date) => {
     if (!selectedEventForPayment) return;
     const currentPayments = selectedEventForPayment.payments || [];
     const newPayment = { id: generateId(), amount, date: date.toISOString() };
     const totalPaid = [...currentPayments, newPayment].reduce((sum, p) => sum + p.amount, 0);
     const newStatus: 'paid' | 'pending' = totalPaid >= (selectedEventForPayment.value || 0) ? 'paid' : 'pending';
     const updatedEvent = { ...selectedEventForPayment, payments: [...currentPayments.map(p => ({...p, date: p.date.toISOString()})), newPayment], paymentStatus: newStatus, date: selectedEventForPayment.date?.toISOString(), paymentDueDate: selectedEventForPayment.paymentDueDate?.toISOString() };
     await api.put('v1/appointments/' + selectedEventForPayment.id, updatedEvent);
     refreshData();
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <>
            <div className="px-5 pt-8 pb-4">
                <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">INSTRUTORA</h2>
                <div className="flex items-center gap-2 mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white leading-tight">{instructorName}</h1>
                </div>
                <div className="mb-6">
                    <button onClick={() => { setEditingEvent(null); setIsAddEventOpen(true); }} className="w-full bg-primary text-white p-5 rounded-[1.5rem] shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:scale-[1.01] flex flex-row items-center justify-center gap-3 group">
                        <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors"><PlusIcon className="w-6 h-6 text-white" /></div>
                        <span className="text-sm font-bold tracking-widest uppercase">NOVO AGENDAMENTO</span>
                    </button>
                </div>
            </div>
            <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} events={allEvents} />
            <div className="px-4 mb-2">
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <div className="relative flex items-center justify-center mb-5"> 
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-gray-700/50">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <div className="flex items-center gap-1">
                                <div className="relative">
                                    <select value={dashboardDate.getMonth()} onChange={handleDashboardMonthChange} className="appearance-none bg-transparent focus:outline-none cursor-pointer font-bold text-gray-600 dark:text-gray-300 text-sm text-center">
                                        {monthNamesShort.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                </div>
                                <span className="text-gray-300 text-xs">/</span>
                                <div className="relative">
                                    <select value={dashboardDate.getFullYear()} onChange={handleDashboardYearChange} className="appearance-none bg-transparent focus:outline-none cursor-pointer font-bold text-gray-600 dark:text-gray-300 text-sm">
                                        {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowDashboardRevenue(!showDashboardRevenue)} className="absolute right-0 text-gray-400 hover:text-primary dark:hover:text-white transition-colors p-2" title={showDashboardRevenue ? "Ocultar Valores" : "Mostrar Valores"}>
                            {showDashboardRevenue ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 divide-x divide-gray-100 dark:divide-gray-800 pt-1">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Alunas</span>
                            <span className="font-bold text-gray-800 dark:text-white text-base leading-none">{showDashboardRevenue ? dashboardStudentCount : '--'}</span>
                        </div>
                        <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Faturamento</span>
                             <span className="font-bold text-gray-800 dark:text-white text-base leading-none">{showDashboardRevenue ? `R$ ${dashboardTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'R$ ----'}</span>
                        </div>
                        <div className="flex flex-col items-center">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Líquido</span>
                             <span className="font-bold text-gray-800 dark:text-white text-base leading-none">{showDashboardRevenue ? `R$ ${dashboardNetValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'R$ ----'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <EventList date={selectedDate} events={currentEvents} onDeleteEvent={(id) => setDeleteData({ isOpen: true, eventId: id })} onAddPayment={(ev) => { setSelectedEventForPayment(ev); setIsPaymentModalOpen(true); }} onEditEvent={handleEditEvent} onToggleMaterial={handleToggleMaterial} onUpdateMaterialCost={handleUpdateMaterialCost} onShareEvent={(ev) => setShareData({ isOpen: true, event: ev })} courseTypes={courseTypes} />
          </>
        );
      case AppView.STUDENTS:
          return <StudentsList students={students} onEdit={handleEditStudent} onDelete={(id) => setDeleteStudentData({ isOpen: true, studentId: id })} />;
      case AppView.HISTORY: 
          return <HistoryScreen events={allEvents} />;
      case AppView.EXPENSES: 
          return <ExpensesScreen expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />;
      case AppView.FINANCIAL:
        return <FinancialScreen events={allEvents} annualGoal={annualGoal} onUpdateGoal={setAnnualGoal} expenses={expenses} />;
      case AppView.ADD_EVENTS:
        return <CourseManager courseTypes={courseTypes} onAddCourse={handleAddCourse} onUpdateCourse={handleUpdateCourse} onRemoveCourse={handleRemoveCourse} />;
      case AppView.MATERIALS:
        return <MaterialsScreen courseTypes={courseTypes} onUpdateCourse={handleUpdateCourse} />;
      case AppView.ANALYTICS: 
        return <AnalyticsScreen events={allEvents} />;
      case AppView.SETTINGS:
        return <SettingsScreen isDarkMode={isDarkMode} onToggleTheme={toggleTheme} primaryColor={primaryColor} onUpdateColor={setPrimaryColor} instructorName={instructorName} onUpdateInstructorName={handleUpdateInstructorName} onClearAllData={() => {}} currentUsername={credentials.user} onUpdateCredentials={handleUpdateCredentials} />;
      default:
        return null;
    }
  };

  const renderProtectedContent = () => {
    try {
        return renderContent();
    } catch (error) {
        console.error("Render Error:", error);
        return (
            <div className="p-10 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                    <AlertCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Erro de Carregamento</h2>
                <p className="text-gray-500 text-sm max-w-xs">Ocorreu um problema ao renderizar esta tela. Tente recarregar a página.</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg"
                >
                    Recarregar App
                </button>
            </div>
        );
    }
  };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} loginError={loginError} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-dark transition-colors duration-200 font-sans">
      <header className="sticky top-0 z-30 bg-primary shadow-lg h-16 flex items-center justify-between px-4 transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors focus:outline-none"><MenuIcon className="w-6 h-6" /></button>
          <div className="flex items-center gap-2">
            <img src="https://i.postimg.cc/gJ2C9FMT/icon.png" alt="Logo" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-white tracking-wide">SelectClass</h1>
          </div>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors" aria-label="Toggle theme">
          {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
      </header>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} currentView={currentView} onChangeView={setCurrentView} onLogout={handleLogout} />
      <main className="relative max-w-md mx-auto min-h-[calc(100vh-64px)] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">{renderProtectedContent()}</main>
      <button onClick={() => { setEditingEvent(null); setIsAddEventOpen(true); }} className={`fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300 transform ${showFab && currentView === AppView.HOME ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`} aria-label="Novo Agendamento"><PlusIcon className="w-6 h-6" /></button>
      <AddEventModal isOpen={isAddEventOpen} onClose={() => { setIsAddEventOpen(false); setEditingEvent(null); }} onSave={handleSaveEvent} courseTypes={courseTypes} initialDate={selectedDate} initialEvent={editingEvent} />
      <StudentModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} onSave={handleSaveStudent} initialStudent={editingStudent} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} event={selectedEventForPayment} onConfirmPayment={handleConfirmPayment} />
      <ShareModal isOpen={shareData.isOpen} onClose={() => setShareData({ isOpen: false, event: null })} event={shareData.event} />
      <WarningModal isOpen={warningData.isOpen} onClose={() => setWarningData({...warningData, isOpen: false})} title={warningData.title} message={warningData.message} />
      <ConfirmationModal isOpen={deleteData.isOpen} onClose={() => setDeleteData({isOpen: false, eventId: null})} onConfirm={executeDelete} title="Excluir Agendamento" message="Tem certeza que deseja remover este agendamento?" />
      <ConfirmationModal isOpen={deleteStudentData.isOpen} onClose={() => setDeleteStudentData({isOpen: false, studentId: null})} onConfirm={executeStudentDelete} title="Excluir Aluna" message="Tem certeza que deseja excluir?" />
    </div>
  );
}

export default App;