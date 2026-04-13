import * as XLSX from 'xlsx';

const filePath = 'd:/Antigravity/FinanceV2/tests/data/HesapOzeti.xls';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`\n=== ANALYSIS: ${filePath} ===`);
  console.log('Total Rows:', data.length);
  console.log('--- ROWS 15 TO 30 ---');
  data.slice(15, 30).forEach((row: any, idx: number) => {
    console.log(`Row ${idx + 15}:`, JSON.stringify(row));
  });
} catch (error) {
  console.error(`Error reading ${filePath}:`, (error as any).message);
}
