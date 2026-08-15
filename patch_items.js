import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetBlock = `                  <div className="space-y-3 mb-4 flex-1">
                    {quote.items.filter(i => i.value > 0 || i.description).map(item => (
                      <div key={item.id} className={\`flex justify-between items-center text-sm \${item.included === false ? 'opacity-50' : ''}\`}>
                        <div className="flex items-center gap-2 max-w-[65%]">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={item.included !== false}
                              onChange={async (e) => {
                                const newItems = quote.items.map(i => i.id === item.id ? { ...i, included: e.target.checked } : i);
                                await handleSaveQuote({ ...quote, items: newItems });
                              }}
                            />
                            <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          </label>
                          <span className="text-gray-600 dark:text-gray-300 truncate">
                            {categorias.find(c => c.id === item.categoryId)?.name || 'Outro'} {item.description && <span className="text-gray-400">- {item.description}</span>}
                          </span>
                        </div>
                        <span className={\`font-semibold text-gray-800 dark:text-white \${item.included === false ? 'line-through' : ''}\`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {quote.notes && (
                    <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Observações</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{quote.notes}</p>
                    </div>
                  )}`;

const replacementBlock = `                  <div className="flex-1">
                    {expandedQuotes[quote.id] && (
                      <div className="animate-fade-in">
                        <div className="space-y-3 mb-4">
                          {quote.items.filter(i => i.value > 0 || i.description).map(item => (
                            <div key={item.id} className={\`flex justify-between items-center text-sm \${item.included === false ? 'opacity-50' : ''}\`}>
                              <div className="flex items-center gap-2 max-w-[65%]">
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={item.included !== false}
                                    onChange={async (e) => {
                                      const newItems = quote.items.map(i => i.id === item.id ? { ...i, included: e.target.checked } : i);
                                      await handleSaveQuote({ ...quote, items: newItems });
                                    }}
                                  />
                                  <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                                <span className="text-gray-600 dark:text-gray-300 truncate">
                                  {categorias.find(c => c.id === item.categoryId)?.name || 'Outro'} {item.description && <span className="text-gray-400">- {item.description}</span>}
                                </span>
                              </div>
                              <span className={\`font-semibold text-gray-800 dark:text-white \${item.included === false ? 'line-through' : ''}\`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {quote.notes && (
                          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Observações</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{quote.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => toggleQuote(quote.id)} 
                    className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors w-full mb-4 uppercase tracking-widest"
                  >
                    {expandedQuotes[quote.id] ? 'Ocultar detalhes' : 'Ver detalhes'}
                    <svg className={\`w-3.5 h-3.5 transition-transform \${expandedQuotes[quote.id] ? 'rotate-180' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>`;

code = code.replace(targetBlock, replacementBlock);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
