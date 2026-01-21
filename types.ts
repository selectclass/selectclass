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
  city?: string;
  state?: string;
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
}

export interface DayData {
  date: Date;
  events: CalendarEvent[];
}