import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const dateInputTarget = `                <input 
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

const dateInputReplacement = `                <input 
                  type="date" 
                  value={(() => { const d = new Date(data.date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })()} 
                  onChange={e => {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const newDate = new Date(y, m - 1, d, 12, 0, 0);
                    setData({...data, date: newDate});
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-gray-800 dark:text-white"
                />`;

code = code.replace(dateInputTarget, dateInputReplacement);

const listTarget = `                      <p className="text-xs font-bold text-black dark:text-white mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {quote.date.toLocaleDateString('pt-BR')}
                        {quote.endDate ? \` a \${quote.endDate.toLocaleDateString('pt-BR')}\` : ''}
                      </p>`;

const listReplacement = `                      <p className="text-xs font-bold text-black dark:text-white mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {quote.date.toLocaleDateString('pt-BR')}
                        {quote.endDate ? \` a \${quote.endDate.toLocaleDateString('pt-BR')}\` : ''}
                      </p>
                      {quote.date && getTimeLeft(quote.date) && (
                        <p className="text-[10px] font-medium text-gray-500 mt-0.5">{getTimeLeft(quote.date)}</p>
                      )}`;

code = code.replace(listTarget, listReplacement);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
