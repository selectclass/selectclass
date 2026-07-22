import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetSave = `  const handleSaveFailedQuote = async (failedQuote: FailedCotacao) => {
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
  };`;

const replacementSave = `  const handleSaveFailedQuote = async (failedQuote: FailedCotacao) => {
    await api.put(\`v1/data/failedCotacoes/\${failedQuote.id}\`, {
      ...failedQuote,
      date: failedQuote.date.toISOString(),
      createdAt: failedQuote.createdAt.toISOString()
    });
    await fetchData();
  };

  const handleDeleteFailedQuote = async (id: string) => {
    await api.delete(\`v1/data/failedCotacoes/\${id}\`);
    await fetchData();
  };`;

code = code.replace(targetSave, replacementSave);

const targetState = `  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');`;

const replacementState = `  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all');
  const [filterYear, setFilterYear] = useState<number | 'all'>(new Date().getFullYear());`;

code = code.replace(targetState, replacementState);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
