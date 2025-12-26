
import React, { useState } from 'react';
import { Invoice, ReminderHistory } from '../types';

interface CustomersProps {
  invoices: Invoice[];
  onUpdateInvoice: (invoice: Invoice) => void;
}

const Customers: React.FC<CustomersProps> = ({ invoices, onUpdateInvoice }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [reminderMsg, setReminderMsg] = useState('');

  const pendingInvoices = invoices.filter(inv => !inv.isPaid);

  const sendReminder = (method: 'IN_APP' | 'WHATSAPP') => {
    if (!selectedInvoice) return;

    const newReminder: ReminderHistory = {
      id: `REM-${Date.now()}`,
      date: new Date().toISOString(),
      message: reminderMsg || `Hi ${selectedInvoice.customerName}, a friendly reminder that your payment of ₹${selectedInvoice.grandTotal} is due.`,
      method
    };

    const updatedInvoice = {
      ...selectedInvoice,
      reminders: [...(selectedInvoice.reminders || []), newReminder]
    };

    onUpdateInvoice(updatedInvoice);
    setSelectedInvoice(null);
    setReminderMsg('');

    if (method === 'WHATSAPP') {
        const text = encodeURIComponent(newReminder.message);
        window.open(`https://wa.me/${selectedInvoice.customerPhone}?text=${text}`, '_blank');
    } else {
        alert("In-app notification sent to customer portal.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pending Payments</h2>
          <p className="text-slate-500">Manage customers who haven't cleared their dues.</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold border border-orange-200">
           Total Outstanding: ₹{pendingInvoices.reduce((sum, i) => sum + i.grandTotal, 0).toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Last Reminded</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvoices.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400">All payments cleared! Great job.</td></tr>
              ) : (
                pendingInvoices.map(inv => {
                  const lastRem = inv.reminders && inv.reminders.length > 0 
                    ? new Date(inv.reminders[inv.reminders.length - 1].date).toLocaleDateString()
                    : 'Never';
                  
                  const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date();

                  return (
                    <tr key={inv.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{inv.customerName}</td>
                      <td className="p-4 text-slate-600">{inv.customerPhone || 'N/A'}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">₹{inv.grandTotal.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`${isOverdue ? 'text-red-600 font-bold animate-pulse' : 'text-slate-600'}`}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'Set Due Date'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500">{lastRem}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                          Remind
                        </button>
                        <button 
                          onClick={() => onUpdateInvoice({...inv, isPaid: true})}
                          className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-bold hover:bg-emerald-100 transition-colors"
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b">
               <h3 className="font-bold text-xl">Send Payment Reminder</h3>
               <p className="text-slate-500 text-sm">To: {selectedInvoice.customerName} ({selectedInvoice.customerPhone})</p>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Message</label>
                 <textarea 
                  className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4}
                  placeholder="Type a custom message..."
                  value={reminderMsg}
                  onChange={(e) => setReminderMsg(e.target.value)}
                 />
                 <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Auto-generated template used if empty</p>
               </div>
               
               {selectedInvoice.reminders && selectedInvoice.reminders.length > 0 && (
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">History</p>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                       {selectedInvoice.reminders.map(r => (
                         <div key={r.id} className="text-[11px] flex justify-between text-slate-600">
                           <span>{new Date(r.date).toLocaleString()}</span>
                           <span className="font-bold">{r.method}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
            <div className="p-6 bg-slate-50 rounded-b-2xl flex gap-2">
               <button onClick={() => setSelectedInvoice(null)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
               <button onClick={() => sendReminder('WHATSAPP')} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                 WhatsApp
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
