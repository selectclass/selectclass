
import React, { useState } from 'react';
import { CourseType } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, XIcon, CheckIcon } from './Icons';

interface CourseManagerProps {
  courseTypes: CourseType[];
  onAddCourse: (course: CourseType) => void;
  onUpdateCourse: (course: CourseType) => void;
  onRemoveCourse: (id: string) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ courseTypes, onAddCourse, onUpdateCourse, onRemoveCourse }) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('Curso Vip'); 
  const [defaultValue, setDefaultValue] = useState('');
  const [defaultTime, setDefaultTime] = useState('');
  const [defaultDuration, setDefaultDuration] = useState('');

  // State to track if we are editing an existing course
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const courseData = {
        name,
        model, 
        defaultValue: defaultValue ? parseFloat(defaultValue) : undefined,
        defaultTime: defaultTime || undefined,
        defaultDuration: defaultDuration || undefined
    };

    if (editingId) {
        // Update Existing
        onUpdateCourse({
            ...courseData,
            id: editingId
        });
    } else {
        // Create New
        onAddCourse({
            ...courseData,
            id: Math.random().toString(36).substr(2, 9)
        });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setModel('Curso Vip');
    setDefaultValue('');
    setDefaultTime('');
    setDefaultDuration('');
    setEditingId(null);
  };

  const handleEditClick = (course: CourseType) => {
      setEditingId(course.id);
      setName(course.name);
      setModel(course.model || 'Curso Vip');
      setDefaultValue(course.defaultValue ? course.defaultValue.toString() : '');
      setDefaultTime(course.defaultTime || '');
      setDefaultDuration(course.defaultDuration || '');
      
      // Smooth scroll to top to edit
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to format duration text (1 DIA / X DIAS)
  const formatDurationDisplay = (duration: string) => {
      const num = parseInt(duration.replace(/\D/g, ''));
      if (isNaN(num)) return duration.toUpperCase();
      return num === 1 ? '1 DIA' : `${num} DIAS`;
  };

  return (
    <div className="p-6">
      <div className={`rounded-2xl shadow-sm p-6 mb-6 transition-colors duration-300 ${editingId ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-surface-dark'}`}>
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {editingId ? 'Editar Evento' : 'Configurar Eventos'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingId ? 'Atualize os dados abaixo.' : 'Automatize seus agendamentos.'}
                </p>
            </div>
            {editingId && (
                <button 
                    onClick={resetForm}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                    <XIcon className="w-3 h-3" /> Cancelar
                </button>
            )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Evento */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Evento</label>
              <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Curso Iniciante"
              />
            </div>

            {/* Modelo do Evento */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo do Evento</label>
              <div className="relative">
                <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
                >
                    <option value="Curso Vip">Curso Vip</option>
                    <option value="Curso em Turma">Curso em Turma</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Palestra">Palestra</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
                <input 
                    type="number" 
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora Início</label>
                <input 
                    type="time" 
                    value={defaultTime}
                    onChange={(e) => setDefaultTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duração</label>
                <input 
                    type="text" 
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: 1 dia"
                />
             </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-3 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wide text-sm
                ${editingId 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:dark:bg-gray-700'}`}
          >
            {editingId ? (
                <> <CheckIcon className="w-5 h-5" /> Salvar Alterações </>
            ) : (
                <> <PlusIcon className="w-5 h-5" /> Cadastrar Evento </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Eventos Ativos</h3>
        </div>
        
        {courseTypes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhum evento configurado.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {courseTypes.map(course => (
              <li key={course.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${editingId === course.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-800 dark:text-gray-200 font-bold block">{course.name}</span>
                        {course.model && (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                                {course.model}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">
                        {/* Value Display Removed here */}
                        {course.defaultDuration ? formatDurationDisplay(course.defaultDuration) : ''}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleEditClick(course)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir?')) {
                                onRemoveCourse(course.id);
                            }
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
