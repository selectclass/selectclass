import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const listLogicTarget = `  const availableYears = useMemo(() => {
    const years = new Set(failedCotacoes.map((f: FailedCotacao) => new Date(f.date).getFullYear()));`;

const listLogicReplacement = `  const availableYears = useMemo(() => {
    const years = new Set<number>(failedCotacoes.map((f: FailedCotacao) => new Date(f.date).getFullYear()));`;

code = code.replace(listLogicTarget, listLogicReplacement);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
