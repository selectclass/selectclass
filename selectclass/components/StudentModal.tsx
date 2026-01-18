
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { XIcon, CheckIcon, UsersIcon } from './Icons';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  initialStudent?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSave, initialStudent }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialStudent) {
        setName(initialStudent.name);
        setPhone(initialStudent.phone || '');
        setCity(initialStudent.city || '');
        setState(initialStudent.state || '');
      } else {
        setName('');
        setPhone('');
        setCity('');
        setState('');
      }
    }
  }, [isOpen, initialStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Safe ID generation
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

    onSave({
      id: initialStudent?.id || newId,
      name,
      phone,
      city,
      state,
      createdAt: initialStudent?.createdAt || new Date()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 p-6 relative">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors z-10"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <UsersIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {initialStudent ? 'Editar Aluna' : 'Nova Aluna'}
                </h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Completo
                </label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Ana Silva"
                />
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp / Telefone
                </label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="(00) 00000-0000"
                />
            </div>

            {/* City/State */}
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cidade
                    </label>
                    <input 
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    UF
                    </label>
                    <input 
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg hover:bg-red-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <CheckIcon className="w-5 h-5" /> Salvar Alterações
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
