import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetDateInput = `                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data da Tentativa</label>
                  <input 
                    type="date" 
                    value={data.date ? (data.date as any).toISOString().split('T')[0] : ''} 
                    onChange={e => {
                      if (!e.target.value) {
                        setData({...data, date: undefined});
                        return;
                      }
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      const newDate = new Date(y, m - 1, d, 12, 0, 0);
                      setData({...data, date: newDate});
                    }}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                  />
                </div>`;

const replacementDateInput = `                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data da Tentativa</label>
                  <div className="flex gap-2">
                    <select
                      value={data.date ? (data.date as Date).getMonth() : new Date().getMonth()}
                      onChange={e => {
                        const m = Number(e.target.value);
                        const y = data.date ? (data.date as Date).getFullYear() : new Date().getFullYear();
                        setData({...data, date: new Date(y, m, 1, 12, 0, 0)});
                      }}
                      className="w-1/2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    >
                      {months.map((m, i) => (
                        <option key={i} value={i}>{m.slice(0, 3)}</option>
                      ))}
                    </select>
                    <select
                      value={data.date ? (data.date as Date).getFullYear() : new Date().getFullYear()}
                      onChange={e => {
                        const y = Number(e.target.value);
                        const m = data.date ? (data.date as Date).getMonth() : new Date().getMonth();
                        setData({...data, date: new Date(y, m, 1, 12, 0, 0)});
                      }}
                      className="w-1/2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-800 dark:text-white"
                    >
                      {Array.from({ length: 2100 - new Date().getFullYear() + 1 }, (_, i) => new Date().getFullYear() + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>`;

code = code.replace(targetDateInput, replacementDateInput);

const targetBtnAdd = `onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}`;
const replacementBtnAdd = `onClick={() => { setViewMode('add'); setData({ date: new Date() }); setEditingId(null); setAdSpendText(''); }}`;

code = code.replace(targetBtnAdd, replacementBtnAdd);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
