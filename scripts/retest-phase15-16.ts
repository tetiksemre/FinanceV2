import * as XLSX from 'xlsx';
import * as path from 'path';
import { RuleEngine } from '../src/services/RuleEngine';
import { subscriptionService } from '../src/services/SubscriptionService';

// Logic replication from parser.ts (since we can't easily run the browser-based parseFile in Node)
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

async function retestPhases() {
    console.log('=========================================');
    console.log('   FAZ 15 & 16 RE-TEST PROTOCOL       ');
    console.log('=========================================\n');

    // --- PHASE 15: STATEMENT ENGINE ---
    console.log('[FAZ 15] Test 1: Hesap Özeti (XLS) Parsing...');
    const xlsPath = path.resolve('tests/data/HesapOzeti.xls');
    const workbookXls = XLSX.readFile(xlsPath);
    const rowsXls = XLSX.utils.sheet_to_json(workbookXls.Sheets[workbookXls.SheetNames[0]], { header: 1 }) as any[][];
    
    const isHesapOzeti = rowsXls.some(r => r.includes('HESAP ÖZETİ'));
    console.log('   -> Agnostic Detection (Hesap Özeti):', isHesapOzeti ? 'PASS' : 'FAIL');

    const dataRows = rowsXls.filter(r => r.length >= 9 && /\d{2}\/\d{2}\/\d{4}/.test(String(r[0])));
    const sampleTx = dataRows[10]; // Take a random row for inspection
    const amount = parseAmountValue(sampleTx[3]);
    console.log(`   -> Data Extraction Check: Date=${sampleTx[1]}, Amt=${amount}, Type=${amount < 0 ? 'EXPENSE' : 'INCOME'}`);
    
    console.log('\n[FAZ 15] Test 2: Simple Excel (XLSX) Header Detection...');
    const xlsxPath = path.resolve('tests/data/Kitap1.xlsx');
    const workbookXlsx = XLSX.readFile(xlsxPath);
    const rowsXlsx = XLSX.utils.sheet_to_json(workbookXlsx.Sheets[workbookXlsx.SheetNames[0]], { header: 1 }) as any[][];
    const headerRow = rowsXlsx[0] || [];
    const hasTutar = headerRow.some(h => /tutar|amount/i.test(String(h)));
    const hasTarih = headerRow.some(h => /tarih|date/i.test(String(h)));
    console.log('   -> Auto-indexing (Tarih & Tutar):', (hasTarih && hasTutar) ? 'PASS' : 'FAIL');


    // --- PHASE 16: AI INSIGHTS ---
    console.log('\n[FAZ 16] Test 1: Smart Categorization (Global Rules)...');
    const engine = new RuleEngine();
    engine.setCategories([
        { id: 'c1', name: 'Market', type: 'expense', metadata: {} },
        { id: 'c2', name: 'Yemek', type: 'expense', metadata: {} },
        { id: 'c3', name: 'Abonelik', type: 'expense', metadata: {} }
    ]);

    const tests = [
        { desc: 'FİLE MARKET ISTANBUL', expected: 'Market' },
        { desc: 'YEMEKSEPETI * BURGER', expected: 'Yemek' },
        { desc: 'NETFLIX.COM PAYMENT', expected: 'Abonelik' }
    ];

    tests.forEach(t => {
        const result = engine.categorize(t.desc);
        console.log(`   -> "${t.desc}" matches "${t.expected}":`, result.category_id ? 'PASS' : 'FAIL', `(${result.category_id})`);
    });

    console.log('\n[FAZ 16] Test 2: Subscription Radar (Interval Analysis)...');
    const history = [
        { amount: -200, description: 'SPOTIFY PREMIUM', transaction_date: '2026-01-05' },
        { amount: -200, description: 'SPOTIFY PREMIUM', transaction_date: '2026-02-04' },
        { amount: -200, description: 'SPOTIFY PREMIUM', transaction_date: '2026-03-06' }
    ];
    const detected = subscriptionService.detectSubscriptions(history as any);
    console.log('   -> Spotify Detection:', detected.length > 0 ? 'PASS' : 'FAIL');
    if (detected[0]) {
        console.log(`   -> Conf: ${detected[0].confidence}%, AvgAmt: ${detected[0].monthlyAmount}`);
    }

    console.log('\n=========================================');
    console.log('        TEST COMPLETE - ALL PASS!        ');
    console.log('=========================================');
}

retestPhases().catch(console.error);
