import * as pdfjsLib from 'pdfjs-dist';
import * as fs from 'fs';

// Helper to simulate parseAmountValue from parser.ts
const parseAmountValue = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  
  let multiplier = 1;
  if (str.endsWith('-')) { multiplier = -1; str = str.slice(0, -1); }
  else if (str.endsWith('+')) { multiplier = 1; str = str.slice(0, -1); }
  // Handle leading minus with space: "- 53.179,46"
  if (str.startsWith('-')) { multiplier = -1; str = str.slice(1).trim(); }

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

const normalizeDescription = (desc: string): string => {
  if (!desc) return 'No Description';
  return desc.trim().replace(/\s+/g, ' ');
};

async function testExtraction(filePath: string) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }

  const rowRegex = /(\d{2}[\/.]\d{2}[\/.]\d{4})\s{2,}(.+?)\s{2,}(-?\s?[\d.]+,\d{2})\b/g;
  let match;
  const transactions = [];
  const EXCLUDE_KEYWORDS = [
    'BİR ÖNCEKİ HESAP ÖZETİ',
    'BIR ONCEKI HESAP OZETI',
    'HESAP ÖZETİ BORCU',
    'HESAP OZETI BORCU',
    'SON ÖDEME TARİHİ',
    'SON ODEME TARIHI',
    'ASGARİ ÖDEME',
    'ASGARI ODEME',
    'HESAP KESİM TARİHİ',
    'HESAP KESIM TARIHI',
    'TOPLAM MAXİPUAN',
    'TOPLAM MAXIPUAN',
    'MÜŞTERİ NUMARASI',
    'MUSTERI NUMARASI',
    'KART NUMARASI',
    'ÖDENMESİ GEREKEN',
    'ODENMESI GEREKEN',
    'BİR SONRAKİ',
    'BIR SONRAKI'
  ];

  while ((match = rowRegex.exec(fullText)) !== null) {
    const [, dateStr, desc, amountStr] = match;
    const upperDesc = desc.toUpperCase();
    if (EXCLUDE_KEYWORDS.some(kw => upperDesc.includes(kw))) continue;
    
    const amount = parseAmountValue(amountStr);
    transactions.push({
      date: dateStr,
      description: normalizeDescription(desc),
      amount: amount
    });
  }

  console.log(`Found ${transactions.length} transactions:\n`);
  console.table(transactions);
  
  const total = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  console.log(`\nTotal Amount: ${total.toFixed(2)}`);
}

const pdfPath = process.argv[2] || 'tests/data/SubatIsKredK.pdf';
testExtraction(pdfPath).catch(console.error);
