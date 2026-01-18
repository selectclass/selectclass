
export enum AppView {
  HOME = 'HOME',
  FINANCIAL = 'FINANCIAL',
  ADD_EVENTS = 'ADD_EVENTS',
  SETTINGS = 'SETTINGS',
  STUDENTS = 'STUDENTS',
  MATERIALS = 'MATERIALS',
  ANALYTICS = 'ANALYTICS',
  EXPENSES = 'EXPENSES',
  HISTORY = 'HISTORY' // New View
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
  cost?: number; // Added cost field
  expenseId?: string; // Link to the auto-generated expense
}

export interface MaterialDef {
  name: string;
  // Cost removed from definition, it is now dynamic per event
}

export interface CourseType {
  id: string;
  name: string;
  model?: string;
  defaultValue?: number;
  defaultTime?: string;
  defaultDuration?: string;
  defaultMaterials?: MaterialDef[]; // Changed from string[] to object array
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: Date;
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
  eventLocation?: string; // New Field: Manual Event Location
  value?: number;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending';
  paymentDueDate?: Date;
  payments?: PaymentRecord[];
  date?: Date; 
  materials?: MaterialItem[]; 
}

export interface DayData {
  date: Date;
  events: CalendarEvent[];
}
