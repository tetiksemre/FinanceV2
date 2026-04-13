import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

export interface ParseResult {
  transactions: RawTransaction[];
  adapterName: string;
  inferredType: 'ACCOUNT' | 'CARD' | 'UNKNOWN';
}

export interface BankMapping {
  bankName: string;
  formatType: 'CARD' | 'ACCOUNT';
  columnMap: {
    date: string;
    description: string;
    amount: string;
  };
}

/**
 * Common normalization utilities
 */
const normalizeDescription = (desc: string): string => {
  if (!desc) return 'No Description';
  let clean = desc.trim();
  clean = clean.replace(/\|/g, ' ').replace(/\s+/g, ' ');

  // Basic auto-mapping
  if (clean.includes('AMZN') || clean.includes('Amazon')) return 'Amazon';
  if (clean.includes('MIGROS')) return 'Migros';
  if (clean.includes('NETFLIX')) return 'Netflix';
  if (clean.includes('SPOTIFY')) return 'Spotify';

  return clean;
};

const parseAmountValue = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  
  // Handle İş Bankası signs at end (e.g. 100.00-)
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

/**
 * Adapter Interface
 */
interface BankAdapter {
  name: string;
  canHandle(headers: string[], content: string): boolean;
  inferType(headers: string[], content: string): 'ACCOUNT' | 'CARD' | 'UNKNOWN';
  parseExcel(rows: any[][]): RawTransaction[];
  parsePDF(text: string): RawTransaction[];
}

/**
 * Registry Pattern for Bank Adapters
 */
class AdapterRegistry {
  private static adapters: BankAdapter[] = [];

  static register(adapter: BankAdapter) {
    this.adapters.push(adapter);
  }

  static findAdapter(headers: string[], content: string, fileName: string): BankAdapter {
    // Try to find a specialized adapter
    const adapter = this.adapters.find(a => a.canHandle(headers, content));
    if (adapter) return adapter;

    // Fallback: Infer from filename/keywords if possible
    const searchStr = (fileName + ' ' + headers.join(' ') + ' ' + content).toUpperCase();
    if (searchStr.includes('ENPARA')) return this.adapters.find(a => a.name === 'Enpara') || this.adapters[0];
    if (searchStr.includes('İŞ BANK') || searchStr.includes('ISBANK')) return this.adapters.find(a => a.name === 'İş Bankası') || this.adapters[0];

    // Düzeltme 6: Bilinen adaptOr bulunamazsa GenericExcelAdapter kullanılr (Faz 15.19)
    return this.adapters.find(a => a.name === 'Generic') || this.adapters[0];
  }
}

/**
 * İş Bankası Adapter
 */
class IsBankasiAdapter implements BankAdapter {
  name = 'İş Bankası';
  
  inferType(headers: string[], content: string): 'ACCOUNT' | 'CARD' | 'UNKNOWN' {
    const searchStr = (headers.join(' ') + ' ' + content).toUpperCase();
    // Hata 4 Düzeltmesi: HESAP ÖZETİ bir banka hesabı özeti belgesidir, kredi kartı (CARD) değil.
    // Kredi kartı ekstreleri ayrı bir formatta gelir — KREDİ KARTI veya KART EKSTRESI içerir.
    if (searchStr.includes('KREDİ KARTI') || searchStr.includes('KART EKSTRESİ')) return 'CARD';
    if (searchStr.includes('HESAP ÖZETİ') || searchStr.includes('HESAP HAREKETLERİ')) return 'ACCOUNT';
    return 'UNKNOWN';
  }

  canHandle(headers: string[], content: string): boolean {
    const searchStr = (headers.join(' ') + ' ' + content).toUpperCase();
    return searchStr.includes('İŞ BANKASI') || 
           searchStr.includes('İşBank') || 
           searchStr.includes('HESAP ÖZETİ') || 
           searchStr.includes('İŞLEM TARİHİ');
  }

  parseExcel(rows: any[][]): RawTransaction[] {
    const headerKeywords = {
      date: /[tT][aA][rR][iİıI][hH]|date/i,
      desc: /[aA]çıklama|[aA]ciklama|desc/i,
      amount: /tutar|amount|işlem tutarı|islem tutari/i,
      borc: /borç|borc|debit/i,
      alacak: /alacak|credit/i
    };

    const findBestHeaderRow = (rows: any[][]) => {
      let bestRow = rows[0] || [];
      let maxScore = -1;
      for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const row = rows[i];
        if (!row) continue;
        let score = 0;
        if (row.some(c => headerKeywords.date.test(String(c)))) score++;
        if (row.some(c => headerKeywords.desc.test(String(c)))) score++;
        if (row.some(c => headerKeywords.amount.test(String(c)))) score++;
        if (score > maxScore) {
          maxScore = score;
          bestRow = row;
        }
        if (score >= 3) break;
      }
      return bestRow;
    };

