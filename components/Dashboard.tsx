
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { Invoice, Product, Transaction } from '../types';

interface DashboardProps {
  invoices: Invoice[];
  products: Product[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, products, transactions }) => {
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const pendingCollection = invoices.filter(inv => !inv.isPaid).reduce((sum, inv) => sum + inv.grandTotal, 0);
  const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold);
  const lowStockCount = lowStockItems.length;

  const salesData = invoices.slice(-7).map(inv => ({
    name: new Date(inv.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: inv.grandTotal
  }));

  const stockLevelData = products.slice(0, 10).map(p => ({
    name: p.name,
    stock: p.stock,
    min: p.lowStockThreshold
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={`₹${totalSales.toLocaleString()}`} color="blue" />
        <StatCard title="Pending Payments" value={`₹${pendingCollection.toLocaleString()}`} color="orange" />
        <StatCard title="Low Stock Items" value={lowStockCount} color="red" />
        <StatCard title="Total Transactions" value={transactions.length} color="emerald" />
      </div>

      {lowStockCount > 0 && (
        <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 text-red-600 mb-4 font-bold uppercase tracking-tight text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Critical Stock Alerts
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                  <div className="text-xs text-red-600 font-medium">Only {item.stock} left</div>
                </div>
                <div className="text-[10px] font-bold text-red-400 bg-white px-2 py-1 rounded-full shadow-sm ring-1 ring-red-100">
                  Min: {item.lowStockThreshold}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Inventory Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
    emerald: 'text-emerald-600 bg-emerald-50'
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <div className={`mt-2 text-2xl font-bold ${colors[color].split(' ')[0]}`}>{value}</div>
    </div>
  );
};

export default Dashboard;
