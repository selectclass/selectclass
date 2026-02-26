
import React, { useState, useEffect } from 'react';
import { LectureModel } from '../types';
import { PlusIcon, TrashIcon, MicIcon, CheckIcon, MenuIcon } from './Icons';

interface LectureModelManagerProps {
  models: LectureModel[];
  onAdd: (model: LectureModel) => void;
  onRemove: (id: string) => void;
  onSaveOrder: (orderedList: LectureModel[]) => void;
}

export const LectureModelManager: React.FC<LectureModelManagerProps> = ({ models, onAdd, onRemove, onSaveOrder }) => {
  const [name, setName] = useState('');
  const [localList, setLocalList] = useState<LectureModel[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalList([...models].sort((a, b) => (a.order || 0) - (b.order || 0)));
  }, [models]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        type: 'Palestra',
        order: localList.length
    });
    setName('');
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newList = [...localList];
    const item = newList.splice(draggedIndex, 1)[0];
    newList.splice(index, 0, item);
    
    const ordered = newList.map((item, idx) => ({ ...item, order: idx }));
    setLocalList(ordered);
    setDraggedIndex(null);
    onSaveOrder(ordered); // Automatic save on drop
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Gestão de Palestras</h2>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-500">
                <MicIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Novo Modelo de Palestra</h3>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tipo do Evento</label>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none font-bold" 
                placeholder="Ex: Palestra, Workshop, Mentoria..." 
            />
          </div>
          <button type="submit" disabled={!name.trim()} className="w-full py-4 bg-sky-500 text-white rounded-xl shadow-lg font-black uppercase tracking-widest text-[10px] hover:bg-sky-600 disabled:bg-gray-300 transition-all">Adicionar Modelo</button>
        </form>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        {localList.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Nenhum modelo cadastrado.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {localList.map((m, index) => (
              <li 
                key={m.id} 
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDrop(e, index)}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-move group"
              >
                <div className="flex items-center gap-3">
                    <MenuIcon className="w-4 h-4 text-gray-300 group-hover:text-sky-500 transition-colors" />
                    <span className="text-gray-800 dark:text-gray-200 font-bold block">{m.name}</span>
                </div>
                <button onClick={() => onRemove(m.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
