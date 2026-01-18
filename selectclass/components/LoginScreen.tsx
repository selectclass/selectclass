import React, { useState, useEffect } from 'react';
import { LockIcon, SmartphoneIcon, UserIcon, AlertCircleIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (user: string, pass: string) => void;
  loginError?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveAccess, setSaveAccess] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  
  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Load Saved Credentials if they exist
    const savedCreds = localStorage.getItem('saved_credentials');
    if (savedCreds) {
        try {
            const parsed = JSON.parse(savedCreds);
            setUsername(parsed.u || '');
            setPassword(parsed.p || '');
            setSaveAccess(true);
        } catch (e) {
            console.error("Error loading credentials");
        }
    }

    // 2. PWA Installer Listener
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    } else {
        alert("Para instalar no PC: Clique no ícone de instalação na barra de endereços do navegador (canto direito).\n\nNo Celular: Use a opção 'Adicionar à Tela Inicial' do navegador.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(false);
    if (username && password) {
      // Save or Clear Credentials based on checkbox
      if (saveAccess) {
          localStorage.setItem('saved_credentials', JSON.stringify({ u: username, p: password }));
      } else {
          localStorage.removeItem('saved_credentials');
      }

      onLogin(username, password);
    } else {
        setFieldError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#1A4373]">
      <div className="w-full max-sm flex flex-col items-center animate-fade-in">
        
        {/* Logo Area */}
        <div className="mb-10 text-center">
            <img 
                src="https://i.postimg.cc/gJ2C9FMT/icon.png" 
                alt="Logo" 
                style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto' }} 
            />
            <h1 className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-md mt-2">
              SelectClass
            </h1>
            <p className="text-blue-200 text-[9px] mt-2 font-bold tracking-widest uppercase opacity-90">
              Excelência em cada agendamento
            </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <UserIcon className="w-5 h-5" />
                </div>
                <input 
                    type="text" 
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all shadow-lg"
                />
            </div>
            <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <LockIcon className="w-5 h-5" />
                </div>
                <input 
                    type="password" 
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all shadow-lg"
                />
            </div>

            {/* Checkbox Salvar Acesso */}
            <div className="flex items-center gap-3 pl-1">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        id="saveAccess"
                        checked={saveAccess}
                        onChange={(e) => setSaveAccess(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-blue-300 bg-white/10 checked:bg-white checked:border-white transition-all"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-[#1A4373] pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <label htmlFor="saveAccess" className="text-blue-100 text-xs font-bold uppercase tracking-wider cursor-pointer select-none">
                    SALVAR ACESSO
                </label>
            </div>

            {fieldError && (
                <div className="flex items-center gap-2 text-red-300 text-sm font-bold bg-red-900/30 p-3 rounded-xl border border-red-500/20 animate-fade-in">
                    <AlertCircleIcon className="w-5 h-5" />
                    <span>Preencha todos os campos.</span>
                </div>
            )}

            {loginError && (
                <div className="flex items-center gap-2 text-red-300 text-sm font-bold bg-red-900/30 p-3 rounded-xl border border-red-500/20 animate-fade-in">
                    <AlertCircleIcon className="w-5 h-5" />
                    <span>Usuário ou senha incorretos!</span>
                </div>
            )}

            <button 
                type="submit"
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-bold text-lg tracking-wide uppercase shadow-lg backdrop-blur-sm transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 group"
            >
                <LockIcon className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" /> 
                ENTRAR
            </button>
        </form>
        
        {/* PWA Install Button */}
        <button
            onClick={handleInstallClick}
            className="mt-6 w-full py-3 bg-white text-[#1A4373] rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all animate-bounce-short border border-transparent hover:border-blue-200"
        >
            <SmartphoneIcon className="w-5 h-5" />
            INSTALAR APP NO CELULAR
        </button>

        <p className="mt-8 text-blue-200/40 text-xs">Powered by JG Creator</p>

      </div>
    </div>
  );
};