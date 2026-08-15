import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetSort = `.sort((a: FailedCotacao, b: FailedCotacao) => new Date(b.date).getTime() - new Date(a.date).getTime());`;
const replacementSort = `.sort((a: FailedCotacao, b: FailedCotacao) => new Date(a.date).getTime() - new Date(b.date).getTime());`;

code = code.replace(targetSort, replacementSort);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
