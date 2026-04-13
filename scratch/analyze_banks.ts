import * as XLSX from 'xlsx';

const files = [
  'd:/Antigravity/FinanceV2/tests/data/HesapOzeti.xls',
  'd:/Antigravity/FinanceV2/tests/data/KrediKarti.xlsx',
];

files.forEach(filePath => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`\n=== ANALYSIS: ${filePath} ===`);
    console.log('Sheet Name:', sheetName);
    console.log('Total Rows:', data.length);
    console.log('--- FIRST 15 ROWS ---');
    data.slice(0, 15).forEach((row, idx) => {
      console.log(`Row ${idx}:`, JSON.stringify(row));
    });
  } catch (error) {
    console.error(`Error reading ${filePath}:`, (error as any).message);
  }
});
