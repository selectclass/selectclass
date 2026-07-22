import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const importTarget = `import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon, GripVerticalIcon } from './Icons';`;
const importReplacement = `import { PlusIcon, TrashIcon, CalendarIcon, ChevronLeftIcon, XIcon, Edit2Icon, SaveIcon, TagIcon, SearchIcon, GripVerticalIcon, AlertCircleIcon } from './Icons';
import { FailedCotacao } from '../types';`;

code = code.replace(importTarget, importReplacement);

const stateTarget = `  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [categorias, setCategorias] = useState<CotacaoCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);`;
const stateReplacement = `  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [categorias, setCategorias] = useState<CotacaoCategoria[]>([]);
  const [failedCotacoes, setFailedCotacoes] = useState<FailedCotacao[]>([]);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);`;

code = code.replace(stateTarget, stateReplacement);

const fetchTarget = `      const [catsRes, quotesRes] = await Promise.all([
        api.get('v1/data/cotacaoCategorias'),
        api.get('v1/data/cotacoes')
      ]);`;
const fetchReplacement = `      const [catsRes, quotesRes, failedRes] = await Promise.all([
        api.get('v1/data/cotacaoCategorias'),
        api.get('v1/data/cotacoes'),
        api.get('v1/data/failedCotacoes')
      ]);`;
code = code.replace(fetchTarget, fetchReplacement);

const fetchAssignTarget = `      if (quotesRes) {
        const quotesArray = Object.values(quotesRes) as any[];`;
const fetchAssignReplacement = `      if (failedRes) {
        const failedArray = Object.values(failedRes) as FailedCotacao[];
        setFailedCotacoes(failedArray.map(f => ({
          ...f,
          date: new Date(f.date),
          createdAt: new Date(f.createdAt)
        })));
      } else {
        setFailedCotacoes([]);
      }

      if (quotesRes) {
        const quotesArray = Object.values(quotesRes) as any[];`;
code = code.replace(fetchAssignTarget, fetchAssignReplacement);

const deleteTarget = `  const handleDeleteQuote = async (id: string) => {`;
const deleteReplacement = `  const handleSaveFailedQuote = async (failedQuote: FailedCotacao) => {
    await api.put(\`v1/data/failedCotacoes/\${failedQuote.id}\`, {
      ...failedQuote,
      date: failedQuote.date.toISOString(),
      createdAt: failedQuote.createdAt.toISOString()
    });
    fetchData();
  };

  const handleDeleteFailedQuote = async (id: string) => {
    await api.delete(\`v1/data/failedCotacoes/\${id}\`);
    fetchData();
  };

  const handleDeleteQuote = async (id: string) => {`;
code = code.replace(deleteTarget, deleteReplacement);

const buttonTarget = `            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center justify-center gap-1 bg-white/20 text-white px-2 py-2 rounded-xl font-bold uppercase tracking-tighter text-[10px] whitespace-nowrap hover:bg-white/30 active:scale-95 transition-all shadow-md"
            >
              <TagIcon className="w-3.5 h-3.5 shrink-0" />
              Adicionar Categorias
            </button>
          </div>`;
const buttonReplacement = `            <button 
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
code = code.replace(buttonTarget, buttonReplacement);

const modalsTarget = `      {isCategoryModalOpen && (`;
const modalsReplacement = `      {isFailedModalOpen && (
        <FailedCotacoesModal
          isOpen={isFailedModalOpen}
          onClose={() => setIsFailedModalOpen(false)}
          failedCotacoes={failedCotacoes}
          onSave={handleSaveFailedQuote}
          onDelete={handleDeleteFailedQuote}
          generateId={generateId}
        />
      )}

      {isCategoryModalOpen && (`;
code = code.replace(modalsTarget, modalsReplacement);

const newModalComponent = `
const FailedCotacoesModal = ({ isOpen, onClose, failedCotacoes, onSave, onDelete, generateId }: any) => {
  const [data, setData] = useState<Partial<FailedCotacao>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!data.name || !data.date) return;
    
    const isEditing = !!editingId;
    const finalData = {
      id: isEditing ? editingId : generateId(),
      name: data.name,
      date: new Date(data.date),
      adSpend: Number(data.adSpend) || 0,
      createdAt: isEditing && data.createdAt ? new Date(data.createdAt) : new Date()
    };
    
    await onSave(finalData);
    setData({});
    setEditingId(null);
  };

  const handleEdit = (f: FailedCotacao) => {
    setEditingId(f.id);
    const d = new Date(f.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    setData({
      name: f.name,
      date: d,
      adSpend: f.adSpend,
      createdAt: f.createdAt
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setData({});
  };

  const sortedFailed = [...failedCotacoes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalLoss = sortedFailed.reduce((sum, f) => sum + (f.adSpend || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4 py-8">
      <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-full rounded-3xl shadow-2xl flex flex-col relative animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Locais Inviáveis</h2>
              <p className="text-xs text-gray-500 font-medium">Relatório de locais testados sem sucesso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-gray-200 dark:border-gray-800 shadow-sm">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-gray-50 dark:bg-black/20">
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
                  <p className="text-sm font-medium text-gray-500">Nenhum local marcado como inviável.</p>
               </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark rounded-b-3xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Gasto em Insucessos</span>
            <span className="text-lg font-black text-red-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

code += "\n" + newModalComponent;

fs.writeFileSync('components/CotacoesScreen.tsx', code);
