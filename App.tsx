import React, { useState, useEffect, useCallback } from 'react';
import { AppView, CalendarEvent, CourseType, Student, Expense, MaterialItem, LectureModel } from './types';
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
import { AllEventsList } from './components/AllEventsList';
import { StudentModal } from './components/StudentModal';
import { LoginScreen } from './components/LoginScreen'; 
import { UnifiedSearch } from './components/UnifiedSearch';
import { LectureModelManager } from './components/LectureModelManager';
import { MenuIcon, PlusIcon, MoonIcon, SunIcon, EyeIcon, EyeOffIcon, CalendarIcon, AlertCircleIcon, XIcon, BoxIcon, MicIcon, GraduationCapIcon, SearchIcon } from './components/Icons';

const FIREBASE_URL = "https://selectclass-dd1d0-default-rtdb.firebaseio.com/";
const DEFAULT_CREDENTIALS = { user: 'danieledias', pass: '@Dn201974' };

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

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

  const [students, setStudents] = useState<Student[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
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
    const [eventsData, coursesData, studentsData, expensesData, palestrasData, lectureModelsData] = await Promise.all([
        api.get('v1/appointments'),
        api.get('v1/courses'),
        api.get('v1/students'),
        api.get('v1/expenses'),
        api.get('palestras_v1'),
        api.get('v1/lecture_models')
    ]);
    const normalizeEvents = (data: any) => data ? Object.values(data).map((e: any) => ({ ...e, date: e.date ? new Date(e.date) : undefined, payments: e.payments ? e.payments.map((p: any) => ({...p, date: new Date(p.date)})) : [] })) : [];
    
    const coursesArr = coursesData ? Object.values(coursesData) as CourseType[] : [];
    const lecturesArr = lectureModelsData ? Object.values(lectureModelsData) as LectureModel[] : [];

    setAllEvents([...normalizeEvents(eventsData), ...normalizeEvents(palestrasData)]);
    setCourseTypes(coursesArr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    setLectureModels(lecturesArr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    setStudents(studentsData ? Object.values(studentsData).map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })) : []);
    setExpenses(expensesData ? Object.values(expensesData).map((e: any) => ({ ...e, date: new Date(e.date) })) : []);
    
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
  const [deleteStudentData, setDeleteStudentData] = useState<{ isOpen: boolean, studentId: string | null }>({ isOpen: false, studentId: null });
  const [shareData, setShareData] = useState<{ isOpen: boolean, event: CalendarEvent | null }>({ isOpen: false, event: null });
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardDate, setDashboardDate] = useState(new Date());
  const [showDashboardRevenue, setShowDashboardRevenue] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'cursos' | 'palestras'>('cursos');
  const [searchTerm, setSearchTerm] = useState('');

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

    if (!isNew && editingEvent) {
      const wasLec = editingEvent.title === 'Palestra' || editingEvent.title === 'Workshop' || lectureModels.some(m => m.name === editingEvent.title);
      if (wasLec !== isLecNow) await api.delete(`${wasLec ? 'palestras_v1' : 'v1/appointments'}/${editingEvent.id}`);
    }

    const saveObj = { 
      ...editingEvent, 
      ...eventData, 
      id: uniqueId, 
      date: date.toISOString(),
      payments: eventData.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) || []
    };
    
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
    const newMaterial: MaterialItem = { id: generateId(), name, checked: isLec ? !!event.abateExpenses : false, cost };
    const updatedMaterials = [...(event.materials || []), newMaterial];
    const path = isLec ? 'palestras_v1' : 'v1/appointments';
    await api.put(`${path}/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    refreshData();
  };

  const handleRemoveMaterial = async (eventId: string, materialId: string) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event || !event.materials) return;
    const updatedMaterials = event.materials.filter(m => m.id !== materialId);
    const path = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title)) ? 'palestras_v1' : 'v1/appointments';
    await api.put(`${path}/${eventId}`, { ...event, materials: updatedMaterials, date: event.date?.toISOString(), payments: event.payments?.map(p => ({...p, date: p.date instanceof Date ? p.date.toISOString() : p.date })) });
    refreshData();
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
        // Lógica de filtro para o card de resumo
        const dashboardFilteredEvents = allEvents.filter(e => {
            if (!e.date) return false;
            const d = new Date(e.date);
            const isSameMonth = d.getMonth() === dashboardDate.getMonth() && d.getFullYear() === dashboardDate.getFullYear();
            if (!isSameMonth) return false;
            const isPal = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
            return dashboardTab === 'palestras' ? isPal : !isPal;
        });

        const totalValue = dashboardFilteredEvents.reduce((a, c) => a + (c.value || 0), 0);
        const totalPending = dashboardFilteredEvents.reduce((acc, event) => {
            const courseValue = event.value || 0;
            const paymentsReceived = event.payments?.reduce((s, p) => s + p.amount, 0) || 0;
            const pending = Math.max(0, courseValue - paymentsReceived);
            return acc + pending;
        }, 0);

        // Ajuste no cálculo do Líquido para refletir o lucro real (Faturamento - Gastos abatidos)
        const totalLiquid = dashboardFilteredEvents.reduce((acc, event) => {
            const isPal = (event.title === 'Palestra' || event.title === 'Workshop' || lectureModels.some(m => m.name === event.title));
            const courseValue = event.value || 0;
            const totalMaterialCost = (event.materials || []).filter(m => m.checked).reduce((s, m) => s + (parseCurrency(m.cost) || 0), 0);
            
            let eventNet = 0;
            if (isPal) {
                // Para palestras, só abate se 'abateExpenses' estiver marcado
                eventNet = event.abateExpenses ? (courseValue - totalMaterialCost) : courseValue;
            } else {
                // Para cursos, sempre abate o custo de materiais do líquido projetado
                eventNet = courseValue - totalMaterialCost;
            }
            return acc + eventNet;
        }, 0);

        return (
          <>
            <div className="px-5 pt-6 pb-2 space-y-3">
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2"><span className="text-gray-500 font-bold uppercase text-xs">Instrutora:</span> {instructorName}</p>
                <button onClick={() => setIsTypeSelectionOpen(true)} className="w-full bg-primary text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-3 group active:scale-95 transition-all">
                    <div className="bg-white/20 p-1.5 rounded-full"><PlusIcon className="w-5 h-5 text-white" /></div>
                    <span className="text-xs font-black tracking-widest uppercase">NOVO AGENDAMENTO</span>
                </button>
                <button onClick={() => setCurrentView(AppView.ALL_EVENTS)} className="w-full bg-gray-100 dark:bg-white/5 text-primary p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <div className="p-1.5 rounded-full bg-primary/5 dark:bg-primary/10"><SearchIcon className="w-4 h-4 text-primary" /></div>
                    <span className="text-xs font-black tracking-widest uppercase">VER TODOS OS AGENDAMENTOS</span>
                </button>
            </div>
            <Calendar 
              selectedDate={selectedDate} 
              onSelectDate={(date) => {
                setSelectedDate(date);
                // Busca eventos neste dia específico para mudar a aba automaticamente
                const eventsOnDay = allEvents.filter(e => {
                  if (!e.date) return false;
                  const eDate = new Date(e.date);
                  const isMainDay = eDate.toDateString() === date.toDateString();
                  if (isMainDay) return true;
                  
                  // Verifica se é o segundo dia de um evento de 2 dias
                  if (e.duration && (e.duration.toLowerCase().includes('2 dia') || e.duration.toLowerCase().includes('2 day'))) {
                    const secondDay = new Date(eDate);
                    secondDay.setDate(eDate.getDate() + 1);
                    return secondDay.toDateString() === date.toDateString();
                  }
                  return false;
                });

                if (eventsOnDay.length > 0) {
                  const hasPalestra = eventsOnDay.some(e => 
                    e.title === 'Palestra' || 
                    e.title === 'Workshop' || 
                    lectureModels.some(m => m.name === e.title)
                  );
                  setDashboardTab(hasPalestra ? 'palestras' : 'cursos');
                }
              }} 
              onMonthChange={(newMonthDate) => setDashboardDate(newMonthDate)}
              events={allEvents} 
              courseTypes={courseTypes}
              lectureModels={lectureModels}
            />
            <div className="px-4 mb-2">
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50 dark:border-gray-800">
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner">
                            <button onClick={() => setDashboardTab('cursos')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${dashboardTab === 'cursos' ? 'bg-primary text-white' : 'text-gray-400'}`}>Cursos</button>
                            <button onClick={() => setDashboardTab('palestras')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${dashboardTab === 'palestras' ? 'bg-sky-500 text-white' : 'text-gray-400'}`}>Palestras</button>
                        </div>
                        <button onClick={() => setShowDashboardRevenue(!showDashboardRevenue)} className="text-gray-400 hover:text-primary transition-colors p-2">{showDashboardRevenue ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button>
                    </div>
                    <div className="flex justify-center mb-5"><div className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full font-black text-xs uppercase text-gray-600 dark:text-gray-300">{dashboardDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</div></div>
                    <div className="grid grid-cols-3 gap-2 divide-x divide-gray-100 pt-1 text-center">
                        <div><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Cachê/Faturamento</p><p className="font-black text-gray-800 dark:text-white text-sm">{showDashboardRevenue ? `R$ ${totalValue.toLocaleString('pt-BR')}` : 'R$ ---'}</p></div>
                        <div className="px-1"><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Pendente</p><p className="font-black text-red-500 text-sm">{showDashboardRevenue ? `R$ ${totalPending.toLocaleString('pt-BR')}` : 'R$ ---'}</p></div>
                        <div><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Líquido</p><p className="font-black text-emerald-500 text-sm">{showDashboardRevenue ? `R$ ${totalLiquid.toLocaleString('pt-BR')}` : 'R$ ---'}</p></div>
                    </div>
                </div>
            </div>
            <UnifiedSearch 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                activeTab={dashboardTab} 
                onTabChange={setDashboardTab} 
                allEvents={allEvents} 
                courseTypes={courseTypes} 
                onResultClick={(e) => { 
                    if(e.date) setSelectedDate(new Date(e.date)); 
                    const isPal = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
                    setDashboardTab(isPal ? 'palestras' : 'cursos');
                    setSearchTerm(''); 
                }} 
            />
            <EventList 
              date={selectedDate} 
              events={allEvents
                .filter(e => {
                  if (!e.date) return false;
                  const d = new Date(e.date);
                  const isSameMonth = d.getMonth() === dashboardDate.getMonth() && d.getFullYear() === dashboardDate.getFullYear();
                  const isPal = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title));
                  const matchesTab = dashboardTab === 'palestras' ? isPal : !isPal;
                  return isSameMonth && matchesTab;
                })
                .sort((a, b) => {
                  const da = a.date ? new Date(a.date).getTime() : 0;
                  const db = b.date ? new Date(b.date).getTime() : 0;
                  return da - db;
                })
              } 
              onDeleteEvent={(id) => setDeleteData({ isOpen: true, eventId: id })} 
              onAddPayment={(e) => { setSelectedEventForPayment(e); setIsPaymentModalOpen(true); }} 
              onEditEvent={(e) => { setEditingEvent(e); setPreSelectedModel( (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title)) ? 'Palestra' : 'Curso'); setIsAddEventOpen(true); }} 
              onShareEvent={(e) => setShareData({ isOpen: true, event: e })} 
              onToggleMaterial={handleToggleMaterial}
              onToggleAbate={handleToggleAbate}
              onQuickAddMaterial={handleQuickAddMaterial}
              onRemoveMaterial={handleRemoveMaterial}
              courseTypes={courseTypes} 
              lectureModels={lectureModels}
            />
          </>
        );
      }
      case AppView.ALL_EVENTS: return <AllEventsList events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} onEventClick={(e) => { if(e.date) setSelectedDate(new Date(e.date)); const isPal = (e.title === 'Palestra' || e.title === 'Workshop' || lectureModels.some(m => m.name === e.title)); setDashboardTab(isPal ? 'palestras' : 'cursos'); setCurrentView(AppView.HOME); }} />;
      case AppView.LECTURE_MODELS: return <LectureModelManager models={lectureModels} onAdd={(m) => api.put('v1/lecture_models/' + m.id, m).then(refreshData)} onRemove={(id) => api.delete('v1/lecture_models/' + id).then(refreshData)} onSaveOrder={handleSaveLectureOrder} />;
      case AppView.STUDENTS: return <StudentsList students={students} onEdit={(s) => { setEditingStudent(s); setIsStudentModalOpen(true); }} onDelete={(id) => setDeleteStudentData({ isOpen: true, studentId: id })} />;
      case AppView.HISTORY: return <HistoryScreen events={allEvents} courseTypes={courseTypes} />;
      case AppView.FINANCIAL: return <FinancialScreen events={allEvents} annualGoal={annualGoal} onUpdateGoal={setAnnualGoal} expenses={expenses} courseTypes={courseTypes} lectureModels={lectureModels} />;
      case AppView.ADD_EVENTS: return <CourseManager courseTypes={courseTypes} onAddCourse={(c) => api.put('v1/courses/' + c.id, c).then(refreshData)} onUpdateCourse={(c) => api.put('v1/courses/' + c.id, c).then(refreshData)} onRemoveCourse={(id) => api.delete('v1/courses/' + id).then(refreshData)} onSaveOrder={handleSaveCourseOrder} />;
      case AppView.MATERIALS: return <MaterialsScreen courseTypes={courseTypes} onUpdateCourse={(c) => api.put('v1/courses/' + c.id, c).then(refreshData)} />;
      case AppView.ANALYTICS: return <AnalyticsScreen events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} />;
      case AppView.EXPENSES: return <ExpensesScreen expenses={expenses} events={allEvents} courseTypes={courseTypes} lectureModels={lectureModels} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />;
      case AppView.SETTINGS: return <SettingsScreen isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} primaryColor={primaryColor} onUpdateColor={setPrimaryColor} instructorName={instructorName} onUpdateInstructorName={setInstructorName} onClearAllData={() => {}} currentUsername={credentials.user} onUpdateCredentials={handleUpdateCredentials} />;
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
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">{isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}</button>
      </header>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} currentView={currentView} onChangeView={setCurrentView} onLogout={handleLogout} />
      <main className="relative max-w-md mx-auto min-h-screen sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl pt-16">{renderContent()}</main>
      
      {currentView === AppView.HOME && !isAddEventOpen && !isTypeSelectionOpen && (
          <button 
            onClick={() => setIsTypeSelectionOpen(true)}
            className={`fixed bottom-5 right-5 z-[100] w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none
              ${showFab ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}
            title="Novo Agendamento"
          >
            <PlusIcon className="w-7 h-7" />
          </button>
      )}

      {isTypeSelectionOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-surface-dark w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col items-center mb-6 relative"><button onClick={() => setIsTypeSelectionOpen(false)} className="absolute -top-1 -right-1 text-gray-400 p-1"><XIcon className="w-5 h-5" /></button><h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter whitespace-nowrap">NOVO AGENDAMENTO</h3></div>
                  <div className="space-y-3">
                      <button onClick={() => { setPreSelectedModel('Curso'); setIsTypeSelectionOpen(false); setEditingEvent(null); setIsAddEventOpen(true); }} className="w-full flex items-center gap-3 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-primary/10 dark:hover:bg-primary/20 rounded-full border border-blue-100 dark:border-primary/20 transition-all group active:scale-[0.98]">
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
      <AddEventModal isOpen={isAddEventOpen} onClose={() => { setIsAddEventOpen(false); setEditingEvent(null); }} onSave={handleSaveEvent} courseTypes={courseTypes} initialDate={selectedDate} initialEvent={editingEvent} forcedModel={preSelectedModel} lectureModels={lectureModels.map(m => m.name)} allEvents={allEvents} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} event={selectedEventForPayment} onConfirmPayment={async (a,d,m) => { if(!selectedEventForPayment) return; const currentPs = selectedEventForPayment.payments || []; const newP = { id: Math.random().toString(), amount: a, date: d, method: m }; const isLec = (selectedEventForPayment.title === 'Palestra' || selectedEventForPayment.title === 'Workshop' || lectureModels.some(m => m.name === selectedEventForPayment.title)); const path = (isLec ? 'palestras_v1' : 'v1/appointments'); const updatedEv: CalendarEvent = { ...selectedEventForPayment, payments: [...currentPs, newP], paymentStatus: (currentPs.reduce((s,p)=>s+p.amount,0) + a) >= (selectedEventForPayment.value || 0) ? 'paid' : 'pending' }; await api.put(path + '/' + updatedEv.id, updatedEv); refreshData(); }} />
      <ConfirmationModal isOpen={deleteData.isOpen} onClose={() => setDeleteData({isOpen: false, eventId: null})} onConfirm={executeDelete} title="Excluir Agendamento" message="" />
      <ShareModal isOpen={shareData.isOpen} onClose={() => setShareData({ isOpen: false, event: null })} event={shareData.event} />
    </div>
  );
}

export default App;
