export const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const formatCurrencyInput = (value: string | number): string => {
  if (value === undefined || value === null || value === '') return '';
  
  let digits = '';
  if (typeof value === 'number') {
    digits = value.toFixed(2).replace(/\D/g, '');
  } else {
    // If it's just a single character and not a number, ignore it
    if (value.length === 1 && !/\d/.test(value)) return '';
    digits = value.replace(/\D/g, '');
  }
  
  if (digits === '') return '';
  
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
