import fs from 'fs';
const code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');
console.log(code.includes("dateText"));
