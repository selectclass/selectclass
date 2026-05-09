
import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { formatCurrencyInput, parseCurrency } from '../utils/currency';
import { DollarSignIcon, XIcon, TrashIcon, ChevronLeftIcon } from './Icons';
import { ConfirmationModal } from './ConfirmationModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onConfirmPayment: (amount: number, date: Date, method: string, installment?: number) => void;
  onDeletePayment: (paymentId: string) => void;
  initialInstallment?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, event, onConfirmPayment, onDeletePayment, initialInstallment }) => {
  const [amountStr, setAmountStr] = useState('');
  const [method, setMethod] = useState('Pix');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [installment, setInstallment] = useState<number | undefined>(initialInstallment);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setInstallment(initialInstallment);
      setAmountStr('');
      setMethod('Pix');
      setDateStr(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialInstallment]);

  if (!isOpen || !event) return null;

  // Calculate remaining
  const totalPaid = event.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalValue = event.value || 0;
  const remaining = Math.max(0, totalValue - totalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrency(amountStr);
    
    if (isNaN(amount) || amount <= 0) return;
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    onConfirmPayment(amount, date, method, installment);
    setAmountStr('');
    setMethod('Pix');
    setInstallment(undefined);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-6 relative max-h-[90vh] overflow-y-auto">
          
           {/* Close Button (X) - Premium Style */}
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-primary/10 text-gray-500 hover:text-primary dark:bg-white/10 dark:text-white hover:bg-primary/20 dark:hover:bg-white/20 transition-colors z-10"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
               <DollarSignIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Lançar Pagamento</h3>
                <p className="text-xs text-gray-500">
                  {event.student} - {event.title}
                  {initialInstallment && <span className="ml-1 text-primary font-bold">({initialInstallment}ª Parcela)</span>}
                </p>
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

          {/* List of existing payments */}
          {event.payments && event.payments.length > 0 && (
            <div className="mb-6">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Pagamentos Realizados
              </label>
              <div className="space-y-2">
                {event.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-[11px]">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 dark:text-white">
                        R$ {p.amount.toFixed(2).replace('.', ',')} - {p.method}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        {new Date(p.date).toLocaleDateString('pt-BR')} {p.installment ? `(${p.installment}ª Parcela)` : ''}
                      </span>
                    </div>
                    <button 
                      onClick={() => setPaymentToDelete(p.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remover pagamento"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Valor Pago (R$)
                  </label>
                  <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">R$</span>
                      <input 
                        type="text"
                        inputMode="numeric"
                        required
                        autoFocus
                        value={amountStr}
                        onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
                        placeholder={`${remaining.toFixed(2).replace('.', ',')}`}
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
                  Parcela
                </label>
                <select 
                  value={installment || ''}
                  onChange={(e) => setInstallment(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none text-sm font-bold"
                >
                  <option value="">Nenhuma</option>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}ª Parcela</option>
                  ))}
                </select>
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

      <ConfirmationModal 
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={() => {
          if (paymentToDelete) {
            onDeletePayment(paymentToDelete);
            setPaymentToDelete(null);
          }
        }}
        title="Excluir Pagamento?"
        message=""
        confirmLabel="SIM"
        cancelLabel="NÃO"
      />
    </>
  );
};
