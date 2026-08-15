import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetDateBox = `                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                          <span className="text-xs font-black text-gray-800 dark:text-white uppercase leading-none">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </div>`;

const replacementDateBox = `                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                          <span className="text-base font-black text-gray-800 dark:text-white uppercase leading-none">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </div>`;

code = code.replace(targetDateBox, replacementDateBox);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
