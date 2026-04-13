const XLSX = require('xlsx');
const path = require('path');

try {
    const workbook = XLSX.readFile('tests/data/HesapOzeti.xls');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log("Row 15:", JSON.stringify(rows[15]));
    console.log("Row 16:", JSON.stringify(rows[16]));
    console.log("Row 17:", JSON.stringify(rows[17]));
} catch (e) {
    console.log("Error reading file:", e.message);
}
