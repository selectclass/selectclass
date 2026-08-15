import fs from 'fs';
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(/refreshData\(\);\s+setIsPaymentModalOpen\(false\);\s+\}\}\s*\/>/, "refreshData();\n         setIsPaymentModalOpen(false);\n         setShareData({ isOpen: true, event: { ...updatedEv, date: new Date(updatedEv.date || new Date()) } as any, mode: 'payment' });\n      }} />");

fs.writeFileSync('App.tsx', code);
