import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');
code = code.replace(/lectureModels,\s*targetCotacaoId,\s*onClearTargetCotacao=\{lectureModels,\s*targetCotacaoId,\s*onClearTargetCotacao\}/g, 'lectureModels={lectureModels}');
fs.writeFileSync('components/CotacoesScreen.tsx', code);
