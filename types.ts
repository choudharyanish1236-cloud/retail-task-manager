
export interface Product {
  id: string;
  name: string;
  hsn: string;
  stock: number;
  rate: number;
  lowStockThreshold: number;
  category: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  hsn: string;
  quantity: number;
  rate: number;
  discount: number;
  sgst: number;
  cgst: number;
  total: number;
}

export interface ReminderHistory {
  id: string;
  date: string;
  message: string;
  method: 'IN_APP' | 'WHATSAPP';
}

export interface Invoice {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: InvoiceItem[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  isPaid: boolean;
  dueDate?: string;
  reminders?: ReminderHistory[];
}

export interface Dealer {
  id: string;
  name: string;
  phone: string;
  totalBilled: number;
  amountPaid: number;
  pendingAmount: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'CASH' | 'ONLINE';
  direction: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  referenceId?: string;
}

export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  BILLING = 'BILLING',
  QUOTATION = 'QUOTATION',
  STOCK = 'STOCK',
  CUSTOMERS = 'CUSTOMERS',
  DEALERS = 'DEALERS',
  TRANSACTIONS = 'TRANSACTIONS'
}
