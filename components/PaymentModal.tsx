
import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { DollarSignIcon, XIcon } from './Icons';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onConfirmPayment: (amount: number, date: Date, method: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, event, onConfirmPayment }) => {
  const [amountStr, setAmountStr] = useState('');
  const [method, setMethod] = useState('Pix');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen || !event) return null;

  // Calculate remaining
  const totalPaid = event.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalValue = event.value || 0;
  const remaining = Math.max(0, totalValue - totalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    
    if (isNaN(amount) || amount <= 0) return;
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    onConfirmPayment(amount, date, method);
    setAmountStr('');
    setMethod('Pix');
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-6 relative">
          
           {/* Close Button (X) - Premium Style */}
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-blue-50 text-primary dark:bg-white/10 dark:text-white hover:bg-blue-100 dark:hover:bg-white/20 transition-colors z-10"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
               <DollarSignIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Lançar Pagamento</h3>
                <p className="text-xs text-gray-500">{event.student} - {event.title}</p>
            </div>
          </div>

          <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
             <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Valor Total:</span>
                <span className="font-semibold dark:text-gray-300">R$ {totalValue.toFixed(2).replace('.', ',')}</span>
             </div>
             <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Já Pago:</span>
                <span className="font-semibold text-green-600">R$ {totalPaid.toFixed(2).replace('.', ',')}</span>
             </div>
             <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <span className="font-bold text-gray-700 dark:text-gray-200">Restante:</span>
                <span className="font-bold text-red-500">R$ {remaining.toFixed(2).replace('.', ',')}</span>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Valor Pago (R$)
                  </label>
                  <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        autoFocus
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        placeholder={`${remaining.toFixed(2)}`}
                        className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Método
                  </label>
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none text-sm font-bold"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
              </div>
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Data do Pagamento
                </label>
                <input 
                  type="date"
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                />
            </div>

            <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-green-700 transition-all transform active:scale-95"
                >
                  Confirmar
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
