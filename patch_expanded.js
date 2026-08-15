import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetState = `  const [showAllDates, setShowAllDates] = useState(false);`;
const replacementState = `  const [showAllDates, setShowAllDates] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});
  
  const toggleQuote = (id: string) => {
    setExpandedQuotes(prev => ({ ...prev, [id]: !prev[id] }));
  };`;
code = code.replace(targetState, replacementState);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
