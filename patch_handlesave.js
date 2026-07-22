import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetSave = `    await onSave(finalData);
    setData({});
    setEditingId(null);
    setViewMode('history'); // Go to history to see the added item
  };`;

const replacementSave = `    await onSave(finalData);
    setFilterYear(finalData.date.getFullYear());
    setFilterMonth(finalData.date.getMonth());
    setData({});
    setEditingId(null);
    setViewMode('history'); // Go to history to see the added item
  };`;

code = code.replace(targetSave, replacementSave);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
