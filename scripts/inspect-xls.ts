import * as XLSX from 'xlsx';
import * as path from 'path';

async function inspectXls() {
    const xlsPath = path.resolve('tests/data/HesapOzeti.xls');
    const workbook = XLSX.readFile(xlsPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    const header = rows.find(r => r.some(c => String(c).includes('Açıklama') || String(c).includes('AÇIKLAMA')));
    console.log('Actual Header Row Index:', rows.indexOf(header!));
    console.log('Actual Header Row:', JSON.stringify(header));
}

inspectXls().catch(console.error);
