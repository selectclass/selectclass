import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const stateTarget = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'menu' | 'add' | 'history'>('menu');

  if (!isOpen) return null;`;

const stateReplacement = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'menu' | 'add' | 'history'>('menu');
  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');

  if (!isOpen) return null;`;

code = code.replace(stateTarget, stateReplacement);

const listLogicTarget = `  const sortedFailed = [...failedCotacoes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalLoss = sortedFailed.reduce((sum, f) => sum + (f.adSpend || 0), 0);`;

const listLogicReplacement = `  const availableYears = useMemo(() => {
    const years = new Set(failedCotacoes.map((f: FailedCotacao) => new Date(f.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [failedCotacoes]);

  const sortedFailed = useMemo(() => {
    return [...failedCotacoes]
      .filter((f: FailedCotacao) => {
        const d = new Date(f.date);
        const matchMonth = filterMonth === 'all' || d.getMonth() === filterMonth;
        const matchYear = filterYear === 'all' || d.getFullYear() === filterYear;
        return matchMonth && matchYear;
      })
      .sort((a: FailedCotacao, b: FailedCotacao) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [failedCotacoes, filterMonth, filterYear]);

  const totalLoss = sortedFailed.reduce((sum, f) => sum + (f.adSpend || 0), 0);
  
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];`;

code = code.replace(listLogicTarget, listLogicReplacement);

const filterUITarget = `            <div className="mb-2">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Voltar
              </button>
            </div>
            <div className="space-y-3">`;

const filterUIReplacement = `            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button 
                onClick={() => setViewMode('menu')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors shrink-0"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Voltar
              </button>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 sm:w-32"
                >
                  <option value="all">Todos os Meses</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 w-24"
                >
                  <option value="all">Todos</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">`;

code = code.replace(filterUITarget, filterUIReplacement);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
