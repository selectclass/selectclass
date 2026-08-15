import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetMenu = `        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-row justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}
              className="w-full max-w-[50%] p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PlusIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">Adicionar Estado</h3>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className="w-full max-w-[50%] p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">Ver Estados</h3>
            </button>
          </div>
        )}`;

const replacementMenu = `        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-row justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}
              className="flex-1 aspect-square p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center max-h-36 max-w-36 mx-auto"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shrink-0">
                <PlusIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs">Adicionar Estado</h3>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className="flex-1 aspect-square p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center max-h-36 max-w-36 mx-auto"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shrink-0">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs">Ver Estados</h3>
            </button>
          </div>
        )}`;

code = code.replace(targetMenu, replacementMenu);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
