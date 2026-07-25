
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, CalendarEvent, CourseType, Student, Expense, MaterialItem, LectureModel } from './types';
import { Drawer } from './components/Drawer';
import { Calendar } from './components/Calendar';
import { EventList } from './components/EventList';
import { AddEventModal } from './components/AddEventModal';
import { PaymentModal } from './components/PaymentModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { WarningModal } from './components/WarningModal'; 
import { ShareModal } from './components/ShareModal';
import { ChargeModal } from './components/ChargeModal';
import { CourseManager } from './components/CourseManager';
import { FinancialScreen } from './components/FinancialScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StudentsList } from './components/StudentsList';
import { MaterialsScreen } from './components/MaterialsScreen'; 
import { AnalyticsScreen } from './components/AnalyticsScreen'; 
import { HistoryScreen } from './components/HistoryScreen'; 
import { ExpensesScreen } from './components/ExpensesScreen';
import { CotacoesScreen } from './components/CotacoesScreen';
import { AllEventsList } from './components/AllEventsList';
import { StudentModal } from './components/StudentModal';
import { LoginScreen } from './components/LoginScreen'; 
import { UnifiedSearch } from './components/UnifiedSearch';
import { LectureModelManager } from './components/LectureModelManager';
import { MenuIcon, PlusIcon, MoonIcon, SunIcon, EyeIcon, EyeOffIcon, CalendarIcon, AlertCircleIcon, XIcon, BoxIcon, MicIcon, GraduationCapIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon, BellIcon, ChevronLeftIcon } from './components/Icons';
import { parseCurrency } from './utils/currency';
import { isEventOverdue } from './utils/eventUtils';

