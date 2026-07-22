import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const oldCode = `{months.map((m, i) => (
                        <option key={i} value={i}>{m.slice(0, 3)}</option>
                      ))}`;

const newCode = `{months.map((m, i) => (
                        <option key={i} value={m.value}>{m.label}</option>
                      ))}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
