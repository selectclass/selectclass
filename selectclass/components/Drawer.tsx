import React from 'react';
import { AppView } from '../types';
import { HomeIcon, DollarSignIcon, PlusIcon, SettingsIcon, UsersIcon, BoxIcon, BarChartIcon, TrendingDownIcon, HistoryIcon, TrophyIcon, LogOutIcon } from './Icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void; 
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, currentView, onChangeView, onLogout }) => {
  const menuItems = [
    { view: AppView.HOME, label: 'Página Inicial', icon: <HomeIcon className="w-5 h-5" /> },
    { view: AppView.STUDENTS, label: 'Alunas', icon: <UsersIcon className="w-5 h-5" /> },
    { view: AppView.HISTORY, label: 'Histórico', icon: <HistoryIcon className="w-5 h-5" /> },
    { view: AppView.ADD_EVENTS, label: 'Adicionar Eventos', icon: <PlusIcon className="w-5 h-5" /> },
    { view: AppView.MATERIALS, label: 'Materiais', icon: <BoxIcon className="w-5 h-5" /> },
    { view: AppView.FINANCIAL, label: 'Financeiro', icon: <DollarSignIcon className="w-5 h-5" /> },
    { view: AppView.EXPENSES, label: 'Despesas', icon: <TrendingDownIcon className="w-5 h-5" /> },
    { view: AppView.ANALYTICS, label: 'Ranking', icon: <TrophyIcon className="w-5 h-5" /> }, 
    { view: AppView.SETTINGS, label: 'Ajustes', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const handleItemClick = (view: AppView) => {
    onChangeView(view);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-surface-dark shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="h-32 bg-primary flex flex-col justify-end p-5">
             <div className="flex items-center gap-2 mb-1.5">
                <img src="https://i.postimg.cc/gJ2C9FMT/icon.png" alt="Logo" className="h-9 w-auto" />
                <h2 className="text-white text-2xl font-bold">SelectClass</h2>
             </div>
             <p className="text-blue-200 text-[8px] font-normal uppercase tracking-widest opacity-90">Excelência em cada agendamento</p>
          </div>

          {/* Menu Items - Reduzido para 17px e mantendo py-2.5 para evitar rolagem */}
          <nav className="flex-1 py-1 overflow-y-auto no-scrollbar">
            <ul className="space-y-0.5">
              {menuItems.map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => handleItemClick(item.view)}
                    className={`w-full flex items-center px-6 py-2.5 text-left transition-colors text-[17px]
                      ${currentView === item.view 
                        ? 'bg-primary/10 text-primary dark:text-blue-300 dark:bg-blue-900/20 font-normal border-r-4 border-primary' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 font-normal'
                      }`}
                  >
                    <span className="mr-4">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <button
                onClick={handleLogoutClick}
                className="w-full flex items-center px-6 py-2.5 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-normal text-[17px]"
            >
                <LogOutIcon className="w-5 h-5 mr-4" />
                Sair
            </button>
            <p className="text-[10px] text-gray-300 text-center pt-2">Powered by JG Creator</p>
          </div>
        </div>
      </div>
    </>
  );
};