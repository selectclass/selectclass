import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetDateInput = `                    onChange={e => {
                      let val = e.target.value.replace(/\\D/g, '');
                      if (val.length >= 4 && val.length < 8 && !e.target.value.endsWith('/')) {
                        val = val.slice(0, 4) + new Date().getFullYear().toString();
                      }
                      if (val.length > 8) val = val.slice(0,8);
                      if (val.length >= 5) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4);
                      else if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);`;

const replacementDateInput = `                    onChange={e => {
                      let val = e.target.value.replace(/\\D/g, '');
                      
                      if (val.length > 8) val = val.slice(0,8);
                      if (val.length >= 5) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4);
                      else if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);`;

code = code.replace(targetDateInput, replacementDateInput);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
