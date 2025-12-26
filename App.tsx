
import React, { useState, useEffect } from 'react';
import { AppSection, Product, Invoice, Transaction, Dealer } from './types';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import StockManager from './components/StockManager';
import Customers from './components/Customers';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load initial mock data
  useEffect(() => {
    const savedProducts = localStorage.getItem('rp_products');
    const savedInvoices = localStorage.getItem('rp_invoices');
    const savedTransactions = localStorage.getItem('rp_transactions');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else {
      const mockProducts: Product[] = [
        { id: '1', name: 'Britannia Biscuits', hsn: '1905', stock: 15, rate: 20, lowStockThreshold: 20, category: 'FMCG' },
        { id: '2', name: 'Amul Milk 500ml', hsn: '0401', stock: 120, rate: 27, lowStockThreshold: 30, category: 'Dairy' },
        { id: '3', name: 'Tata Salt 1kg', hsn: '2501', stock: 8, rate: 25, lowStockThreshold: 15, category: 'Groceries' },
      ];
      setProducts(mockProducts);
      localStorage.setItem('rp_products', JSON.stringify(mockProducts));
    }

    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    else {
        // Sample pending invoice for demonstration
        const mockInvoice: Invoice = {
            id: 'INV-1001',
            customerName: 'Rahul Sharma',
            customerPhone: '9876543210',
            date: new Date().toISOString(),
            dueDate: new Date(Date.now() - 86400000).toISOString(), // Overdue
            items: [],
            subTotal: 500,
            taxTotal: 90,
            grandTotal: 590,
            isPaid: false,
            reminders: []
        };
        setInvoices([mockInvoice]);
        localStorage.setItem('rp_invoices', JSON.stringify([mockInvoice]));
    }
    
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updated = invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
    setInvoices(updated);
    localStorage.setItem('rp_invoices', JSON.stringify(updated));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updated);
    localStorage.setItem('rp_products', JSON.stringify(updated));
  };

  const handleUpdateStock = (productName: string, quantity: number, action: 'ADD_STOCK' | 'REDUCE_STOCK') => {
    const updated = products.map(p => {
        if (p.name.toLowerCase().includes(productName.toLowerCase()) || productName.toLowerCase().includes(p.name.toLowerCase())) {
            const newStock = action === 'ADD_STOCK' ? p.stock + quantity : Math.max(0, p.stock - quantity);
            return { ...p, stock: newStock };
        }
        return p;
    });
    setProducts(updated);
    localStorage.setItem('rp_products', JSON.stringify(updated));
    alert(`Successfully ${action === 'ADD_STOCK' ? 'added' : 'reduced'} ${quantity} units for ${productName}`);
  };

  const handleAddInvoice = (invoice: Invoice) => {
    // If not paid and no due date set, set a default due date 7 days from now
    if (!invoice.isPaid && !invoice.dueDate) {
        invoice.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    const updatedInvoices = [invoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('rp_invoices', JSON.stringify(updatedInvoices));

    // Update stock
    const updatedProducts = products.map(p => {
      const item = invoice.items.find(i => i.productId === p.id);
      if (item) return { ...p, stock: p.stock - item.quantity };
      return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('rp_products', JSON.stringify(updatedProducts));

    // Add transaction if paid
    if (invoice.isPaid) {
        const newTx: Transaction = {
          id: `TX-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'CASH',
          direction: 'INCOME',
          amount: invoice.grandTotal,
          description: `Invoice ${invoice.id}`,
          referenceId: invoice.id
        };
        const updatedTxs = [newTx, ...transactions];
        setTransactions(updatedTxs);
        localStorage.setItem('rp_transactions', JSON.stringify(updatedTxs));
    }

    setActiveSection(AppSection.DASHBOARD);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 w-64 fixed inset-y-0 z-50 transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner shadow-blue-400">RP</div>
          <span className="text-xl font-bold tracking-tight">RetailPro</span>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          <NavItem icon="🏠" label="Dashboard" active={activeSection === AppSection.DASHBOARD} onClick={() => setActiveSection(AppSection.DASHBOARD)} />
          <NavItem icon="🧾" label="Billing" active={activeSection === AppSection.BILLING} onClick={() => setActiveSection(AppSection.BILLING)} />
          <NavItem icon="📋" label="Quotation" active={activeSection === AppSection.QUOTATION} onClick={() => setActiveSection(AppSection.QUOTATION)} />
          <NavItem icon="📦" label="Inventory" active={activeSection === AppSection.STOCK} onClick={() => setActiveSection(AppSection.STOCK)} />
          <NavItem icon="👥" label="Customers" active={activeSection === AppSection.CUSTOMERS} onClick={() => setActiveSection(AppSection.CUSTOMERS)} />
          <NavItem icon="🚛" label="Dealers" active={activeSection === AppSection.DEALERS} onClick={() => setActiveSection(AppSection.DEALERS)} />
          <NavItem icon="💸" label="Transactions" active={activeSection === AppSection.TRANSACTIONS} onClick={() => setActiveSection(AppSection.TRANSACTIONS)} />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] font-bold text-blue-400">GS</div>
             <div className="text-xs">
               <p className="font-bold text-white">Ganesh Store</p>
               <p className="opacity-50">Premium Plan</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex justify-between items-center lg:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
          <span className="font-bold">RetailPro</span>
          <div className="w-8"></div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeSection === AppSection.DASHBOARD && <Dashboard invoices={invoices} products={products} transactions={transactions} />}
          
          {(activeSection === AppSection.BILLING || activeSection === AppSection.QUOTATION) && (
            <Billing 
              products={products} 
              onAddInvoice={handleAddInvoice} 
              isQuotation={activeSection === AppSection.QUOTATION} 
            />
          )}

          {activeSection === AppSection.STOCK && (
            <StockManager 
              products={products} 
              onUpdateStock={handleUpdateStock} 
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {activeSection === AppSection.CUSTOMERS && (
            <Customers 
                invoices={invoices}
                onUpdateInvoice={handleUpdateInvoice}
            />
          )}

          {(activeSection === AppSection.DEALERS || activeSection === AppSection.TRANSACTIONS) && (
            <div className="bg-white p-20 text-center rounded-2xl border border-dashed border-slate-300">
              <h2 className="text-2xl font-bold text-slate-400">Section Under Development</h2>
              <p className="text-slate-400 mt-2">Check back soon for Dealers, and advanced Transaction tracking!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 scale-[1.02]' : 'hover:bg-slate-800'}`}
  >
    <span className="text-xl">{icon}</span>
    {label}
  </button>
);

export default App;
