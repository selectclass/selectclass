
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { SearchIcon, WhatsAppIcon, MapPinIcon, PencilIcon, TrashIcon } from './Icons';

interface StudentsListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({ students, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (student.phone && student.phone.includes(searchTerm))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm]);

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return '#';
    const cleanNumber = phone.replace(/\D/g, '');
    const finalNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
    return `https://wa.me/${finalNumber}`;
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Minhas Alunas</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Total: {filteredStudents.length} alunas</p>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-10 opacity-60">
            {searchTerm ? (
                <p className="text-gray-500">Nenhuma aluna encontrada.</p>
            ) : (
                <p className="text-gray-500">Sua lista de alunas aparecerá aqui automaticamente.</p>
            )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4 relative">
              
              {/* Content Area - Isolated */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 dark:text-white text-base truncate">{student.name}</h3>
                
                {/* Phone Display */}
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                    {student.phone || 'Sem telefone'}
                </p>

                {/* Location Info */}
                <div className="flex items-center text-gray-400 text-xs mt-1 truncate">
                    <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                        {student.city || 'Cidade não inf.'}
                        {student.state ? ` - ${student.state}` : ''}
                    </span>
                </div>
              </div>

              {/* Actions Row - Isolated & High Z-Index */}
              <div className="flex items-center gap-2 flex-shrink-0 z-20 relative">
                
                {/* Edit Button */}
                <button
                    onClick={() => onEdit(student)}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
                    title="Editar"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>

                {/* WhatsApp Button */}
                {student.phone && (
                    <a 
                    href={getWhatsAppLink(student.phone)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-all active:scale-95"
                    title="Enviar WhatsApp"
                    >
                    <WhatsAppIcon className="w-5 h-5" />
                    </a>
                )}

                {/* Delete Button - With Confirmation Modal triggered via prop */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(student.id);
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all cursor-pointer relative z-50 shadow-sm active:scale-90"
                    title="Excluir"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
