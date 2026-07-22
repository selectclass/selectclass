import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const listLogicTarget = `  const availableYears = useMemo(() => {
    const years = new Set<number>(failedCotacoes.map((f: FailedCotacao) => new Date(f.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [failedCotacoes]);`;

const listLogicReplacement = `  const availableYears = useMemo(() => {
    const years = new Set<number>(failedCotacoes.map((f: FailedCotacao) => new Date(f.date).getFullYear()));
    const currentYear = new Date().getFullYear();
    const minYear = Math.min(currentYear, ...Array.from(years).length > 0 ? Array.from(years) : [currentYear]);
    for (let y = minYear; y <= 2100; y++) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [failedCotacoes]);`;

code = code.replace(listLogicTarget, listLogicReplacement);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