    const headerRow = findBestHeaderRow(rows);
    const dateIdx = headerRow.findIndex((h: any) => headerKeywords.date.test(String(h)));
    const descIdx = headerRow.findIndex((h: any) => headerKeywords.desc.test(String(h)));
    const amountIdx = headerRow.findIndex((h: any) => headerKeywords.amount.test(String(h)));
    const borcIdx = headerRow.findIndex((h: any) => headerKeywords.borc.test(String(h)));
    const alacakIdx = headerRow.findIndex((h: any) => headerKeywords.alacak.test(String(h)));

    const parseRow = (r: any[]) => {
      let amount = 0;
      if (alacakIdx !== -1 && borcIdx !== -1) {
        amount = Math.abs(parseAmountValue(r[alacakIdx])) - Math.abs(parseAmountValue(r[borcIdx]));
      } else if (amountIdx !== -1) {
        amount = parseAmountValue(r[amountIdx]);
      } else if (alacakIdx !== -1) {
        amount = Math.abs(parseAmountValue(r[alacakIdx]));
      } else if (borcIdx !== -1) {
        amount = -Math.abs(parseAmountValue(r[borcIdx]));
      }

      return {
        date: this.parseDate(r[dateIdx]),
        description: normalizeDescription(String(r[descIdx] || '')),
        amount: amount,
        type: (amount >= 0 ? 'INCOME' : 'EXPENSE') as 'INCOME' | 'EXPENSE'
      };
    };

    // Hesap Özeti (XLS) specific logic
    if (rows.some(r => r.some(c => String(c).includes('HESAP ÖZETİ')))) {
      const dataRows = rows.filter(r => r.length >= 9 && /\d{2}[/.-]\d{2}[/.-]\d{2,4}/.test(String(r[0])));
      return dataRows.map(parseRow).filter(tx => !!tx.date && !isNaN(tx.amount));
    }

