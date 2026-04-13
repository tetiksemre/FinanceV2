import * as XLSX from 'xlsx';
import * as path from 'path';

const headerKeywords = {
  date: /tarih|tarih\/saat|date/i,
  desc: /açıklama|desc/i,
  amount: /tutar|amount|işlem tutarı/i,
  borc: /borç|debit/i,
  alacak: /alacak|credit/i
};

function findBestHeaderRow(rows: any[][]) {
  let bestRow = rows[0] || [];
  let maxScore = -1;
  let bestIdx = 0;
  
  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const row = rows[i];
    if (!row) continue;
    
    let score = 0;
    if (row.some(c => headerKeywords.date.test(String(c)))) score++;
    if (row.some(c => headerKeywords.desc.test(String(c)))) score++;
    if (row.some(c => headerKeywords.amount.test(String(c)))) score++;
    if (row.some(c => headerKeywords.borc.test(String(c)))) score++;
    if (row.some(c => headerKeywords.alacak.test(String(c)))) score++;
    
    if (score > maxScore) {
      maxScore = score;
      bestRow = row;
      bestIdx = i;
    }
    if (score >= 3) break;
  }
  return { bestRow, bestIdx, maxScore };
}

async function testFix() {
    const xlsPath = path.resolve('tests/data/HesapOzeti.xls');
    const workbook = XLSX.readFile(xlsPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    const { bestRow, bestIdx, maxScore } = findBestHeaderRow(rows);
    console.log(`Best Header Row found at index ${bestIdx} with score ${maxScore}`);
    console.log(`Content: ${JSON.stringify(bestRow)}`);

    const dateIdx = bestRow.findIndex((h: any) => headerKeywords.date.test(String(h)));
    const descIdx = bestRow.findIndex((h: any) => headerKeywords.desc.test(String(h)));
    const amountIdx = bestRow.findIndex((h: any) => headerKeywords.amount.test(String(h)));

    console.log(`Indices -> Date: ${dateIdx}, Desc: ${descIdx}, Amount: ${amountIdx}`);
}

testFix().catch(console.error);
