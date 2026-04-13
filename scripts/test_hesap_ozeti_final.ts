import * as XLSX from 'xlsx';
import * as path from 'path';

// Exact replication of logic from src/lib/parser.ts
const normalizeDescription = (desc: string): string => {
  if (!desc) return 'No Description';
  let clean = desc.trim();
  clean = clean.replace(/\|/g, ' ').replace(/\s+/g, ' ');
  return clean;
};

const parseAmountValue = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim();
  let multiplier = 1;
  if (str.endsWith('-')) { multiplier = -1; str = str.slice(0, -1); }
  else if (str.endsWith('+')) { multiplier = 1; str = str.slice(0, -1); }
  let cleanStr = str.replace(/[^-0-9,.]/g, '');
  if (cleanStr.includes(',') && cleanStr.includes('.')) {
    if (cleanStr.indexOf(',') < cleanStr.lastIndexOf('.')) cleanStr = cleanStr.replace(/,/g, '');
    else cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
  } else if (cleanStr.includes(',')) {
    if (/,(\d{1,2})$/.test(cleanStr)) cleanStr = cleanStr.replace(',', '.');
    else cleanStr = cleanStr.replace(/,/g, '');
  }
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed * multiplier;
};

const parseDate = (str: string): string => {
  if (!str) return new Date().toISOString();
  let d: Date;
  if (str.includes('/')) {
      const [day, month, year] = str.split('/').map(Number);
      d = new Date(year, month - 1, day);
  } else if (str.includes('.')) {
      const [day, month, year] = str.split('.').map(Number);
      d = new Date(year, month - 1, day);
  } else {
      d = new Date(str);
  }
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

async function testCurrentParser() {
    const filePath = path.resolve('tests/data/HesapOzeti.xls');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // isHesapOzeti logic
    const isHesapOzeti = rows.some(r => r.includes('HESAP ÖZETİ'));
    console.log('isHesapOzeti:', isHesapOzeti);

    if (isHesapOzeti) {
      const dataRows = rows.filter(r => r.length >= 9 && /\d{2}\/\d{2}\/\d{4}/.test(String(r[0])));
      console.log('Data Rows Found:', dataRows.length);
      
      const transactions = dataRows.map(r => {
        const amount = parseAmountValue(r[3]);
        return {
          date: parseDate(String(r[1])),
          description: normalizeDescription(String(r[8])),
          amount: Math.abs(amount),
          type: amount >= 0 ? 'INCOME' : 'EXPENSE'
        };
      });

      console.log('Sample Transactions [0-2]:');
      console.log(JSON.stringify(transactions.slice(0, 3), null, 2));

      // Verify some interesting rows (income vs expense)
      const incomes = transactions.filter(t => t.type === 'INCOME');
      console.log('Income count:', incomes.length);
      if (incomes.length > 0) {
          console.log('Sample Income:', JSON.stringify(incomes[0], null, 2));
      }
    }
}

testCurrentParser().catch(console.error);
