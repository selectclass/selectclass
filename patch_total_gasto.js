import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetTotal = `        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark rounded-b-3xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Gasto em Insucessos</span>
            <span className="text-lg font-black text-red-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)}
            </span>
          </div>
        </div>`;

const replacementTotal = `        {viewMode === 'history' && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark rounded-b-3xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Gasto em Insucessos</span>
              <span className="text-lg font-black text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)}
              </span>
            </div>
          </div>
        )}`;

code = code.replace(targetTotal, replacementTotal);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
