import fs from 'fs';
let code = fs.readFileSync('App.tsx', 'utf8');
const target = `         const updatedEv: CalendarEvent = { 
           ...selectedEventForPayment, 
           payments: [...currentPs, newP], 
           paymentStatus: (currentPs.reduce((s,p)=>s+p.amount,0) + a) >= totalValue ? 'paid' : 'pending' 
         }; 
         await api.put(path + '/' + updatedEv.id, updatedEv); 
         refreshData(); 
         setIsPaymentModalOpen(false);
      }} />`;

const replacement = `         const updatedEv: CalendarEvent = { 
           ...selectedEventForPayment, 
           payments: [...currentPs, newP], 
           paymentStatus: (currentPs.reduce((s,p)=>s+p.amount,0) + a) >= totalValue ? 'paid' : 'pending' 
         }; 
         await api.put(path + '/' + updatedEv.id, updatedEv); 
         refreshData(); 
         setIsPaymentModalOpen(false);
         setShareData({ isOpen: true, event: { ...updatedEv, date: new Date(updatedEv.date || new Date()) } as any, mode: 'payment' });
      }} />`;

code = code.replace("         setIsPaymentModalOpen(false);\n      }} />", "         setIsPaymentModalOpen(false);\n         setShareData({ isOpen: true, event: { ...updatedEv, date: new Date(updatedEv.date || new Date()) } as any, mode: 'payment' });\n      }} />");
fs.writeFileSync('App.tsx', code);
