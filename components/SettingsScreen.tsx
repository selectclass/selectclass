
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
  const [newUser, setNewUser] = useState('');
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
          setNewUser(''); // Limpa o campo de usuário após salvar
          setNewPass(''); // Limpa o campo de senha por segurança
          setTimeout(() => setIsSavedCreds(false), 2000);
      }
  };

  const colors = [
    { name: 'Azul Clássico', hex: '#1A4373' },
    { name: 'Verde Natureza', hex: '#15803d' }, 
    { name: 'Roxo Criativo', hex: '#7e22ce' }, 
    { name: 'Preto Moderno', hex: '#1f2937' }, 
    { name: 'Rosa Vibrante', hex: '#be185d' }, 
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      
      {/* Seção Perfil */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6 border-l-4 border-primary">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Perfil da Instrutora
        </h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">NOME NO PERFIL</p>
        
        <div className="flex items-center gap-2">
            <input 
                type="text" 
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleSaveName}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                placeholder="Seu Nome"
            />
            <button 
                onClick={handleSaveName}
                className={`p-3 rounded-xl transition-all ${isSavedName ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}
            >
                <CheckIcon className="w-6 h-6" />
            </button>
        </div>
        {isSavedName && <p className="text-green-600 dark:text-green-400 text-[10px] mt-2 font-black uppercase tracking-widest">✓ Alteração salva</p>}
      </section>

      {/* Seção Segurança */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-primary" />
            Segurança de Acesso
        </h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Atualize seu login e senha</p>
        
        <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Novo Usuário</label>
                <input 
                    type="text" 
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                    placeholder=""
                    required
                />
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Nova Senha</label>
                <input 
                    type="text" 
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                    placeholder=""
                    required
                />
            </div>
            
            <button 
                type="submit"
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg mt-2 flex items-center justify-center gap-2
                    ${isSavedCreds 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'}`}
            >
                {isSavedCreds ? <CheckIcon className="w-5 h-5" /> : <LockIcon className="w-4 h-4" />}
                {isSavedCreds ? 'CREDENCIAL SALVA NA NUVEM' : 'SALVAR ALTERAÇÕES'}
            </button>
        </form>
      </section>

      {/* Seção Aparência */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Aparência</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300">
               {isDarkMode ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
             </div>
             <div>
               <p className="font-bold text-gray-800 dark:text-white text-sm">Modo Escuro</p>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tema da Interface</p>
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

      {/* Seção Cor do Sistema */}
      <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Cor do Sistema</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Personalize a identidade visual</p>
        
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
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customização livre</span>
        </div>
      </section>

      <div className="text-center pt-8">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">SelectClass v1.0</p>
      </div>

    </div>
  );
};
