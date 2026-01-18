
import React, { useState } from 'react';
import { MoonIcon, SunIcon, UsersIcon, CheckIcon, LockIcon } from './Icons';

interface SettingsScreenProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  primaryColor: string;
  onUpdateColor: (color: string) => void;
  instructorName: string;
  onUpdateInstructorName: (name: string) => void;
  onClearAllData: () => void;
  // Security Props
  currentUsername: string;
  onUpdateCredentials: (user: string, pass: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  isDarkMode, 
  onToggleTheme, 
  primaryColor, 
  onUpdateColor,
  instructorName,
  onUpdateInstructorName,
  currentUsername,
  onUpdateCredentials
}) => {
  
  const [localName, setLocalName] = useState(instructorName);
  const [isSavedName, setIsSavedName] = useState(false);

  // Security State
  const [newUser, setNewUser] = useState(currentUsername);
  const [newPass, setNewPass] = useState('');
  const [isSavedCreds, setIsSavedCreds] = useState(false);

  const handleSaveName = () => {
    onUpdateInstructorName(localName);
    setIsSavedName(true);
    setTimeout(() => setIsSavedName(false), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
      e.preventDefault();
      if(newUser && newPass) {
          onUpdateCredentials(newUser, newPass);
          setIsSavedCreds(true);
          setNewPass(''); // Clear pass field for security
          setTimeout(() => setIsSavedCreds(false), 2000);
      }
  };

  const colors = [
    { name: 'Azul Clássico', hex: '#1A4373' },
    { name: 'Verde Natureza', hex: '#15803d' }, // green-700
    { name: 'Roxo Criativo', hex: '#7e22ce' }, // purple-700
    { name: 'Preto Moderno', hex: '#1f2937' }, // gray-800
    { name: 'Rosa Vibrante', hex: '#be185d' }, // pink-700
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      
      {/* Instructor Profile Section */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6 border-l-4 border-primary">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Perfil da Instrutora
        </h3>
        <p className="text-sm text-gray-500 mb-4">Exibido no topo da Home.</p>
        
        <div className="flex items-center gap-2">
            <input 
                type="text" 
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleSaveName}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Seu Nome"
            />
            <button 
                onClick={handleSaveName}
                className={`p-3 rounded-xl transition-all ${isSavedName ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}
            >
                <CheckIcon className="w-6 h-6" />
            </button>
        </div>
        {isSavedName && <p className="text-green-600 dark:text-green-400 text-xs mt-2 font-medium">Nome salvo.</p>}
      </section>

      {/* Security Section */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-primary" />
            Segurança de Acesso
        </h3>
        <p className="text-sm text-gray-500 mb-4">Atualize seu usuário e senha de login.</p>
        
        <form onSubmit={handleSaveCredentials} className="space-y-3">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Novo Usuário</label>
                <input 
                    type="text" 
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Novo Usuário"
                    required
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nova Senha</label>
                <input 
                    type="text" 
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Digite a nova senha"
                    required
                />
            </div>
            
            <button 
                type="submit"
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg mt-2 flex items-center justify-center gap-2
                    ${isSavedCreds 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary text-white hover:bg-primary-dark'}`}
            >
                {isSavedCreds ? <CheckIcon className="w-5 h-5" /> : <LockIcon className="w-4 h-4" />}
                {isSavedCreds ? 'Alterações Salvas' : 'Salvar Alterações'}
            </button>
        </form>
      </section>

      {/* Theme Section */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Aparência</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300">
               {isDarkMode ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
             </div>
             <div>
               <p className="font-medium text-gray-800 dark:text-white">Modo Escuro</p>
               <p className="text-xs text-gray-500">Alternar tema claro/escuro</p>
             </div>
          </div>
          <button 
            onClick={onToggleTheme}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </section>

      {/* Color Section */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Cor do Sistema</h3>
        <p className="text-sm text-gray-500 mb-6">Personalize a identidade visual.</p>
        
        <div className="grid grid-cols-5 gap-3 mb-6">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdateColor(c.hex)}
              className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${primaryColor.toLowerCase() === c.hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-white dark:ring-offset-gray-900 scale-110' : ''}`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            >
              {primaryColor.toLowerCase() === c.hex.toLowerCase() && (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <input 
              type="color" 
              value={primaryColor}
              onChange={(e) => onUpdateColor(e.target.value)}
              className="h-10 w-10 p-0 border-0 rounded-lg cursor-pointer overflow-hidden shadow-sm"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Escolha livre</span>
        </div>
      </section>

      <div className="text-center pt-8">
        <p className="text-xs text-gray-400 font-medium">SelectClass v1.8.0</p>
      </div>

    </div>
  );
};
