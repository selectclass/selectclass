import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetDateInput = `<input 
                    type="date" 
                    value={data.date ? (data.date as any).toISOString().split('T')[0] : ''} 
                    onChange={e => {
                      if (!e.target.value) return;
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      const newDate = new Date(y, m - 1, d, 12, 0, 0);
                      setData({...data, date: newDate});
                    }}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                  />`;

const replacementDateInput = `<input 
                    type="text" 
                    placeholder="DD/MM"
                    value={dateText} 
                    onChange={e => {
                      let val = e.target.value.replace(/\\D/g, '');
                      if (val.length >= 4 && val.length < 8 && !e.target.value.endsWith('/')) {
                        val = val.slice(0, 4) + new Date().getFullYear().toString();
                      }
                      if (val.length > 8) val = val.slice(0,8);
                      if (val.length >= 5) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4);
                      else if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
                      
                      setDateText(val);
                      if (val.length === 10) {
                        const [d, m, y] = val.split('/').map(Number);
                        setData({...data, date: new Date(y, m - 1, d, 12, 0, 0)});
                      } else {
                        setData({...data, date: undefined});
                      }
                    }}
                    onBlur={() => {
                      if (dateText.length === 5 && dateText.includes('/')) {
                        const year = new Date().getFullYear();
                        const newDateText = \`\${dateText}/\${year}\`;
                        setDateText(newDateText);
                        const [d, m] = newDateText.split('/').map(Number);
                        setData({...data, date: new Date(year, m - 1, d, 12, 0, 0)});
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                  />`;

code = code.replace(targetDateInput, replacementDateInput);

const targetAdSpendInput = `<input 
                      type="number" 
                      value={data.adSpend || ''} 
                      onChange={e => setData({...data, adSpend: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />`;

const replacementAdSpendInput = `<input 
                      type="text" 
                      value={adSpendText} 
                      onChange={e => {
                        const val = formatCurrencyInput(e.target.value);
                        setAdSpendText(val);
                        setData({...data, adSpend: parseCurrency(val)});
                      }}
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                      placeholder="0,00"
                    />`;

code = code.replace(targetAdSpendInput, replacementAdSpendInput);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
