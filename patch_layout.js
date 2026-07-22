import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const target1 = `            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center justify-center gap-1 bg-white/20 text-white px-2 py-2 rounded-xl font-bold uppercase tracking-tighter text-[10px] whitespace-nowrap hover:bg-white/30 active:scale-95 transition-all shadow-md"
            >
              <TagIcon className="w-3.5 h-3.5 shrink-0" />
              Adicionar Categorias
            </button>
            <button 
              onClick={() => setIsFailedModalOpen(true)}
              className="flex items-center justify-center gap-1 bg-red-500/20 text-white border border-red-500/30 px-2 py-2 rounded-xl font-bold uppercase tracking-tighter text-[10px] whitespace-nowrap hover:bg-red-500/30 active:scale-95 transition-all shadow-md"
            >
              <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
              Locais Inviáveis
            </button>
          </div>`;

const replacement1 = `            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center justify-center gap-1 bg-white/20 text-white px-2 py-2 rounded-xl font-bold uppercase tracking-tighter text-[10px] whitespace-nowrap hover:bg-white/30 active:scale-95 transition-all shadow-md"
            >
              <TagIcon className="w-3.5 h-3.5 shrink-0" />
              Adicionar Categorias
            </button>
          </div>`;

code = code.replace(target1, replacement1);

const target2 = `           <div className="flex justify-end mb-2">
               <button 
                   onClick={() => setShowAllDates(!showAllDates)}
                   className={\`w-full py-3 rounded-xl border shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all \${showAllDates ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-white/5 text-primary border-gray-200 dark:border-gray-800'}\`}
               >
                   <div className={\`p-1 rounded-full \${showAllDates ? 'bg-white/20' : 'bg-primary/5 dark:bg-primary/10'}\`}>
                       <SearchIcon className={\`w-4 h-4 \${showAllDates ? 'text-white' : 'text-primary'}\`} />
                   </div>
                   <span className="text-[9px] font-black tracking-widest uppercase">
                       {showAllDates ? 'MOSTRAR POR DATA' : 'TODAS COTAÇÕES'}
                   </span>
               </button>
           </div>`;

const replacement2 = `           <div className="flex items-center gap-2 mb-2">
               <button 
                   onClick={() => setShowAllDates(!showAllDates)}
                   className={\`flex-1 py-3 rounded-xl border shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all \${showAllDates ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-white/5 text-primary border-gray-200 dark:border-gray-800'}\`}
               >
                   <div className={\`p-1 rounded-full \${showAllDates ? 'bg-white/20' : 'bg-primary/5 dark:bg-primary/10'}\`}>
                       <SearchIcon className={\`w-4 h-4 \${showAllDates ? 'text-white' : 'text-primary'}\`} />
                   </div>
                   <span className="text-[9px] font-black tracking-widest uppercase">
                       {showAllDates ? 'MOSTRAR POR DATA' : 'TODAS COTAÇÕES'}
                   </span>
               </button>
               <button 
                 onClick={() => setIsFailedModalOpen(true)}
                 className="flex-1 py-3 flex items-center justify-center gap-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 rounded-xl font-black tracking-widest uppercase text-[9px] hover:bg-red-500/20 active:scale-95 transition-all shadow-sm"
               >
                 <AlertCircleIcon className="w-4 h-4 shrink-0" />
                 Locais Testados
               </button>
           </div>`;

code = code.replace(target2, replacement2);

const target3 = `              <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Locais Inviáveis</h2>`;
const replacement3 = `              <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Locais Testados</h2>`;

code = code.replace(target3, replacement3);

const target4 = `                  <p className="text-sm font-medium text-gray-500">Nenhum local marcado como inviável.</p>`;
const replacement4 = `                  <p className="text-sm font-medium text-gray-500">Nenhum local marcado como testado.</p>`;

code = code.replace(target4, replacement4);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
