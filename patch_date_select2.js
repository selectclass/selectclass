import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

code = code.replace('{months.map((m, i) => (\\n                        <option key={i} value={i}>{m.slice(0, 3)}</option>\\n                      ))}', '{months.map((m, i) => (\\n                        <option key={i} value={m.value}>{m.label}</option>\\n                      ))}');

fs.writeFileSync('components/CotacoesScreen.tsx', code);
