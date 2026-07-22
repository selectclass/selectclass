import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetState = `const FailedCotacoesModal = ({ isOpen, onClose, failedCotacoes, onSave, onDelete, generateId }: any) => {
  const [data, setData] = useState<Partial<FailedCotacao>>({});
  const [editingId, setEditingId] = useState<string | null>(null);`;

const replacementState = `const FailedCotacoesModal = ({ isOpen, onClose, failedCotacoes, onSave, onDelete, generateId }: any) => {
  const [data, setData] = useState<Partial<FailedCotacao>>({});
  const [dateText, setDateText] = useState('');
  const [adSpendText, setAdSpendText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);`;

code = code.replace(targetState, replacementState);

const targetHandleEdit = `  const handleEdit = (f: FailedCotacao) => {
    setViewMode('add');
    setEditingId(f.id);
    const d = new Date(f.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    setData({
      name: f.name,
      date: d,
      adSpend: f.adSpend,
      createdAt: f.createdAt
    });
  };`;

const replacementHandleEdit = `  const handleEdit = (f: FailedCotacao) => {
    setViewMode('add');
    setEditingId(f.id);
    const d = new Date(f.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    setData({
      name: f.name,
      date: d,
      adSpend: f.adSpend,
      createdAt: f.createdAt
    });
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    setDateText(\`\${day}/\${month}/\${year}\`);
    setAdSpendText(f.adSpend ? formatCurrencyInput(f.adSpend) : '');
  };`;

code = code.replace(targetHandleEdit, replacementHandleEdit);

const targetBtnAdd = `onClick={() => { setViewMode('add'); setData({}); setEditingId(null); }}`;
const replacementBtnAdd = `onClick={() => { setViewMode('add'); setData({}); setEditingId(null); setDateText(''); setAdSpendText(''); }}`;

code = code.replace(targetBtnAdd, replacementBtnAdd);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
