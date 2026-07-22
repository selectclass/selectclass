import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

code = code.replace('Locais Testados', 'Estados Testados');
code = code.replace('Locais Testados', 'Estados Testados');
code = code.replace('Relatório de locais testados sem sucesso', 'Relatório de estados testados sem sucesso');
code = code.replace('Adicionar Local', 'Adicionar Estado');
code = code.replace('Cadastre um novo local testado sem sucesso.', 'Cadastre um novo estado testado sem sucesso.');
code = code.replace('Nome do Local', 'Nome do Estado');
code = code.replace('Ex: Centro de Convenções XYZ', 'Ex: São Paulo, Rio de Janeiro');
code = code.replace('Veja todos os locais que já foram testados.', 'Veja todos os estados que já foram testados.');
code = code.replace('Nenhum local marcado como testado.', 'Nenhum estado marcado como testado.');

fs.writeFileSync('components/CotacoesScreen.tsx', code);
