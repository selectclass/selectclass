
import React, { useState, useEffect } from 'react';
import { CourseType } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, XIcon, CheckIcon, GraduationCapIcon, MenuIcon, ClockIcon, DollarSignIcon, CalendarIcon } from './Icons';

interface CourseManagerProps {
  courseTypes: CourseType[];
  onAddCourse: (course: CourseType) => void;
  onUpdateCourse: (course: CourseType) => void;
  onRemoveCourse: (id: string) => void;
  onSaveOrder: (orderedList: CourseType[]) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ courseTypes, onAddCourse, onUpdateCourse, onRemoveCourse, onSaveOrder }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localList, setLocalList] = useState<CourseType[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalList([...courseTypes].filter(c => c.model !== 'Palestra').sort((a, b) => (a.order || 0) - (b.order || 0)));
  }, [courseTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const courseData: CourseType = {
        id: editingId || Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        model: 'Curso',
        defaultValue: parseFloat(value.replace(',', '.')) || 0,
        defaultTime: time,
        defaultDuration: duration,
        order: editingId ? (courseTypes.find(c => c.id === editingId)?.order || 0) : localList.length
    };

    if (editingId) {
        onUpdateCourse(courseData);
    } else {
        onAddCourse(courseData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setValue('');
    setTime('09:00');
    setDuration('1');
    setEditingId(null);
  };

  const handleEditClick = (course: CourseType) => {
      setEditingId(course.id);
      setName(course.name);
      setValue(course.defaultValue?.toString() || '');
      setTime(course.defaultTime || '09:00');
      setDuration(course.defaultDuration || '1');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    onSaveOrder(ordered); // Automatic save
  };

  const formatDays = (val: string | undefined) => {
    if (!val) return '';
    const num = parseInt(val);
    if (isNaN(num)) return val;
    return num === 1 ? '1 dia' : `${num} dias`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Gestão de Cursos</h2>
      </div>

      <div className={`rounded-2xl shadow-sm p-6 mb-6 transition-colors duration-300 ${editingId ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                    <GraduationCapIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">{editingId ? 'Editar Modelo' : 'Novo Modelo'}</h3>
                </div>
            </div>
            {editingId && (
                <button 
                    onClick={resetForm}
                    className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                    <XIcon className="w-3 h-3" /> Cancelar
                </button>
            )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nome do Modelo</label>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none font-bold"
                placeholder="Ex: Curso VIP"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Horário de Início</label>
                <div className="relative">
                    <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
             </div>
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Valor (R$)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                    <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none font-bold" placeholder="0,00" />
                </div>
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Quantidade de Dias</label>
            <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none font-bold" placeholder="Ex: 2" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-4 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]
                ${editingId 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:dark:bg-gray-700'}`}
          >
            {editingId ? (
                <> <CheckIcon className="w-5 h-5" /> Salvar Modelo </>
            ) : (
                <> <PlusIcon className="w-5 h-5" /> Adicionar na Lista </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        {localList.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Nenhum curso cadastrado ainda.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {localList.map((course, index) => (
              <li 
                key={course.id} 
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDrop(e, index)}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-move group ${editingId === course.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex items-center gap-3">
                    <MenuIcon className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    <div>
                        <span className="text-gray-800 dark:text-gray-200 font-bold block leading-none mb-1">{course.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">R$ {course.defaultValue?.toLocaleString('pt-BR')} • {course.defaultTime} • {formatDays(course.defaultDuration)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => handleEditClick(course)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => onRemoveCourse(course.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