    const startIdx = rows.indexOf(headerRow) + 1;
    return rows.slice(startIdx).map(parseRow).filter(tx => !!tx.date && !isNaN(tx.amount));
  }

  parsePDF(text: string): RawTransaction[] {
    const transactions: RawTransaction[] = [];
    // Regex for IsBank: DD/MM/YYYY or DD.MM.YYYY Description Amount
    // Robust pattern for Credit Card statements:
    // Date (\s+) Desc (\s{2,}) Amount (Optional Taksit/Maxipuan)
    // We use \s+ after date because some months (e.g. Mart) only have 1 space before Description.
    // We use \s{2,} before the Amount to prevent greedy matching if description contains numbers.
    const rowRegex = /(\d{2}[\/.]\d{2}[\/.]\d{4})\s+(.+?)\s{2,}(-?\s?[\d.]+,\d{2})\b/g;
    let match;
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

    while ((match = rowRegex.exec(text)) !== null) {
      const [, dateStr, desc, amountStr] = match;
      
      const upperDesc = desc.toUpperCase();
      if (EXCLUDE_KEYWORDS.some(kw => upperDesc.includes(kw))) continue;

      const parsedAmount = parseAmountValue(amountStr);
      transactions.push({
        date: this.parseDate(dateStr),
        description: normalizeDescription(desc),
        amount: parsedAmount,
        type: parsedAmount >= 0 ? 'INCOME' : 'EXPENSE'
      });
    }

    // Fallback for older PDF formats if no matches found
    if (transactions.length === 0) {
      const oldRegex = /(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+([\d,.]+[+-])/g;
      while ((match = oldRegex.exec(text)) !== null) {
        const [, dateStr, desc, amountStr] = match;
        const parsedAmount = parseAmountValue(amountStr);
        transactions.push({
          date: this.parseDate(dateStr),
          description: normalizeDescription(desc),
          amount: parsedAmount,
          type: parsedAmount >= 0 ? 'INCOME' : 'EXPENSE'
        });
      }
    }

    return transactions;
  }

  private parseDate(input: any): string {
    if (!input) return new Date().toISOString();
    let d: Date;
    const str = String(input).trim();
    // Support DD/MM/YYYY-HH:mm:ss
    const datePart = str.split('-')[0].trim();
    const dateMatch = datePart.match(/(\d{1,4})[./-](\d{2})[./-](\d{2,4})/);
    
    if (dateMatch) {
      let [, p1, p2, p3] = dateMatch;
      let day, month, year;
      if (p1.length === 4) { [year, month, day] = [Number(p1), Number(p2), Number(p3)]; }
      else { [day, month, year] = [Number(p1), Number(p2), Number(p3)]; }
      if (year < 100) year += year < 50 ? 2000 : 1900;
      d = new Date(year, month - 1, day);
    } else {
      d = new Date(str);
    }

    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
}

/**
 * Enpara Adapter
 */
class EnparaAdapter implements BankAdapter {
  name = 'Enpara';

  inferType(headers: string[], content: string): 'ACCOUNT' | 'CARD' | 'UNKNOWN' {
    const searchStr = (headers.join(' ') + ' ' + content).toUpperCase();
    if (searchStr.includes('KREDİ KARTI') || searchStr.includes('KREDİKARTI')) return 'CARD';
    if (searchStr.includes('VADESİZ HESAP') || searchStr.includes('HESAP HAREKET')) return 'ACCOUNT';
    return 'UNKNOWN';
  }

  canHandle(headers: string[], content: string): boolean {
    const searchStr = (headers.join(' ') + ' ' + content).toUpperCase();
    return searchStr.includes('ENPARA') || 
           searchStr.includes('QNB FINANSBANK') ||
           searchStr.includes('QNB BANK');
  }

  parseExcel(rows: any[][]): RawTransaction[] {
    // Enpara XLS: Data usually starts after line 10
    const headerRow = rows.find(r => r.some(c => String(c).includes('Tarih') && r.some(c => String(c).includes('Açıklama'))));
    if (!headerRow) return [];

    const dateIdx = headerRow.indexOf('Tarih');
    const descIdx = headerRow.indexOf('Açıklama');
    const amountIdx = headerRow.findIndex((c: any) => String(c).includes('İşlem Tutarı'));

    if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) return [];

    const startIdx = rows.indexOf(headerRow) + 1;
    return rows.slice(startIdx)
      .filter(r => r[dateIdx] && r[amountIdx] !== undefined)
      .map(r => {
        const amount = parseAmountValue(r[amountIdx]);
        return {
          date: this.parseDate(r[dateIdx]),
          description: normalizeDescription(String(r[descIdx] || '')),
          amount: amount,
          type: (amount >= 0 ? 'INCOME' : 'EXPENSE') as 'INCOME' | 'EXPENSE'
        };
      });
  }

  parsePDF(text: string): RawTransaction[] {
    const transactions: RawTransaction[] = [];
    // Pattern: DD/MM/YYYY Description (- )Amount TL (Note: prefix - for expense/payment)
    const rowRegex = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s?[\d.,]+)\s?TL/g;
    let match;
    while ((match = rowRegex.exec(text)) !== null) {
      const [, dateStr, desc, amountStr] = match;
      const parsedAmount = parseAmountValue(amountStr.replace(/\s/g, ''));
      // Enpara logic: Expenses are positive in list but payments are negative. 
      // Actually, my analysis showed: expenses (harcamalar) listed as plain, payments as - prefix.
      transactions.push({
        date: this.parseDate(dateStr),
        description: normalizeDescription(desc),
        amount: parsedAmount,
        type: (parsedAmount >= 0 ? 'INCOME' : 'EXPENSE') as 'INCOME' | 'EXPENSE'
      });
    }
    return transactions;
  }

  private parseDate(input: any): string {
    if (!input) return new Date().toISOString();
    const str = String(input).trim();
    const dateMatch = str.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
    if (dateMatch) {
      const [, d, m, y] = dateMatch;
      return new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
}

/**
 * Garanti Adapter (Placeholder for future)
 */
class GarantiAdapter implements BankAdapter {
  name = 'Garanti';
  inferType(headers: string[], content: string): 'ACCOUNT' | 'CARD' | 'UNKNOWN' {
    return 'UNKNOWN';
  }
  canHandle(headers: string[], content: string): boolean {
    return content.toUpperCase().includes('GARANTI');
  }
  parseExcel = () => [];
  parsePDF = () => [];
}

/**
 * Düzeltme 6 — Faz 15.19: Generic Excel Adapter
 * 
 * Bilinmeyen banka formatlarına karşı fallback adaptör.
 * Akıllı başlık tespiti ile standart tablo formatlarını işleyebilir:
 * - Tarih, Açıklama, Tutar kolonlarını otomatik tespit eder
 * - Oluşturulan kayıtlar ImportPreviewModal'da manuel düzenlenebilir
 */
class GenericExcelAdapter implements BankAdapter {
  name = 'Generic';

  canHandle(): boolean {
    return false; // Asla birincil secçim değildir — sadece fallback
  }

  inferType(headers: string[], content: string): 'ACCOUNT' | 'CARD' | 'UNKNOWN' {
    const searchStr = (headers.join(' ') + ' ' + content).toUpperCase();
    if (searchStr.includes('KREDİ KARTI') || searchStr.includes('CREDIT CARD')) return 'CARD';
    if (searchStr.includes('HESAP') || searchStr.includes('ACCOUNT')) return 'ACCOUNT';
    return 'UNKNOWN';
  }

  parseExcel(rows: any[][]): RawTransaction[] {
    const headerKeywords = {
      date:   /tarih|date|v[aA]lör|value.*date/i,
      desc:   /açıklama|aciklama|desc|narration|detail|i[şs]lem|transaction/i,
      amount: /tutar|amount|miktar|para|try|tl/i,
    };

    // Akıllı başlık satırı tespiti (ilk 50 satır)
    let headerRowIdx = -1;
    let headerRow: any[] = [];
    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const row = rows[i];
      if (!row) continue;
      let score = 0;
      if (row.some(c => headerKeywords.date.test(String(c)))) score++;
      if (row.some(c => headerKeywords.desc.test(String(c)))) score++;
      if (row.some(c => headerKeywords.amount.test(String(c)))) score++;
      if (score >= 2) { headerRowIdx = i; headerRow = row; break; }
    }

    if (headerRowIdx === -1) return [];

    // Kolon indekslerini bul
    const colDate   = headerRow.findIndex(c => headerKeywords.date.test(String(c)));
    const colDesc   = headerRow.findIndex(c => headerKeywords.desc.test(String(c)));
    const colAmount = headerRow.findIndex(c => headerKeywords.amount.test(String(c)));

    if (colDate === -1 || colDesc === -1 || colAmount === -1) return [];

    const transactions: RawTransaction[] = [];
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[colDate] || !row[colDesc]) continue;

      const amount = parseAmountValue(row[colAmount]);
      if (amount === 0 && !row[colAmount]) continue;

      const rawDate = row[colDate];
      let dateStr: string;
      if (rawDate instanceof Date) {
        dateStr = rawDate.toISOString();
      } else {
        const d = new Date(String(rawDate));
        dateStr = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }

      transactions.push({
        date: dateStr,
        description: normalizeDescription(String(row[colDesc])),
        amount,
        type: amount >= 0 ? 'INCOME' : 'EXPENSE',
      });
    }
    return transactions;
  }

  parsePDF(): RawTransaction[] {
    // PDF için genel bir pattern tanımlamak mümkün değil — banka spesifik adaptör gerekli
    return [];
  }
}

