
export enum AppView {
  HOME = 'HOME',
  FINANCIAL = 'FINANCIAL',
  ADD_EVENTS = 'ADD_EVENTS',
  SETTINGS = 'SETTINGS',
  STUDENTS = 'STUDENTS',
  MATERIALS = 'MATERIALS',
  ANALYTICS = 'ANALYTICS',
  EXPENSES = 'EXPENSES',
  HISTORY = 'HISTORY',
  LECTURE_MODELS = 'LECTURE_MODELS',
  ALL_EVENTS = 'ALL_EVENTS'
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  checked: boolean;
  cost?: number;
  expenseId?: string;
}

export interface MaterialDef {
  name: string;
}

export interface CourseType {
  id: string;
  name: string;
  model?: string;
  defaultValue?: number;
  defaultTime?: string;
  defaultDuration?: string;
  defaultMaterials?: MaterialDef[];
  defaultLocation?: 'interno' | 'externo';
  order?: number;
}

export interface LectureModel {
  id: string;
  name: string;
  type: 'Palestra' | 'Workshop' | string;
  order?: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: Date;
  method?: string;
}

export interface Student {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'class' | 'meeting' | 'other';
  student?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  locationType?: 'interno' | 'externo';
  eventLocation?: string;
  value?: number;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending';
  paymentDueDate?: Date;
  paymentDeadlineDays?: number;
  payments?: PaymentRecord[];
  date?: Date; 
  materials?: MaterialItem[]; 
  abateExpenses?: boolean;
  paymentFrequency?: 'weekly' | 'biweekly';
  createdAt?: Date;
}

export interface DayData {
  date: Date;
  events: CalendarEvent[];
}
