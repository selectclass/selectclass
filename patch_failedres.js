import fs from 'fs';
let code = fs.readFileSync('components/CotacoesScreen.tsx', 'utf8');

const targetQuotesRes = `      if (quotesRes) {
        const parsedQuotes = Object.values(quotesRes).map((q: any) => ({
          ...q,
          date: new Date(q.date),
          endDate: q.endDate ? new Date(q.endDate) : undefined,
          createdAt: new Date(q.createdAt),
          items: q.items || []
        }));
        setCotacoes(parsedQuotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }`;

const replacementQuotesRes = `      if (quotesRes) {
        const parsedQuotes = Object.values(quotesRes).map((q: any) => ({
          ...q,
          date: new Date(q.date),
          endDate: q.endDate ? new Date(q.endDate) : undefined,
          createdAt: new Date(q.createdAt),
          items: q.items || []
        }));
        setCotacoes(parsedQuotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
      
      if (failedRes) {
        const parsedFailed = Object.values(failedRes).map((f: any) => ({
          ...f,
          date: new Date(f.date),
          createdAt: new Date(f.createdAt)
        }));
        setFailedCotacoes(parsedFailed.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()));
      } else {
        setFailedCotacoes([]);
      }`;

code = code.replace(targetQuotesRes, replacementQuotesRes);

fs.writeFileSync('components/CotacoesScreen.tsx', code);
