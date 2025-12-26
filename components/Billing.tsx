
import React, { useState, useEffect } from 'react';
import { Product, Invoice, InvoiceItem } from '../types';
import { getSmartSuggestions } from '../services/geminiService';

interface BillingProps {
  products: Product[];
  onAddInvoice: (invoice: Invoice) => void;
  isQuotation?: boolean;
}

const Billing: React.FC<BillingProps> = ({ products, onAddInvoice, isQuotation = false }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // New state for payment tracking
  const [isPaid, setIsPaid] = useState(true);
  const [dueDate, setDueDate] = useState('');

  const addItem = (product: Product | any) => {
    const newItem: InvoiceItem = {
      productId: product.id || 'new',
      name: product.name,
      hsn: product.hsn,
      quantity: 1,
      rate: product.rate || product.estimatedRate || 0,
      discount: 0,
      sgst: isQuotation ? 0 : 9,
      cgst: isQuotation ? 0 : 9,
      total: 0
    };
    calculateItemTotal(newItem);
    setItems([...items, newItem]);
    setSearch('');
    setSuggestions([]);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const base = item.quantity * item.rate;
    const discounted = base - (base * (item.discount / 100));
    const tax = discounted * ((item.sgst + item.cgst) / 100);
    item.total = discounted + tax;
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    calculateItemTotal(newItems[index]);
    setItems(newItems);
  };

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (val.length > 2) {
      setIsSearching(true);
      const res = await getSmartSuggestions(val);
      setSuggestions(res);
      setIsSearching(false);
    } else {
      setSuggestions([]);
    }
  };

  const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxTotal = grandTotal - subTotal;

  const handleSubmit = () => {
    if (!customerName || items.length === 0) return;
    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      customerName,
      customerPhone,
      date: new Date().toISOString(),
      items,
      subTotal,
      taxTotal,
      grandTotal,
      isPaid: isQuotation ? false : isPaid,
      dueDate: dueDate || undefined,
      reminders: []
    };
    onAddInvoice(invoice);
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setIsPaid(true);
    setDueDate('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <h2 className="text-xl font-bold text-slate-800 shrink-0">{isQuotation ? 'New Quotation' : 'Create Invoice'}</h2>
        <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full xl:w-auto">
          <input 
            type="text" 
            placeholder="Customer Name" 
            className="border p-2 rounded-lg text-sm flex-1 min-w-[150px]"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            className="border p-2 rounded-lg text-sm flex-1 min-w-[150px]"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
          />
          
          {!isQuotation && (
            <div className="flex items-center gap-2 px-3 border rounded-lg bg-slate-50 h-10">
              <span className="text-xs font-bold text-slate-500 uppercase">Paid</span>
              <button 
                onClick={() => setIsPaid(!isPaid)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${isPaid ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPaid ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          {!isPaid && !isQuotation && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Due Date</span>
              <input 
                type="date" 
                className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Search Products (AI Suggestions Enabled)</label>
          <input 
            type="text" 
            className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Type item name or HSN..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border mt-1 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => addItem(s)}
                  className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 flex justify-between"
                >
                  <span className="font-medium">{s.name} <span className="text-xs text-slate-400">({s.hsn})</span></span>
                  <span className="text-blue-600 font-bold">₹{s.estimatedRate || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 uppercase text-xs">
                <th className="p-3">Item Name</th>
                <th className="p-3">HSN</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Rate</th>
                <th className="p-3">Disc%</th>
                <th className="p-3">GST%</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-slate-500">{item.hsn}</td>
                  <td className="p-3">
                    <input type="number" className="w-16 border rounded p-1" value={item.quantity} onChange={e => handleUpdateItem(idx, 'quantity', Number(e.target.value))} />
                  </td>
                  <td className="p-3">
                    <input type="number" className="w-24 border rounded p-1" value={item.rate} onChange={e => handleUpdateItem(idx, 'rate', Number(e.target.value))} />
                  </td>
                  <td className="p-3">
                    <input type="number" className="w-16 border rounded p-1" value={item.discount} onChange={e => handleUpdateItem(idx, 'discount', Number(e.target.value))} />
                  </td>
                  <td className="p-3 text-slate-500">{(item.sgst + item.cgst).toFixed(1)}%</td>
                  <td className="p-3 text-right font-bold">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">No items added yet. Search above to add.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0">
             <button className="text-blue-600 hover:underline text-sm font-medium">+ Add Custom Field</button>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{subTotal.toLocaleString()}</span>
            </div>
            {!isQuotation && (
              <div className="flex justify-between text-slate-500">
                <span>Tax (GST)</span>
                <span>₹{taxTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleSubmit}
              className={`w-full text-white font-bold py-3 rounded-xl mt-4 shadow-lg transition-all active:scale-95 ${isPaid ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'}`}
            >
              Generate {isQuotation ? 'Quotation' : isPaid ? 'Invoice' : 'Pending Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
