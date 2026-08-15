import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const helperCodeOld = `  return \`(\${parts.join(' e ')})\`;
};`;

const helperCodeNew = `  return \`(Faltam \${parts.join(' e ')})\`;
};`;

code = code.replace(helperCodeOld, helperCodeNew);

const dateInputTarget = `                <input 
                  type="date" 
                  value={(() => { const d = new Date(data.date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })()} 
                  onChange={e => {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const newDate = new Date(y, m - 1, d, 12, 0, 0);
                    setData({...data, date: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />`;

const dateInputReplacement = `                <input 
                  type="date" 
                  value={(() => { const d = new Date(data.date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })()} 
                  onChange={e => {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const newDate = new Date(y, m - 1, d, 12, 0, 0);
                    setData({...data, date: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />
                {data.date && getTimeLeft(data.date) && (
                  <p className="mt-1 text-sm text-gray-500 font-medium">{getTimeLeft(data.date)}</p>
                )}`;

code = code.replace(dateInputTarget, dateInputReplacement);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
