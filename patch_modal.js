import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetMenu = `        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-col justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}
              className="w-full max-w-sm p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PlusIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Adicionar Estado</h3>
              <p className="text-xs text-gray-500">Cadastre um novo estado testado sem sucesso.</p>
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className="w-full max-w-sm p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Ver Histórico</h3>
              <p className="text-xs text-gray-500">Veja todos os estados que já foram testados.</p>
            </button>
          </div>
        )}`;

const replacementMenu = `        {viewMode === 'menu' && (
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

const targetGasto = `                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded text-xs">
                              Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.adSpend || 0)}
                            </span>`;
const replacementGasto = `                            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded tracking-wide">
                              Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.adSpend || 0)}
                            </span>`;

const targetFooter = `            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Gasto em Insucessos</span>
              <span className="text-lg font-black text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)}
              </span>
            </div>`;
const replacementFooter = `            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total de Gastos</span>
              <span className="text-lg font-black text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)}
              </span>
            </div>`;

code = code.replace(targetMenu, replacementMenu);
code = code.replace(targetGasto, replacementGasto);
code = code.replace(targetFooter, replacementFooter);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
