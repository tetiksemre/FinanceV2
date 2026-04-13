import * as XLSX from 'xlsx';
import path from 'path';

const filePath = 'd:/Antigravity/FinanceV2/tests/data/Enpara.com hesap hareketleriniz.xls';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('=== ENPARA XLS ANALYSIS ===');
  console.log('Sheet Name:', sheetName);
  console.log('Total Rows:', data.length);
  console.log('\n--- FIRST 20 ROWS ---');
  data.slice(0, 20).forEach((row, idx) => {
    console.log(`Row ${idx}:`, JSON.stringify(row));
  });
} catch (error) {
  console.error('Error reading XLS:', error);
}
