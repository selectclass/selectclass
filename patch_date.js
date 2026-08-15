import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetStr = '<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">';
const replacementStr = '<p className="text-xs font-bold text-black dark:text-white mt-1 flex items-center gap-1">';

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
