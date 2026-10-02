// AdminPro Store - Data Management & Utilities
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  countryCode: string;
  password: string;
  role: 'admin' | 'user';
  company: string;
  createdAt: string;
  avatar?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  image: string;
  description: string;
  stockLevel: number;
  reorderPoint: number;
  location: string;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  supplierContact: string;
  status: 'available' | 'low' | 'out_of_stock';
  dateAdded: string;
  lastUpdated: string;
}

export interface Employee {
  id: string;
  empId: string;
  fullName: string;
  dob: string;
  contact: string;
  email: string;
  address: string;
  emergencyContact: string;
  jobTitle: string;
  department: string;
  dateOfJoining: string;
  workLocation: string;
  salary: number;
  attendance: { date: string; status: 'present' | 'absent' | 'leave' | 'half-day' }[];
  performance: { reviewDate: string; score: number; remarks: string }[];
  documents: { name: string; url: string }[];
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  openingBalance: number;
  currentBalance: number;
  currency: string;
  transactionId: string;
  transactionDate: string;
  voucherNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  partyId: string;
  partyName: string;
  costCenter: string;
  invoiceNumber: string;
  paymentMethod: string;
  createdBy: string;
  entryTime: string;
  reconciliationStatus: 'pending' | 'reconciled';
  reconciledDate: string;
  documents: string[];
}

export interface DataEntryForm {
  id: string;
  title: string;
  theme: string;
  fields: DataEntryField[];
  responses: Record<string, any>[];
  createdAt: string;
}

export interface DataEntryField {
  id: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarStyle: 'gradient' | 'solid' | 'glass';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animationEnabled: boolean;
  soundEnabled: boolean;
  volume: number;
}

const STORAGE_KEYS = {
  USERS: 'adminpro_users',
  CURRENT_USER: 'adminpro_current_user',
  PRODUCTS: 'adminpro_products',
  EMPLOYEES: 'adminpro_employees',
  LEDGER: 'adminpro_ledger',
  DATA_FORMS: 'adminpro_data_forms',
  THEME: 'adminpro_theme',
  SETTINGS: 'adminpro_settings',
};

export const store = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch { return defaultValue; }
  },
  set: (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getUsers: (): User[] => store.get(STORAGE_KEYS.USERS, []),
  setUsers: (users: User[]) => store.set(STORAGE_KEYS.USERS, users),
  getCurrentUser: (): User | null => store.get(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => store.set(STORAGE_KEYS.CURRENT_USER, user),
  getProducts: (): Product[] => store.get(STORAGE_KEYS.PRODUCTS, []),
  setProducts: (products: Product[]) => store.set(STORAGE_KEYS.PRODUCTS, products),
  getEmployees: (): Employee[] => store.get(STORAGE_KEYS.EMPLOYEES, []),
  setEmployees: (employees: Employee[]) => store.set(STORAGE_KEYS.EMPLOYEES, employees),
  getLedger: (): LedgerEntry[] => store.get(STORAGE_KEYS.LEDGER, []),
  setLedger: (entries: LedgerEntry[]) => store.set(STORAGE_KEYS.LEDGER, entries),
  getDataForms: (): DataEntryForm[] => store.get(STORAGE_KEYS.DATA_FORMS, []),
  setDataForms: (forms: DataEntryForm[]) => store.set(STORAGE_KEYS.DATA_FORMS, forms),
  getTheme: (): ThemeConfig => store.get(STORAGE_KEYS.THEME, {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    sidebarStyle: 'gradient',
    borderRadius: 'lg',
    animationEnabled: true,
    soundEnabled: true,
    volume: 50,
  }),
  setTheme: (theme: ThemeConfig) => store.set(STORAGE_KEYS.THEME, theme),
};

export const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
export const generateEmpId = (company: string) => {
  const prefix = company.substring(0, 3).toUpperCase();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${num}`;
};
export const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const formatCurrency = (amount: number, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};
