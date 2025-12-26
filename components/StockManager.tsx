
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { parseVoiceCommand } from '../services/geminiService';

interface StockManagerProps {
  products: Product[];
  onUpdateStock: (productName: string, quantity: number, action: 'ADD_STOCK' | 'REDUCE_STOCK') => void;
  onUpdateProduct: (product: Product) => void;
}

const StockManager: React.FC<StockManagerProps> = ({ products, onUpdateStock, onUpdateProduct }) => {
  const [isListening, setIsListening] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    productName: string;
    quantity: number;
    action: 'ADD_STOCK' | 'REDUCE_STOCK';
    originalTranscript: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setIsListening(true);
      setPendingAction(null);
    };
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      const parsed = await parseVoiceCommand(transcript);
      if (parsed && (parsed.action === 'ADD_STOCK' || parsed.action === 'REDUCE_STOCK')) {
        setPendingAction({
          productName: parsed.productName,
          quantity: parsed.quantity,
          action: parsed.action,
          originalTranscript: transcript
        });
      }
      setIsProcessing(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const confirmAction = () => {
    if (pendingAction) {
      onUpdateStock(pendingAction.productName, pendingAction.quantity, pendingAction.action);
      setPendingAction(null);
    }
  };

  const handleThresholdChange = (product: Product, value: number) => {
    onUpdateProduct({ ...product, lowStockThreshold: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center shadow-xl">
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl font-bold mb-2">Voice Inventory Control</h2>
          <p className="opacity-90">"Add 50 packs of digestive biscuits" or "Reduce 2 crates of soda"</p>
        </div>
        <button 
          onClick={startListening}
          disabled={isProcessing}
          className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all shadow-lg ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white text-blue-700 hover:scale-105'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          ) : isListening ? (
             <div className="flex gap-1 items-center">
               <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
             </div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          )}
          {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Record Voice Action'}
        </button>
      </div>

      {pendingAction && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-4 md:mb-0">
            <h4 className="text-blue-900 font-bold text-lg">Confirm Voice Entry</h4>
            <p className="text-blue-700 italic text-sm mb-2">Heard: "{pendingAction.originalTranscript}"</p>
            <div className="flex items-center gap-4">
               <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${pendingAction.action === 'ADD_STOCK' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                 {pendingAction.action.replace('_', ' ')}
               </span>
               <span className="text-slate-800 font-bold">{pendingAction.quantity} units of {pendingAction.productName}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPendingAction(null)} className="px-6 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-white transition-colors">Discard</button>
            <button onClick={confirmAction} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">Confirm Update</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Inventory List</h3>
          <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-900">+ Add New Product</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Low Threshold</th>
                <th className="p-4">Rate</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className={`border-b transition-colors ${p.stock <= p.lowStockThreshold ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">HSN: {p.hsn}</div>
                  </td>
                  <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">{p.category}</span></td>
                  <td className="p-4 font-mono font-bold text-lg">{p.stock}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      className="w-20 border border-slate-200 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={p.lowStockThreshold}
                      onChange={(e) => handleThresholdChange(p, Number(e.target.value))}
                    />
                  </td>
                  <td className="p-4">₹{p.rate}</td>
                  <td className="p-4 text-right">
                    {p.stock <= p.lowStockThreshold ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-red-200 shadow-sm">Low Stock</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-200">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManager;
