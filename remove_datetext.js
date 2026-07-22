import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

code = code.replace("  const [dateText, setDateText] = useState('');\n", "");

const targetHandleEdit = `    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    setDateText(\`\${day}/\${month}/\${year}\`);
    setAdSpendText(f.adSpend ? formatCurrencyInput(f.adSpend) : '');
  };`;

const replacementHandleEdit = `    setAdSpendText(f.adSpend ? formatCurrencyInput(f.adSpend) : '');
  };`;

code = code.replace(targetHandleEdit, replacementHandleEdit);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
