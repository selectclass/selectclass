import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetBroken = `            <XIcon c        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-row justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}
              className="flex-1 h-32 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                <PlusIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">Adicionar Estado</h3>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className="flex-1 h-32 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">Ver Estados</h3>
            </button>
          </div>
        )}dos</h3>
            </button>
          </div>
        )}`;

const replacementClean = `            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-row justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}
              className="flex-1 h-32 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                <PlusIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">Adicionar Estado</h3>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className="flex-1 h-32 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs whitespace-nowrap">Ver Estados</h3>
            </button>
          </div>
        )}`;

code = code.replace(targetBroken, replacementClean);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
