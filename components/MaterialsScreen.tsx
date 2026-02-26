
import React, { useState } from 'react';
import { CourseType, MaterialDef } from '../types';
import { BoxIcon, PlusIcon, TrashIcon } from './Icons';

interface MaterialsScreenProps {
  courseTypes: CourseType[];
  onUpdateCourse: (course: CourseType) => void;
}

export const MaterialsScreen: React.FC<MaterialsScreenProps> = ({ courseTypes, onUpdateCourse }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseTypes[0]?.id || '');
  const [newItemName, setNewItemName] = useState('');

  const selectedCourse = courseTypes.find(c => c.id === selectedCourseId);
  const currentMaterials = selectedCourse?.defaultMaterials || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedCourse) return;

    // Create object without fixed cost
    const newMaterial: MaterialDef = {
        name: newItemName.trim()
    };

    const updatedMaterials = [...currentMaterials, newMaterial];
    onUpdateCourse({
        ...selectedCourse,
        defaultMaterials: updatedMaterials
    });
    setNewItemName('');
  };

  const handleRemoveItem = (index: number) => {
    if (!selectedCourse) return;
    const updatedMaterials = [...currentMaterials];
    updatedMaterials.splice(index, 1);
    onUpdateCourse({
        ...selectedCourse,
        defaultMaterials: updatedMaterials
    });
  };

  return (
    <div className="p-6">
       <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
              {/* Icon Container */}
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-primary dark:text-blue-300">
                  <BoxIcon className="w-5 h-5" />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gestão de Materiais</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Crie checklists padrão para seus cursos.</p>
              </div>
          </div>

          {courseTypes.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Cadastre um evento primeiro para configurar os materiais.</p>
          ) : (
              <div className="space-y-6">
                  {/* Course Selector */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selecione o Evento (Curso)</label>
                      <div className="relative">
                          <select 
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
                          >
                            {courseTypes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                           </div>
                      </div>
                  </div>

                  {/* Add Item Form */}
                  <div>
                    <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
                        <div className="flex-1">
                            <input 
                                type="text" 
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Nome do material (ex: Kit Aluna, Apostila)"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!newItemName.trim()}
                            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 font-bold"
                        >
                            <PlusIcon className="w-5 h-5" /> <span className="hidden sm:inline">Adicionar</span>
                        </button>
                    </form>
                    
                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-2">
                        {['Apostila', 'Kit Aluna', 'Produtos', 'Camisa', 'Coffee Break'].map(item => (
                            <button
                                key={item}
                                onClick={() => setNewItemName(item)}
                                className="px-3 py-1.5 text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-primary/10 hover:text-primary dark:hover:text-white transition-colors border border-transparent hover:border-primary/20"
                            >
                                + {item}
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Materials List */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/10 flex justify-between">
                          <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Itens do Checklist ({currentMaterials.length})</h3>
                      </div>
                      {currentMaterials.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-sm">
                              Nenhum item configurado para este curso.
                          </div>
                      ) : (
                          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                              {currentMaterials.map((item, idx) => (
                                  <li key={idx} className="flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-white/5">
                                      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">📦 {item.name}</span>
                                      <button 
                                        onClick={() => handleRemoveItem(idx)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Remover Item"
                                      >
                                          <TrashIcon className="w-4 h-4" />
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              </div>
          )}
       </div>
    </div>
  );
};
