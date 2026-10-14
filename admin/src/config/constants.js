import {
  BarChart3, Boxes, CalendarDays, ClipboardList, FileText, Inbox, LayoutDashboard, Package, Settings, ShieldCheck, ShoppingBag,
  Stethoscope, Tags, Users,
} from 'lucide-react';

export const ROLES = {
  SUPER: 'super_admin',
  AYURVEDA: 'ayurveda_admin',
  DENTAL: 'dental_admin',
};

export const ROLE_LABELS = {
  super_admin: 'Super admin',
  ayurveda_admin: 'Siddha admin',
  dental_admin: 'Dental admin',
};

/** Practice a role is limited to (null = all). */
export const ROLE_PRACTICE = { super_admin: null, ayurveda_admin: 'ayurveda', dental_admin: 'dental' };

export const PRACTICE_LABELS = { ayurveda: 'Siddha', dental: 'Dental' };
export const PRACTICE_OPTIONS = [
  { value: 'ayurveda', label: 'Siddha' },
  { value: 'dental', label: 'Dental' },
];

const ALL = [ROLES.SUPER, ROLES.AYURVEDA, ROLES.DENTAL];
const STORE = [ROLES.SUPER, ROLES.AYURVEDA];
const SUPER_ONLY = [ROLES.SUPER];

/**
 * UI-level module access. This only controls what is SHOWN — the Firestore/Storage
 * security rules enforce the same restrictions on the backend.
 */
export const MODULE_ACCESS = {
  dashboard: ALL,
  appointments: ALL,
  doctors: ALL,
  services: ALL,
  products: STORE,
  categories: STORE,
  inventory: STORE,
  orders: STORE,
  people: ALL,
  enquiries: ALL,
  content: ALL,
  reports: ALL,
  users: SUPER_ONLY,
  settings: SUPER_ONLY,
};

export const canAccess = (role, module) => Boolean(role && MODULE_ACCESS[module]?.includes(role));

export const NAV_GROUPS = [
  {
    items: [{ module: 'dashboard', label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Practice',
    items: [
      { module: 'appointments', label: 'Appointments', to: '/appointments', icon: CalendarDays },
      { module: 'doctors', label: 'Doctors', to: '/doctors', icon: Stethoscope },
      { module: 'services', label: 'Services / Treatments', to: '/services', icon: ClipboardList },
      { module: 'people', label: 'Customers / Patients', to: '/people', icon: Users },
      { module: 'enquiries', label: 'Enquiries', to: '/enquiries', icon: Inbox },
    ],
  },
  {
    title: 'Store',
    items: [
      { module: 'products', label: 'Products', to: '/products', icon: Package },
      { module: 'categories', label: 'Categories', to: '/categories', icon: Tags },
      { module: 'inventory', label: 'Inventory', to: '/inventory', icon: Boxes },
      { module: 'orders', label: 'Orders', to: '/orders', icon: ShoppingBag },
    ],
  },
  {
    title: 'Site',
    items: [
      { module: 'content', label: 'Website content', to: '/content', icon: FileText },
      { module: 'reports', label: 'Reports', to: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { module: 'users', label: 'Users / Roles', to: '/users', icon: ShieldCheck },
      { module: 'settings', label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
];

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
/** Allowed next statuses for each current status. */
export const APPOINTMENT_TRANSITIONS = {
  pending: ['confirmed', 'rescheduled', 'cancelled'],
  confirmed: ['completed', 'rescheduled', 'cancelled'],
  rescheduled: ['confirmed', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export const ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const PAYMENT_METHOD_LABELS = { cod: 'Cash on delivery', manual_transfer: 'UPI / bank transfer' };

export const REVENUE_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered'];

export const DEFAULT_SETTINGS = {
  contact: {
    phone: '+91 90000 00000',
    whatsapp: '+91 90000 00000',
    email: 'hello@example.com',
    address: 'Hospital address to be added',
    workingHours: 'Mon – Sat: 9:00 AM – 6:00 PM',
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1920.3434634993496!2d77.24737390410193!3d11.506699337689767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba921000e590461%3A0xab17af8357a938c1!2sSree%20Aadithya%20Siddha%20Medical%20and%20Dental%20Care%20Centre!5e0!3m2!1sen!2sin!4v1791982499148!5m2!1sen!2sin',
  },
  social: { instagram: '', facebook: '', youtube: '' },
  shipping: { enabled: true, flatFee: 60, freeAbove: 999 },
  lowStockThreshold: 5,
  appointments: { startTime: '09:30', endTime: '17:30', slotMinutes: 30, maxDaysAhead: 90 },
  disclaimer:
    'The information on this website is for general awareness only and is not a substitute for professional medical advice, diagnosis or treatment. Please consult a qualified doctor about your health.',
};

export const WEB_URL = (import.meta.env.VITE_WEB_URL || '').replace(/\/$/, '');
