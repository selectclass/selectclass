import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

code = code.replace(
  "const [filterYear, setFilterYear] = useState<number | 'all'>(new Date().getFullYear());",
  "const [filterYear, setFilterYear] = useState<number | 'all'>('all');"
);

code = code.replace(
  "    setFilterYear(finalData.date.getFullYear());\n    setFilterMonth(finalData.date.getMonth());\n",
  ""
);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
