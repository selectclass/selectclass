import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetState = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;`;

const replacementState = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'menu' | 'add' | 'history'>('menu');

  if (!isOpen) return null;`;

const targetSave = `    await onSave(finalData);
    setData({});
    setEditingId(null);
  };`;

const replacementSave = `    await onSave(finalData);
    setData({});
    setEditingId(null);
    setViewMode('history'); // Go to history to see the added item
  };`;

const targetEdit = `  const handleEdit = (f: FailedCotacao) => {
    setEditingId(f.id);`;

const replacementEdit = `  const handleEdit = (f: FailedCotacao) => {
    setViewMode('add');
    setEditingId(f.id);`;

const targetModalBody = `        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-gray-50 dark:bg-black/20">
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              {editingId ? 'Editar Registro' : 'Novo Registro'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data da Tentativa</label>
                <input 
                  type="date" 
                  value={data.date ? (data.date as any).toISOString().split('T')[0] : ''} 
                  onChange={e => {
                    if (!e.target.value) return;
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const newDate = new Date(y, m - 1, d, 12, 0, 0);
                    setData({...data, date: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Local</label>
                <input 
                  type="text" 
                  value={data.name || ''} 
                  onChange={e => setData({...data, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                  placeholder="Ex: Centro de Convenções XYZ"
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gasto em Anúncios</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                  <input 
                    type="number" 
                    value={data.adSpend || ''} 
                    onChange={e => setData({...data, adSpend: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={!data.name || !data.date}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {sortedFailed.map(f => (
              <div key={f.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                {deleteConfirmId === f.id ? (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm font-bold text-red-500">Confirmar exclusão?</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200">Cancelar</button>
                      <button onClick={() => { onDelete(f.id); setDeleteConfirmId(null); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg shadow-sm shadow-red-500/20">Excluir</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        <span className="text-lg font-black text-gray-800 dark:text-white leading-none">{f.date.getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{f.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded text-xs">
                            Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.adSpend || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(f)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                        <Edit2Icon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(f.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {sortedFailed.length === 0 && (
               <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <AlertCircleIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Nenhum local marcado como testado.</p>
               </div>
            )}
          </div>
        </div>`;

const replacementModalBody = `        {viewMode === 'menu' && (
          <div className="p-6 flex-1 flex flex-col justify-center items-center gap-4 bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => { setViewMode('add'); setData({}); setEditingId(null); }}
              className="w-full max-w-sm p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PlusIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Adicionar Local</h3>
              <p className="text-xs text-gray-500">Cadastre um novo local testado sem sucesso.</p>
            </button>

            <button 
              onClick={() => setViewMode('history')}
              className="w-full max-w-sm p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Ver Histórico</h3>
              <p className="text-xs text-gray-500">Veja todos os locais que já foram testados.</p>
            </button>
          </div>
        )}

        {viewMode === 'add' && (
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50 dark:bg-black/20">
            <div className="mb-4">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                {editingId ? 'Editar Registro' : 'Novo Registro'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data da Tentativa</label>
                  <input 
                    type="date" 
                    value={data.date ? (data.date as any).toISOString().split('T')[0] : ''} 
                    onChange={e => {
                      if (!e.target.value) return;
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      const newDate = new Date(y, m - 1, d, 12, 0, 0);
                      setData({...data, date: newDate});
                    }}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Local</label>
                  <input 
                    type="text" 
                    value={data.name || ''} 
                    onChange={e => setData({...data, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    placeholder="Ex: Centro de Convenções XYZ"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gasto em Anúncios</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                    <input 
                      type="number" 
                      value={data.adSpend || ''} 
                      onChange={e => setData({...data, adSpend: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  {editingId && (
                    <button 
                      onClick={() => setViewMode('history')}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={!data.name || !data.date}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                  >
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'history' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-gray-50 dark:bg-black/20">
            <div className="mb-2">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div className="space-y-3">
              {sortedFailed.map(f => (
                <div key={f.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                  {deleteConfirmId === f.id ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-sm font-bold text-red-500">Confirmar exclusão?</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200">Cancelar</button>
                        <button onClick={() => { onDelete(f.id); setDeleteConfirmId(null); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg shadow-sm shadow-red-500/20">Excluir</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/20 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                          <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{f.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                          <span className="text-lg font-black text-gray-800 dark:text-white leading-none">{f.date.getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white text-sm">{f.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded text-xs">
                              Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.adSpend || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(f)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                          <Edit2Icon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(f.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-xl">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {sortedFailed.length === 0 && (
                 <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <AlertCircleIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Nenhum local marcado como testado.</p>
                 </div>
              )}
            </div>
          </div>
        )}`;

code = code.replace(targetState, replacementState);
code = code.replace(targetSave, replacementSave);
code = code.replace(targetEdit, replacementEdit);
code = code.replace(targetModalBody, replacementModalBody);

const importsTarget = `import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon, GripVerticalIcon, AlertCircleIcon } from './Icons';`;
const importsReplacement = `import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon, GripVerticalIcon, AlertCircleIcon, HistoryIcon } from './Icons';`;

code = code.replace(importsTarget, importsReplacement);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
