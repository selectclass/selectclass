import fs from 'fs';
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace("    await api.put(`${path}/${event.id}`, updatedEv);\n    refreshData();\n  };", "    await api.put(`${path}/${event.id}`, updatedEv);\n    refreshData();\n    setShareData({ isOpen: true, event: { ...updatedEv, date: new Date(updatedEv.date || new Date()) } as any, mode: 'payment' });\n  };");
fs.writeFileSync('App.tsx', code);
