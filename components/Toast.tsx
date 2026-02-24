import React, { useEffect } from 'react';
import { CheckCircleIcon, AlertCircleIcon, TrashIcon } from './Icons';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000); // Auto dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    error: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
    info: <CheckCircleIcon className="w-5 h-5 text-blue-500" /> // Reusing check for info for simplicity or add InfoIcon
  };

  const bgColors = {
    success: 'bg-white dark:bg-surface-dark border-l-4 border-green-500',
    error: 'bg-white dark:bg-surface-dark border-l-4 border-red-500',
    info: 'bg-white dark:bg-surface-dark border-l-4 border-blue-500'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-r-lg shadow-lg shadow-black/5 transform transition-all duration-300 animate-slide-in ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{toast.message}</p>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-0 left-0 flex flex-col items-center gap-2 z-[60] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
};