// Register default adapters
AdapterRegistry.register(new IsBankasiAdapter());
AdapterRegistry.register(new EnparaAdapter());
AdapterRegistry.register(new GarantiAdapter());
AdapterRegistry.register(new GenericExcelAdapter()); // Düzeltme 6: Generic fallback son sırada

export const parseFile = async (file: File): Promise<ParseResult> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
    }

    const adapter = AdapterRegistry.findAdapter([], fullText, fileName);
    return {
      transactions: adapter.parsePDF(fullText),
      adapterName: adapter.name,
      inferredType: adapter.inferType([], fullText)
    };
  }

  // Excel (.xlsx or .xls)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        const headers = (rows.find(r => Array.isArray(r) && r.length > 2) as string[]) || [];
        const contentSample = rows.slice(0, 20).map(r => r.join(' ')).join(' ');
        
        const adapter = AdapterRegistry.findAdapter(headers, contentSample, fileName);
        console.log(`Detected Adapter: ${adapter.name}`);
        
        resolve({
          transactions: adapter.parseExcel(rows),
          adapterName: adapter.name,
          inferredType: adapter.inferType(headers, contentSample)
        });
      } catch (err) { reject(err); }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const getExcelHeaders = async (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      const headers = (rows.find(r => Array.isArray(r) && r.length > 2) as string[]) || [];
      resolve(headers);
    };
    reader.readAsArrayBuffer(file);
  });
};
