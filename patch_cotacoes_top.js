import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const helper = `const getTimeLeft = (targetDate: Date | string) => {
  if (!targetDate) return '';
  const now = new Date();
  now.setHours(0,0,0,0);
  const target = new Date(targetDate);
  target.setHours(0,0,0,0);
  
  if (target.getTime() < now.getTime()) return '';
  
  let months = target.getMonth() - now.getMonth() + (12 * (target.getFullYear() - now.getFullYear()));
  let days = target.getDate() - now.getDate();
  
  if (days < 0) {
    months--;
    const previousMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += previousMonth.getDate();
  }
  
  if (months === 0 && days === 0) return '(Hoje)';
  
  const parts = [];
  if (months > 0) parts.push(\`\${months} \${months === 1 ? 'mês' : 'meses'}\`);
  if (days > 0) parts.push(\`\${days} \${days === 1 ? 'dia' : 'dias'}\`);
  
  return \`(\${parts.join(' e ')})\`;
};

interface CotacoesScreenProps`;

code = code.replace("interface CotacoesScreenProps", helper);
fs.writeFileSync('components/CotacoesScreen.tsx', code);
