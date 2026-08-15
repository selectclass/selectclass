import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetDateBox = `                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                          <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                          <span className="text-lg font-black text-gray-800 dark:text-white leading-none">{f.date.getDate()}</span>
                        </div>`;

const replacementDateBox = `                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                          <span className="text-xs font-black text-gray-800 dark:text-white uppercase leading-none">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </div>`;

code = code.replace(targetDateBox, replacementDateBox);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