const FIREBASE_URL = "https://selectclass-dd1d0-default-rtdb.firebaseio.com/";
const DEFAULT_CREDENTIALS = { user: 'danieledias', pass: '@Dn201974' };

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const SplashScreen = () => (
  <div className="fixed inset-0 z-[200] bg-[#1A4373] flex items-center justify-center animate-fade-in">
    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_logged_in') === 'true');
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const [credentials, setCredentials] = useState(() => {
     const saved = localStorage.getItem('auth_credentials');
     return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#1A4373');
  const [instructorName, setInstructorName] = useState(() => localStorage.getItem('instructorName') || 'Daniele Dias');
  const [annualGoal, setAnnualGoal] = useState(() => {
    const saved = localStorage.getItem('annualGoal');
    return saved ? parseFloat(saved) : 81000;
  });

  useEffect(() => {
    localStorage.setItem('annualGoal', annualGoal.toString());
  }, [annualGoal]);

  useEffect(() => {
    localStorage.setItem('instructorName', instructorName);
  }, [instructorName]);

  const [students, setStudents] = useState<Student[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [lectureModels, setLectureModels] = useState<LectureModel[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [showFab, setShowFab] = useState(false);

  const api = {
    get: async (path: string) => {
        try {
            const response = await fetch(`${FIREBASE_URL}${path}.json`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) { return null; }
    },
    put: async (path: string, data: any) => {
        try { await fetch(`${FIREBASE_URL}${path}.json`, { method: 'PUT', body: JSON.stringify(data) }); } catch (error) {}
    },
    delete: async (path: string) => {
        try { await fetch(`${FIREBASE_URL}${path}.json`, { method: 'DELETE' }); } catch (error) {}
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
        const remoteCreds = await api.get('v1/config/credentials');
        if (remoteCreds && remoteCreds.user && remoteCreds.pass) {
            setCredentials(remoteCreds);
            localStorage.setItem('auth_credentials', JSON.stringify(remoteCreds));
        }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) setShowFab(true);
      else setShowFab(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    const [eventsData, coursesData, studentsData, expensesData, palestrasData, lectureModelsData, cotacoesData] = await Promise.all([
        api.get('v1/appointments'),
        api.get('v1/courses'),
        api.get('v1/students'),
        api.get('v1/expenses'),
        api.get('palestras_v1'),
        api.get('v1/lecture_models'),
        api.get('v1/data/cotacoes')
    ]);
    const normalizeEvents = (data: any) => data ? Object.values(data).map((e: any) => ({ 
        ...e, 
        date: e.date ? new Date(e.date) : undefined, 
        createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
        payments: e.payments ? e.payments.map((p: any) => ({...p, date: new Date(p.date)})) : [] 
    })) : [];
    
    const coursesArr = coursesData ? Object.values(coursesData) as CourseType[] : [];
    const lecturesArr = lectureModelsData ? Object.values(lectureModelsData) as LectureModel[] : [];

    setAllEvents([...normalizeEvents(eventsData), ...normalizeEvents(palestrasData)]);
    setCourseTypes(coursesArr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    setLectureModels(lecturesArr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    setStudents(studentsData ? Object.values(studentsData).map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })) : []);
    setExpenses(expensesData ? Object.values(expensesData).map((e: any) => ({ ...e, date: new Date(e.date) })) : []);
    
    setCotacoes(cotacoesData ? Object.values(cotacoesData).map((c: any) => ({ ...c, date: c.date ? new Date(c.date) : undefined, endDate: c.endDate ? new Date(c.endDate) : undefined })) : []);
    setIsInitialLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) { refreshData(); const interval = setInterval(refreshData, 15000); return () => clearInterval(interval); }
  }, [isAuthenticated, refreshData]);

  useEffect(() => { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);
  
  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const h = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
      return res ? `${parseInt(res[1], 16)} ${parseInt(res[2], 16)} ${parseInt(res[3], 16)}` : '26 67 115';
    };
    const rgb = hexToRgb(primaryColor);
    document.documentElement.style.setProperty('--color-primary-rgb', rgb);
    document.documentElement.style.setProperty('--color-primary-dark-rgb', rgb.split(' ').map(Number).map(v => Math.max(0, v - 40)).join(' '));
  }, [primaryColor]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [preSelectedModel, setPreSelectedModel] = useState<'Curso' | 'Palestra'>('Curso');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ isOpen: boolean, eventId: string | null }>({ isOpen: false, eventId: null });
  const [quickAddMaterialConfirm, setQuickAddMaterialConfirm] = useState<{ isOpen: boolean, eventId: string, name: string, cost: number } | null>(null);
  const [quickRemoveMaterialConfirm, setQuickRemoveMaterialConfirm] = useState<{ isOpen: boolean, eventId: string, materialId: string, materialName: string } | null>(null);
  const [deleteStudentData, setDeleteStudentData] = useState<{ isOpen: boolean, studentId: string | null }>({ isOpen: false, studentId: null });
  const [shareData, setShareData] = useState<{ isOpen: boolean, event: CalendarEvent | null, mode?: 'schedule' | 'payment' }>({ isOpen: false, event: null });
  const [chargeData, setChargeData] = useState<{ isOpen: boolean, event: CalendarEvent | null }>({ isOpen: false, event: null });
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<CalendarEvent | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<number | undefined>(undefined);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [targetCotacaoId, setTargetCotacaoId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardDate, setDashboardDate] = useState(new Date());
  const [showDashboardRevenue, setShowDashboardRevenue] = useState(false);
  const [dashboardPeriod, setDashboardPeriod] = useState<'month' | 'day'>('day');
  const [eventFilter, setEventFilter] = useState<'cursos' | 'palestras'>('cursos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [highlightEventId, setHighlightEventId] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);

  const notifications = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    return allEvents.filter(evt => {
      const isPal = (evt.palestraType || evt.title === 'Palestra' || evt.title === 'Workshop' || lectureModels.some(m => m.name === evt.title));
      if (isPal) return false;

      // Calculate total value
      const baseValue = parseCurrency(evt.value) || 0;
      const totalPaid = (evt.payments || []).reduce((acc, p) => acc + parseCurrency(p.amount), 0);
      const isPaid = (baseValue - totalPaid) < 0.01 && baseValue > 0;
      if (isPaid) return false;

      if (!evt.paymentFrequency || !evt.createdAt || !evt.date) return false;

      // Calculate schedule
      const startDate = new Date(evt.createdAt);
      const courseDate = new Date(evt.date);
      courseDate.setHours(0,0,0,0);
      const deadlineDays = evt.paymentDeadlineDays || 0;
      const interval = evt.paymentFrequency === 'weekly' ? 7 : evt.paymentFrequency === 'monthly' ? 30 : 15;
      
      const maxDate = new Date(courseDate);
      maxDate.setDate(courseDate.getDate() - deadlineDays);
      
      const scheduleDates: Date[] = [];
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
            if (dStr.indexOf('T') === -1) {
              dStr += 'T12:00:00';
            }
            finalD = new Date(dStr);
          }
        }
        
        if (hasMoreCustomDates) {
           isLast = false;
        }
        
        scheduleDates.push(finalD);
        if (isLast) break;
        i++;
        if (i > 50) break;
      }

      // Check if any installment is due or overdue
      return scheduleDates.some((d, idx) => {
        const isPaidInstallment = evt.payments?.some(p => p.installment === idx + 1);
        if (isPaidInstallment) return false;
        
        const installmentDate = new Date(d);
        installmentDate.setHours(0,0,0,0);
        return installmentDate.getTime() <= today.getTime();
      });
    }).sort((a, b) => {
      // Sort by event date (closest first)
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
  }, [allEvents, lectureModels]);

  const currentDayEventsCount = useMemo(() => {
    return allEvents.filter(e => { 
      if (!e.date) return false; 
      const eDate = new Date(e.date);
      eDate.setHours(0,0,0,0);
      const sDate = new Date(selectedDate);
      sDate.setHours(0,0,0,0);

      const dStr = String(e.duration || '').toLowerCase();
      let durationNum = 1;
      if (dStr.includes('dia')) {
        durationNum = parseInt(dStr) || 1;
      }

      const eEnd = new Date(eDate);
      eEnd.setDate(eDate.getDate() + durationNum);

      const isWithinRange = sDate >= eDate && sDate < eEnd;
      return isWithinRange; 
    }).length;
  }, [allEvents, selectedDate, lectureModels]);

  const handleLogin = (user: string, pass: string) => { 
    if (user === credentials.user && pass === credentials.pass) { 
        setIsInitialLoading(true); 
        setIsAuthenticated(true); 
        localStorage.setItem('is_logged_in', 'true'); 
    } else {
        setLoginError(true); 
    }
  };

  const handleLogout = () => { localStorage.removeItem('is_logged_in'); setIsAuthenticated(false); setCurrentView(AppView.HOME); };

  const handleUpdateCredentials = async (user: string, pass: string) => {
      const newCreds = { user, pass };
      setCredentials(newCreds);
      localStorage.setItem('auth_credentials', JSON.stringify(newCreds));
      await api.put('v1/config/credentials', newCreds);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>, date: Date) => {
    const isNew = !editingEvent;
    const isLecNow = eventData.title === 'Palestra' || eventData.title === 'Workshop' || lectureModels.some(m => m.name === eventData.title);
    const uniqueId = editingEvent?.id || generateId();
    const basePath = isLecNow ? 'palestras_v1' : 'v1/appointments';

    let finalMaterials = eventData.materials || editingEvent?.materials;
    if (isNew && !isLecNow && (!finalMaterials || finalMaterials.length === 0)) {
      const mergedMaterials: Map<string, MaterialItem> = new Map();

      // 1. Load from defaultMaterials of course config
      const courseConfig = courseTypes.find(c => c.name === eventData.title);
      if (courseConfig?.defaultMaterials) {
        courseConfig.defaultMaterials.forEach(m => {
          mergedMaterials.set(m.name.toLowerCase().trim(), {
            id: generateId(),
            name: m.name,
            checked: true,
            cost: 0
          });
        });
      }

      // 2. Load from the latest student's materials of the SAME course
      const previousSimilarEvent = allEvents
       .filter(e => e.title === eventData.title && e.materials && e.materials.length > 0)
       .sort((a, b) => {
         const aDate = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
         const bDate = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
         return bDate - aDate;
       })[0];

      if (previousSimilarEvent && previousSimilarEvent.materials) {
        previousSimilarEvent.materials.forEach(m => {
          const key = m.name.toLowerCase().trim();
          mergedMaterials.set(key, {
            id: generateId(),
            name: m.name,
            checked: true,
            cost: m.cost || 0
          });
        });
      }

      finalMaterials = Array.from(mergedMaterials.values());
    }

    if (!isNew && editingEvent) {
      const wasLec = editingEvent.title === 'Palestra' || editingEvent.title === 'Workshop' || lectureModels.some(m => m.name === editingEvent.title);
      if (wasLec !== isLecNow) await api.delete(`${wasLec ? 'palestras_v1' : 'v1/appointments'}/${editingEvent.id}`);
    }

    const saveObj = { 
      ...editingEvent, 
      ...eventData, 
      id: uniqueId, 
      date: date.toISOString(),
      materials: finalMaterials,
      payments: eventData.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) || [],
      createdAt: editingEvent?.createdAt instanceof Date ? editingEvent.createdAt.toISOString() : (editingEvent?.createdAt || new Date().toISOString())
    };
    
    // Auto-create student if it doesn't exist
    if (!isLecNow && eventData.student) {
        const studentExists = students.some(s => s.name.toLowerCase() === eventData.student?.toLowerCase());
        if (!studentExists) {
            const studentId = generateId();
            await api.put(`v1/students/${studentId}`, {
                id: studentId,
                name: eventData.student,
                phone: eventData.whatsapp || '',
                email: eventData.email || '',
                createdAt: new Date().toISOString()
            });
        }
    }

    setIsAddEventOpen(false);
    setEditingEvent(null);
    await api.put(`${basePath}/${uniqueId}`, saveObj);
    await refreshData();
    if (isNew && !isLecNow) setShareData({ isOpen: true, event: { ...saveObj, date: new Date(saveObj.date) } as any });
  };

  const handleAddExpense = async (expense: Expense) => {
    await api.put(`v1/expenses/${expense.id}`, { ...expense, date: expense.date.toISOString() });
    refreshData();
  };

  const handleDeleteExpense = async (id: string) => {
    await api.delete(`v1/expenses/${id}`);
    refreshData();
  };

  const handleToggleMaterial = async (eventId: string, materialId: string) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event || !event.materials) return;
    const updatedMaterials = event.materials.map(m => m.id === materialId ? { ...m, checked: !m.checked } : m);
    const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
    await api.put(`${path}/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    refreshData();
  };

  const handleToggleAbate = async (eventId: string) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
    await api.put(`${path}/${eventId}`, { ...event, abateExpenses: !event.abateExpenses, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    refreshData();
  };

  const handleQuickAddMaterial = async (eventId: string, name: string, cost: number) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    const isLec = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title));
    
    if (!isLec) {
      setQuickAddMaterialConfirm({ isOpen: true, eventId, name, cost });
      return;
    }

    const newMaterial: MaterialItem = { id: generateId(), name, checked: true, cost };
    const updatedMaterials = [...(event.materials || []), newMaterial];
    await api.put(`palestras_v1/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    refreshData();
  };

  const confirmQuickAddMaterial = async (applyToAll: boolean) => {
    if (!quickAddMaterialConfirm) return;
    const { eventId, name, cost } = quickAddMaterialConfirm;
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    if (applyToAll && event.date) {
      // Apply to all events on the same day
      const eventDate = new Date(event.date);
      const eventsToUpdate = allEvents.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getDate() === eventDate.getDate() && 
               d.getMonth() === eventDate.getMonth() && 
               d.getFullYear() === eventDate.getFullYear();
      });
      
      for (const e of eventsToUpdate) {
        // Check if material already exists by name
        const exists = (e.materials || []).some(m => m.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
          const newMaterial: MaterialItem = { id: generateId(), name, checked: true, cost };
          const updatedMaterials = [...(e.materials || []), newMaterial];
          const path = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title)) ? 'palestras_v1' : 'v1/appointments';
          await api.put(`${path}/${e.id}`, { ...e, materials: updatedMaterials, date: e.date?.toISOString(), payments: e.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
        }
      }
    } else {
      // Apply only to this event
      const newMaterial: MaterialItem = { id: generateId(), name, checked: true, cost };
      const updatedMaterials = [...(event.materials || []), newMaterial];
      const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
      await api.put(`${path}/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    }

    setQuickAddMaterialConfirm(null);
    refreshData();
  };

  const handleAddAllChecklistToEvent = async (eventId: string, matsToAdd: {name: string, cost: number}[]) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    // Add all specified materials to the event at once
    const newMaterialsToAdd = matsToAdd.map(m => ({
      id: generateId(),
      name: m.name,
      checked: false, // Default to pending
      cost: m.cost
    }));

    const updatedMaterials = [...(event.materials || []), ...newMaterialsToAdd];
    const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
    
    await api.put(`${path}/${event.id}`, { 
      ...event, 
      materials: updatedMaterials, 
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
      payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) 
    });

    refreshData();
  };

  const handleAddDailyMaterial = async (name: string, cost: number, currentDayEventsList: CalendarEvent[]) => {
    // Apenas aplica aos eventos do tipo "Curso" deste dia
    const targetEvents = currentDayEventsList.filter(e => {
        const isLec = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
        return !isLec;
    });

    for (const e of targetEvents) {
      const exists = (e.materials || []).some(m => m.name.toLowerCase().trim() === name.toLowerCase().trim());
      if (!exists) {
        // Inicializa como falso (faltando)
        const newMaterial: MaterialItem = { id: generateId(), name, checked: false, cost }; 
        const updatedMaterials = [...(e.materials || []), newMaterial];
        const path = 'v1/appointments';
        
        await api.put(`${path}/${e.id}`, { 
           ...e, 
           materials: updatedMaterials, 
           date: e.date instanceof Date ? e.date.toISOString() : e.date,
           payments: e.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date }))
        });
      }
    }
    refreshData();
  };

  const handleEditDailyMaterial = async (oldName: string, newName: string, cost: number, currentDayEventsList: CalendarEvent[]) => {
    const targetEvents = currentDayEventsList.filter(e => {
        const isLec = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
        return !isLec;
    });

    for (const e of targetEvents) {
      const exists = (e.materials || []).some(m => m.name.toLowerCase().trim() === oldName.toLowerCase().trim());
      if (exists) {
        const updatedMaterials = (e.materials || []).map(m => {
          if (m.name.toLowerCase().trim() === oldName.toLowerCase().trim()) {
            return { ...m, name: newName, cost };
          }
          return m;
        });
        
        const path = 'v1/appointments';
        await api.put(`${path}/${e.id}`, { 
           ...e, 
           materials: updatedMaterials, 
           date: e.date instanceof Date ? e.date.toISOString() : e.date,
           payments: e.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date }))
        });
      }
    }
    refreshData();
  };

  const handleDeleteDailyMaterial = async (name: string, currentDayEventsList: CalendarEvent[]) => {
    const targetEvents = currentDayEventsList.filter(e => {
        const isLec = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
        return !isLec;
    });

    for (const e of targetEvents) {
      const exists = (e.materials || []).some(m => m.name.toLowerCase().trim() === name.toLowerCase().trim());
      if (exists) {
        const updatedMaterials = (e.materials || []).filter(m => m.name.toLowerCase().trim() !== name.toLowerCase().trim());
        const path = 'v1/appointments';
        await api.put(`${path}/${e.id}`, { 
           ...e, 
           materials: updatedMaterials, 
           date: e.date instanceof Date ? e.date.toISOString() : e.date,
           payments: e.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date }))
        });
      }
    }
    refreshData();
  };

  const handleUpdateMaterial = async (eventId: string, materialId: string, name: string, cost: number) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event || !event.materials) return;
    
    const updatedMaterials = event.materials.map(m => 
      m.id === materialId ? { ...m, name, cost } : m
    );
    
    const isLec = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title));
    const path = isLec ? 'palestras_v1' : 'v1/appointments';
    
    await api.put(`${path}/${eventId}`, { 
      ...event, 
      materials: updatedMaterials, 
      date: event.date?.toISOString(), 
      payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) 
    });
    refreshData();
  };

  const handleRemoveMaterial = async (eventId: string, materialId: string, materialName?: string) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event || !event.materials) return;
    
    const isLec = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title));
    
    if (!isLec && materialName) {
      setQuickRemoveMaterialConfirm({ isOpen: true, eventId, materialId, materialName });
      return;
    }

    const updatedMaterials = event.materials.filter(m => m.id !== materialId);
    const path = isLec ? 'palestras_v1' : 'v1/appointments';
    await api.put(`${path}/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    refreshData();
  };

  const confirmQuickRemoveMaterial = async (applyToAll: boolean) => {
    if (!quickRemoveMaterialConfirm) return;
    const { eventId, materialId, materialName } = quickRemoveMaterialConfirm;
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    if (applyToAll && event.date) {
      const eventDate = new Date(event.date);
      const eventsToUpdate = allEvents.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getDate() === eventDate.getDate() && 
               d.getMonth() === eventDate.getMonth() && 
               d.getFullYear() === eventDate.getFullYear();
      });

      for (const e of eventsToUpdate) {
        const updatedMaterials = (e.materials || []).filter(m => m.name.toLowerCase() !== materialName.toLowerCase());
        const path = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title)) ? 'palestras_v1' : 'v1/appointments';
        await api.put(`${path}/${e.id}`, { ...e, materials: updatedMaterials, date: e.date?.toISOString(), payments: e.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
      }
    } else {
      const updatedMaterials = (event.materials || []).filter(m => m.id !== materialId);
      const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
      await api.put(`${path}/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    }

    setQuickRemoveMaterialConfirm(null);
    refreshData();
  };

  const handleDirectInstallmentPaid = async (event: CalendarEvent, installment: number) => {
    const newPayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: 0,
      date: new Date().toISOString(),
      method: 'Pix',
      installment
    };
    const updatedPayments = [...(event.payments || []), newPayment];
    const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
    const updatedEv = { ...event, payments: updatedPayments, date: event.date instanceof Date ? event.date.toISOString() : event.date };
    await api.put(`${path}/${event.id}`, updatedEv);
    refreshData();
    setShareData({ isOpen: true, event: { ...updatedEv, date: new Date(updatedEv.date || new Date()) } as any, mode: 'payment' });
  };

  const handleChangeInstallmentDate = async (event: CalendarEvent, installment: number, newDate: string) => {
    const updatedDates = { ...(event.installmentDates || {}) };
    updatedDates[installment] = newDate;
    const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
    await api.put(`${path}/${event.id}`, { ...event, installmentDates: updatedDates, date: event.date instanceof Date ? event.date.toISOString() : event.date });
    refreshData();
  };

  const handleShareFinancialSummary = (event: CalendarEvent) => {
    setShareData({ isOpen: true, event, mode: 'payment' });
  };

  const handleSaveCourseOrder = async (orderedList: CourseType[]) => {
      for (const item of orderedList) await api.put(`v1/courses/${item.id}`, item);
      refreshData();
  };

  const handleSaveLectureOrder = async (orderedList: LectureModel[]) => {
      for (const item of orderedList) await api.put(`v1/lecture_models/${item.id}`, item);
      refreshData();
  };

  const executeDelete = async () => {
     if (deleteData.eventId) {
        const ev = allEvents.find(e => e.id === deleteData.eventId);
        const path = (ev?.title === 'Palestra' || ev?.title === 'Workshop' || lectureModels.some(m => m.name === ev?.title)) ? 'palestras_v1' : 'v1/appointments';
        await api.delete(`${path}/${deleteData.eventId}`);
        refreshData();
     }
     setDeleteData({ isOpen: false, eventId: null });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME: {
        const dashboardFilteredEvents = allEvents.filter(e => {
            if (!e.date) return false;
            const d = new Date(e.date);
            
            let isWithinPeriod = false;
            if (dashboardPeriod === 'month') {
                isWithinPeriod = d.getMonth() === dashboardDate.getMonth() && d.getFullYear() === dashboardDate.getFullYear();
            } else {
                // Check if the selected date falls within the event's duration
                const eDate = new Date(e.date);
                eDate.setHours(0,0,0,0);
                const sDate = new Date(selectedDate);
                sDate.setHours(0,0,0,0);

                const dStr = String(e.duration || '').toLowerCase();
                let durationNum = 1;
                if (dStr.includes('dia')) {
                  durationNum = parseInt(dStr) || 1;
                }

                const eEnd = new Date(eDate);
                eEnd.setDate(eDate.getDate() + durationNum);

                isWithinPeriod = sDate >= eDate && sDate < eEnd;
            }
            
            if (!isWithinPeriod) return false;
            return true;
        });

        const totalFaturamento = dashboardFilteredEvents.reduce((a, c) => {
            if (c.includeInAnnualRevenue === false) return a;
            const isPal = (c.palestraType || c.title === 'Palestra' || c.title === 'Workshop' || lectureModels.some(m => m.name === c.title));
            const baseValue = parseCurrency(c.value) || 0;
            const courseValue = (isPal && c.palestraType === 'MEU') ? baseValue * (c.studentCount || 1) : baseValue;
            return a + courseValue;
        }, 0);
        
        // CORREÇÃO: Faturamento Real (Recebido) para o cálculo do Líquido
        const totalReceived = dashboardFilteredEvents.reduce((acc, event) => {
            if (event.includeInAnnualRevenue === false) return acc;
            const paymentsSum = event.payments?.reduce((s, p) => s + (parseCurrency(p.amount) || 0), 0) || 0;
            return acc + paymentsSum;
        }, 0);

        const totalPending = dashboardFilteredEvents.reduce((acc, event) => {
            if (event.includeInAnnualRevenue === false) return acc;
            const isPal = (event.palestraType || event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title));
            const baseValue = parseCurrency(event.value) || 0;
            const courseValue = (isPal && event.palestraType === 'MEU') ? baseValue * (event.studentCount || 1) : baseValue;
            const paymentsReceived = event.payments?.reduce((s, p) => s + (parseCurrency(p.amount) || 0), 0) || 0;
            const pending = Math.max(0, courseValue - paymentsReceived);
            return acc + pending;
        }, 0);

        // Despesas fixas (do módulo despesas) que pertencem a essa categoria (cursos/palestras)
        const manualExpensesSum = expenses
            .filter(exp => {
                const d = new Date(exp.date);
                let isWithinPeriod = false;
                if (dashboardPeriod === 'month') {
                    isWithinPeriod = d.getMonth() === dashboardDate.getMonth() && d.getFullYear() === dashboardDate.getFullYear();
                } else {
                    // For manual expenses, we just check if it matches the exact selected day
                    isWithinPeriod = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
                }
                return isWithinPeriod;
            })
            .reduce((a, c) => a + (parseCurrency(c.amount) || 0), 0);

        // Gastos de checklist dos eventos do mês atual - Sempre soma e abate do líquido conforme pedido
        const checklistExpensesSum = dashboardFilteredEvents.reduce((acc, event) => {
            const materials = event.materials || [];
            const matCost = materials.reduce((s, m) => s + (parseCurrency(m.cost) || 0), 0);
            return acc + matCost;
        }, 0);

        const totalExpenses = manualExpensesSum + checklistExpensesSum;
        
        // CORREÇÃO: Líquido (Sempre Recebido - Despesas)
        const totalLiquid = totalReceived - totalExpenses;

        const totalStudents = dashboardFilteredEvents.reduce((acc, event) => acc + (event.studentCount || 0), 0);

        const todayZeroed = new Date();
        todayZeroed.setHours(0,0,0,0);
        
        const groupedUpcomingCourses = new Map<string, { date: Date, title: string, students: string[], id: string, diffDays: number }>();
        allEvents.forEach(e => {
            if (!e.date) return;
            const isPal = (e.palestraType || e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
            if (isPal) return;
            
            const eStart = new Date(e.date);
            eStart.setHours(0,0,0,0);
            
            const dStr = String(e.duration || '').toLowerCase();
            let durationNum = 1;
            if (dStr.includes('dia')) durationNum = parseInt(dStr) || 1;
            const eEnd = new Date(eStart);
            eEnd.setDate(eStart.getDate() + durationNum - 1);
            
            if (eEnd >= todayZeroed) {
                const diffTime = eStart.getTime() - todayZeroed.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                const key = `${eStart.getTime()}-${e.title}`;
                if (!groupedUpcomingCourses.has(key)) {
                    groupedUpcomingCourses.set(key, { 
                        date: eStart, 
                        title: e.title, 
                        students: [], 
                        id: e.id,
                        diffDays: diffDays
                     });
                }
                const group = groupedUpcomingCourses.get(key)!;
                if (e.student) {
                    group.students.push(e.student);
                }
            }
        });
        
        const nextCourses = Array.from(groupedUpcomingCourses.values())
            .sort((a,b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3);

        return (
          <>
            <div className="px-4 pt-4 pb-1 space-y-2">
                <button onClick={() => setIsTypeSelectionOpen(true)} className="w-full bg-primary text-white py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 group active:scale-95 transition-all">
                    <div className="bg-white/20 p-1 rounded-full"><PlusIcon className="w-4 h-4 text-white" /></div>
                    <span className="text-[11px] font-black tracking-widest uppercase">NOVO AGENDAMENTO</span>
                </button>
                <button onClick={() => setCurrentView(AppView.ALL_EVENTS)} className="w-full bg-gray-100 dark:bg-white/5 text-primary py-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <div className="p-1 rounded-full bg-primary/5 dark:bg-primary/10"><SearchIcon className="w-4 h-4 text-primary" /></div>
                    <span className="text-[9px] font-black tracking-widest uppercase">TODOS AGENDAMENTOS</span>
                </button>
            </div>
            <Calendar cotacoes={cotacoes} showTooltipForEvents={true}
              onCotacaoClick={(id) => { setTargetCotacaoId(id); setCurrentView(AppView.COTACOES); }} 
              selectedDate={selectedDate} 
              onSelectDate={(date) => {
                setSelectedDate(date);
                const eventsOnDay = allEvents.filter(e => {
                  if (!e.date) return false;
                  const eDate = new Date(e.date);
                  const dStr = String(e.duration || '').toLowerCase();
                  let durationNum = 1;
                  if (dStr.includes('dia')) {
                    durationNum = parseInt(dStr) || 1;
                  }
                  for (let j = 0; j < durationNum; j++) {
                    const currentRangeDay = new Date(eDate);
                    currentRangeDay.setDate(eDate.getDate() + j);
                    if (currentRangeDay.toDateString() === date.toDateString()) return true;
                  }
                  return false;
                });
                if (eventsOnDay.length > 0) {
                  const hasPalestra = eventsOnDay.some(e => e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
                }
              }} 
              onMonthChange={(newMonthDate) => setDashboardDate(newMonthDate)}
              events={allEvents} 
              courseTypes={courseTypes}
              lectureModels={lectureModels}
            />

            {nextCourses.length > 0 && (
              <div className="px-4 mb-2">
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-2.5 border border-primary/20 dark:border-primary/30 shadow-sm flex flex-col gap-1.5">
                  <h3 className="text-[9px] font-black uppercase text-primary dark:text-blue-300 tracking-wider">
                    Próximos Cursos
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {nextCourses.map(course => {
                        const isExpanded = expandedCourses.includes(course.id);
                        
                        let daysLabel = "";
                        if (course.diffDays < 0) daysLabel = "Em andamento";
                        else if (course.diffDays === 0) daysLabel = "Hoje!";
                        else if (course.diffDays === 1) daysLabel = "Amanhã!";
                        else daysLabel = `Faltam ${course.diffDays} dias`;

                        return (
                            <div key={course.id} className="flex flex-col bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 p-2 rounded-lg transition-all">
                                <div 
                                    className="flex flex-row justify-between items-center cursor-pointer"
                                    onClick={() => {
                                        if (isExpanded) {
                                            setExpandedCourses(prev => prev.filter(id => id !== course.id));
                                        } else {
                                            setExpandedCourses(prev => [...prev, course.id]);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col overflow-hidden w-2/3 pr-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-bold text-gray-800 dark:text-white truncate">{course.title}</span>
                                            {course.students.length > 0 && (
                                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                                    {course.students.length}
                                                </span>
                                            )}
                                        </div>
                                        <button className="text-[9px] text-primary flex items-center gap-1 font-semibold mt-0.5 text-left w-max">
                                            {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                                            {isExpanded ? 'Ocultar alunas' : 'Ver alunas'}
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-end w-1/3 text-right">
                                        <span className={`text-[10px] font-black uppercase ${course.diffDays <= 2 && course.diffDays >= 0 ? 'text-red-500 animate-pulse' : 'text-primary/80'}`}>
                                            {daysLabel}
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-medium mb-1">
                                            {course.date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                        </span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const d = new Date(course.date);
                                                setSelectedDate(d);
                                                setDashboardDate(d);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="bg-primary text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-sm hover:bg-primary/90 transition-colors"
                                        >
                                            Ir para a data
                                        </button>
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50 flex flex-col gap-1 pl-1">
                                        {course.students.length > 0 ? course.students.map((studentName, idx) => (
                                            <div key={idx} className="text-[10px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5 break-words">
                                                <span className="text-[8px] opacity-60">👩‍🎓</span> 
                                                <span>{studentName || 'Não informado'}</span>
                                            </div>
                                        )) : (
                                            <div className="text-[10px] text-gray-400 italic">Nenhuma aluna informada</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 mb-2">
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner">
                                <button onClick={() => setDashboardPeriod('day')} className={`px-2 py-1 rounded-full text-[8px] font-black uppercase transition-all ${dashboardPeriod === 'day' ? 'bg-primary text-white' : 'text-gray-400'}`}>Dia</button>
                                <button onClick={() => setDashboardPeriod('month')} className={`px-2 py-1 rounded-full text-[8px] font-black uppercase transition-all ${dashboardPeriod === 'month' ? 'bg-primary text-white' : 'text-gray-400'}`}>Mês</button>
                            </div>
                            <div className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full font-black text-[9px] uppercase text-gray-600 dark:text-gray-300">
                                {dashboardPeriod === 'month' 
                                    ? dashboardDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()
                                    : selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                            </div>
                        </div>
                        <button onClick={() => setShowDashboardRevenue(!showDashboardRevenue)} className="text-gray-400 hover:text-primary transition-colors p-1">{showDashboardRevenue ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button>
                    </div>
                    <div className="grid grid-cols-4 gap-1 divide-x divide-gray-100 pt-1 text-center">
                        <div className="px-1 flex flex-col justify-between">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1 truncate">
                            Faturamento
                          </p>
                          <p className="font-black text-[10px] sm:text-[11px] text-gray-800 dark:text-white truncate">
                            {showDashboardRevenue 
                              ? `R$ ${totalFaturamento.toLocaleString('pt-BR')}` 
                              : 'R$ ---'}
                          </p>
                        </div>
                        <div className="px-1 flex flex-col justify-between">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1 truncate">
                            Pendente
                          </p>
                          <p className="font-black text-[10px] sm:text-[11px] text-orange-500 truncate">
                            {showDashboardRevenue 
                              ? `R$ ${totalPending.toLocaleString('pt-BR')}` 
                              : 'R$ ---'}
                          </p>
                        </div>
                        <div className="px-1 flex flex-col justify-between">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1 truncate">
                            Despesas
                          </p>
                          <p className="font-black text-[10px] sm:text-[11px] text-red-500 truncate">
                            {showDashboardRevenue 
                              ? `R$ ${totalExpenses.toLocaleString('pt-BR')}` 
                              : 'R$ ---'}
                          </p>
                        </div>
                        <div className="px-1 flex flex-col justify-between">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1 truncate">
                            Líquido
                          </p>
                          <p className={`font-black text-[10px] sm:text-[11px] truncate ${totalLiquid >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {showDashboardRevenue 
                              ? `R$ ${totalLiquid.toLocaleString('pt-BR')}` 
                              : 'R$ ---'}
                          </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 mb-4">
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner">
                <button 
                  onClick={() => setEventFilter('cursos')} 
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${eventFilter === 'cursos' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Cursos
                </button>
                <button 
                  onClick={() => setEventFilter('palestras')} 
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${eventFilter === 'palestras' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Palestras
                </button>
              </div>
            </div>
            <UnifiedSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
              allEvents={allEvents} 
              courseTypes={courseTypes} 
              onResultClick={(e) => { 
                if (e.date) {
                  setSelectedDate(new Date(e.date)); 
                  
                  const isPal = (e.palestraType || e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
                  setEventFilter(isPal ? 'palestras' : 'cursos');

                  setHighlightEventId(null);
                  setTimeout(() => {
                    setHighlightEventId(e.id);
                  }, 0);

                  setTimeout(() => setHighlightEventId(null), 5000);
                }
                setSearchTerm(''); 
              }} 
            />
            <EventList 
              date={selectedDate} 
              events={allEvents.filter(e => { 
                if (!e.date) return false; 
                const eDate = new Date(e.date);
                eDate.setHours(0,0,0,0);
                const sDate = new Date(selectedDate);
                sDate.setHours(0,0,0,0);

                const dStr = String(e.duration || '').toLowerCase();
                let durationNum = 1;
                if (dStr.includes('dia')) {
                  durationNum = parseInt(dStr) || 1;
                }

                const eEnd = new Date(eDate);
                eEnd.setDate(eDate.getDate() + durationNum);

                const isWithinRange = sDate >= eDate && sDate < eEnd;
                if (!isWithinRange) return false;

                const isPal = (e.palestraType || e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
                return eventFilter === 'palestras' ? isPal : !isPal;
              }).sort((a, b) => {
                const overdueA = isEventOverdue(a, lectureModels);
                const overdueB = isEventOverdue(b, lectureModels);
                if (overdueA && !overdueB) return -1;
                if (!overdueA && overdueB) return 1;
                return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              })} 
              onDeleteEvent={(id) => setDeleteData({ isOpen: true, eventId: id })} 
              onAddPayment={(e) => { setSelectedEventForPayment(e); setIsPaymentModalOpen(true); }} 
              onEditEvent={(e) => { setEditingEvent(e); setPreSelectedModel( (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title)) ? 'Palestra' : 'Curso'); setIsAddEventOpen(true); }} 
              onShareEvent={(e) => setShareData({ isOpen: true, event: e })} 
              onToggleMaterial={handleToggleMaterial} 
              onToggleAbate={handleToggleAbate} 
              onQuickAddMaterial={handleQuickAddMaterial} 
              onUpdateMaterial={handleUpdateMaterial}
              onRemoveMaterial={handleRemoveMaterial} 
              onQuickInstallmentPaid={(e, inst) => {
                setSelectedEventForPayment(e);
                setSelectedInstallment(inst);
                setIsPaymentModalOpen(true);
              }}
              onDirectInstallmentPaid={handleDirectInstallmentPaid}
              onChangeInstallmentDate={handleChangeInstallmentDate}
              onShareFinancialSummary={handleShareFinancialSummary}
              onChargeEvent={(e) => setChargeData({ isOpen: true, event: e })}
              onAddDailyMaterial={handleAddDailyMaterial}
              onAddAllChecklistToEvent={handleAddAllChecklistToEvent}
              onEditDailyMaterial={handleEditDailyMaterial}
              onDeleteDailyMaterial={handleDeleteDailyMaterial}
              courseTypes={courseTypes} 
              lectureModels={lectureModels} 
              hideCount={false}
              allEvents={allEvents}
              highlightEventId={highlightEventId}
              filterMode={eventFilter}
            />
          </>
        );
      }
      case AppView.ALL_EVENTS: return <AllEventsList events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} onEventClick={(e) => { if(e.date) setSelectedDate(new Date(e.date)); setCurrentView(AppView.HOME); }} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.LECTURE_MODELS: return <LectureModelManager models={lectureModels} onAdd={(m) => api.put('v1/lecture_models/' + m.id, m).then(refreshData)} onRemove={(id) => api.delete('v1/lecture_models/' + id).then(refreshData)} onSaveOrder={handleSaveLectureOrder} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.STUDENTS: return <StudentsList students={students} onEdit={(s) => { setEditingStudent(s); setIsStudentModalOpen(true); }} onDelete={(id) => setDeleteStudentData({ isOpen: true, studentId: id })} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.HISTORY: return <HistoryScreen events={allEvents} courseTypes={courseTypes} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.FINANCIAL: return <FinancialScreen events={allEvents} annualGoal={annualGoal} onUpdateGoal={setAnnualGoal} expenses={expenses} courseTypes={courseTypes} lectureModels={lectureModels} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.ADD_EVENTS: return <CourseManager courseTypes={courseTypes} onAddCourse={(c) => api.put('v1/courses/' + c.id, c).then(refreshData)} onUpdateCourse={(c) => api.put('v1/courses/' + c.id, c).then(refreshData)} onRemoveCourse={(id) => api.delete('v1/courses/' + id).then(refreshData)} onSaveOrder={handleSaveCourseOrder} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.MATERIALS: return <MaterialsScreen courseTypes={courseTypes} onUpdateCourse={(c) => api.put('v1/courses/' + c.id, c).then(refreshData)} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.ANALYTICS: return <AnalyticsScreen events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.EXPENSES: return <ExpensesScreen expenses={expenses} events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      case AppView.COTACOES: return <CotacoesScreen api={api} generateId={generateId} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} targetCotacaoId={targetCotacaoId} onClearTargetCotacao={() => setTargetCotacaoId(null)} />;
      case AppView.SETTINGS: return <SettingsScreen isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} primaryColor={primaryColor} onUpdateColor={setPrimaryColor} instructorName={instructorName} onUpdateInstructorName={setInstructorName} onClearAllData={() => {}} currentUsername={credentials.user} onUpdateCredentials={handleUpdateCredentials} onClose={() => { setCurrentView(AppView.HOME); refreshData(); }} />;
      default: return null;
    }
  };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} loginError={loginError} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-dark transition-colors duration-200 font-sans">
      {isInitialLoading && <SplashScreen />}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors focus:outline-none"><MenuIcon className="w-6 h-6" /></button>
          <div className="flex items-center gap-2"><img src="https://i.postimg.cc/gJ2C9FMT/icon.png" alt="Logo" className="h-8 w-auto" /><h1 className="text-xl font-bold text-white tracking-wide">SelectClass</h1></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors relative"
            >
              <BellIcon className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-primary">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[105]" 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[110] animate-slide-up">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">Notificações</h3>
                    <button onClick={() => setIsNotificationsOpen(false)} className="text-gray-400 hover:text-primary transition-colors"><XIcon className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tudo em dia!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {notifications.map(evt => (
                          <button 
                            key={evt.id}
                            onClick={() => {
                              if (evt.date) {
                                setSelectedDate(new Date(evt.date));
                                setHighlightEventId(evt.id);
                                setCurrentView(AppView.HOME);
                                setIsNotificationsOpen(false);
                                
                                // Clear highlight after some time
                                setTimeout(() => setHighlightEventId(null), 5000);
                              }
                            }}
                            className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex gap-3 items-start"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                              <AlertCircleIcon className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate">{evt.student}</p>
                              <p className="text-[10px] font-bold text-red-500 uppercase mt-0.5">Pagamento Pendente</p>
                              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-medium">
                                {evt.title} • {evt.date ? new Date(evt.date).toLocaleDateString('pt-BR') : ''}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} currentView={currentView} onChangeView={setCurrentView} onLogout={handleLogout} />
      <main className="relative max-w-md mx-auto min-h-screen sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl pt-16">{renderContent()}</main>
      {currentView === AppView.HOME && !isAddEventOpen && !isTypeSelectionOpen && (
        <>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className={`fixed bottom-[74px] right-5 z-[100] w-10 h-10 bg-white dark:bg-surface-dark text-primary border border-gray-100 dark:border-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none ${showFab && currentDayEventsCount >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`} 
            title="Voltar ao Topo"
          > 
            <ChevronUpIcon className="w-6 h-6" /> 
          </button>
          <button 
            onClick={() => setIsTypeSelectionOpen(true)} 
            className={`fixed bottom-5 right-5 z-[100] w-10 h-10 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none ${showFab && currentDayEventsCount >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`} 
            title="Novo Agendamento" 
          > 
            <PlusIcon className="w-6 h-6" /> 
          </button>
        </>
      )}
      {isTypeSelectionOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setIsTypeSelectionOpen(false)}>
              <div className="bg-white dark:bg-surface-dark w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setIsTypeSelectionOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-gray-200 dark:border-gray-800 shadow-sm z-10" title="Fechar"><XIcon className="w-4 h-4" /></button>
                  <div className="flex flex-col items-center mb-6 pt-2"><h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter whitespace-nowrap">NOVO AGENDAMENTO</h3></div>
                  <div className="space-y-3">
                      <button onClick={() => { setPreSelectedModel('Curso'); setIsTypeSelectionOpen(false); setEditingEvent(null); setIsAddEventOpen(true); }} className="w-full flex items-center gap-3 py-2.5 px-4 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20 rounded-full border border-primary/10 dark:border-primary/20 transition-all group active:scale-[0.98]">
                          <div className="w-8 h-8 rounded-full bg-primary text-white shadow-md flex items-center justify-center"><GraduationCapIcon className="w-5 h-5" /></div>
                          <span className="text-xs font-black text-primary dark:text-blue-300 uppercase tracking-widest whitespace-nowrap">Agendar Curso</span>
                      </button>
                      <button onClick={() => { setPreSelectedModel('Palestra'); setIsTypeSelectionOpen(false); setEditingEvent(null); setIsAddEventOpen(true); }} className="w-full flex items-center gap-3 py-2.5 px-4 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 rounded-full border border-sky-100 dark:border-sky-500/20 transition-all group active:scale-[0.98]">
                          <div className="w-8 h-8 rounded-full bg-sky-500 text-white shadow-md flex items-center justify-center"><MicIcon className="w-5 h-5" /></div>
                          <span className="text-xs font-black text-sky-600 dark:text-sky-300 uppercase tracking-widest whitespace-nowrap">Agendar Palestra</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
      <AddEventModal isOpen={isAddEventOpen} onClose={() => { setIsAddEventOpen(false); setEditingEvent(null); }} onSave={handleSaveEvent} courseTypes={courseTypes} initialDate={selectedDate} initialEvent={editingEvent} forcedModel={preSelectedModel} lectureModels={lectureModels.map(m => m.name)} allEvents={allEvents} students={students} />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => { setIsPaymentModalOpen(false); setSelectedInstallment(undefined); }} 
        event={selectedEventForPayment} 
        initialInstallment={selectedInstallment}
        onDeletePayment={async (paymentId) => {
          if(!selectedEventForPayment) return;
          const currentPs = selectedEventForPayment.payments || [];
          const updatedPs = currentPs.filter(p => p.id !== paymentId);
          const isLec = (selectedEventForPayment.palestraType || selectedEventForPayment.title === 'Palestra' || selectedEventForPayment.title === 'Workshop' || lectureModels.some(m => m.name === selectedEventForPayment.title));
          const path = (isLec ? 'palestras_v1' : 'v1/appointments');
          
          const baseValue = selectedEventForPayment.value || 0;
          const totalValue = (isLec && selectedEventForPayment.palestraType === 'MEU') 
            ? baseValue * (selectedEventForPayment.studentCount || 1) 
            : baseValue;

          const updatedEv: CalendarEvent = {
            ...selectedEventForPayment,
            payments: updatedPs,
            paymentStatus: updatedPs.reduce((s,p)=>s+p.amount,0) >= totalValue ? 'paid' : 'pending'
          };
          await api.put(path + '/' + updatedEv.id, updatedEv);
          setSelectedEventForPayment(updatedEv); // Update local state for modal
          refreshData();
        }}
        onConfirmPayment={async (a,d,m,inst) => { 
        if(!selectedEventForPayment) return; 
        const currentPs = selectedEventForPayment.payments || []; 
        const newP = { id: Math.random().toString(), amount: a, date: d, method: m, installment: inst }; 
        const isLec = (selectedEventForPayment.palestraType || selectedEventForPayment.title === 'Palestra' || selectedEventForPayment.title === 'Workshop' || lectureModels.some(m => m.name === selectedEventForPayment.title)); 
        const path = (isLec ? 'palestras_v1' : 'v1/appointments'); 
        
        const baseValue = selectedEventForPayment.value || 0;
        const totalValue = (isLec && selectedEventForPayment.palestraType === 'MEU') 
          ? baseValue * (selectedEventForPayment.studentCount || 1) 
          : baseValue;

        const updatedEv: CalendarEvent = { 
          ...selectedEventForPayment, 
          payments: [...currentPs, newP], 
          paymentStatus: (currentPs.reduce((s,p)=>s+p.amount,0) + a) >= totalValue ? 'paid' : 'pending' 
        }; 
        await api.put(path + '/' + updatedEv.id, updatedEv); 
        refreshData();
         setIsPaymentModalOpen(false);
         setShareData({ isOpen: true, event: { ...updatedEv, date: new Date(updatedEv.date || new Date()) } as any, mode: 'payment' });
      }} />
      <ConfirmationModal isOpen={deleteData.isOpen} onClose={() => setDeleteData({isOpen: false, eventId: null})} onConfirm={executeDelete} title="Excluir Agendamento" message="" />
      
      {quickRemoveMaterialConfirm?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Remover Material</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Deseja remover o material <strong className="text-red-500">{quickRemoveMaterialConfirm.materialName}</strong> apenas neste agendamento ou em todos os agendamentos deste dia?
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => confirmQuickRemoveMaterial(false)}
                className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Somente Neste
              </button>
              <button 
                onClick={() => confirmQuickRemoveMaterial(true)}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
              >
                Remover de Todos
              </button>
              <button 
                onClick={() => setQuickRemoveMaterialConfirm(null)}
                className="w-full py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {quickAddMaterialConfirm?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Adicionar Material</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Deseja adicionar o material <strong className="text-primary">{quickAddMaterialConfirm.name}</strong> apenas neste agendamento ou em todos os agendamentos deste dia?
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => confirmQuickAddMaterial(true)}
                className="w-full py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-colors"
              >
                Adicionar em Todos
              </button>
              <button 
                onClick={() => confirmQuickAddMaterial(false)}
                className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Somente Neste
              </button>
              <button 
                onClick={() => setQuickAddMaterialConfirm(null)}
                className="w-full py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal isOpen={shareData.isOpen} onClose={() => setShareData({ isOpen: false, event: null, mode: 'schedule' })} event={shareData.event} courseTypes={courseTypes} mode={shareData.mode} />
      <ChargeModal isOpen={chargeData.isOpen} onClose={() => setChargeData({ isOpen: false, event: null })} event={chargeData.event} />
    </div>
  );
}

export default App;
