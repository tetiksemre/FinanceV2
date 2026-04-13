import * as XLSX from 'xlsx';
import { Transaction } from './financeService';

export class ExportService {
  /**
   * Finansal verileri JSON formatında dışa aktarır (Yedekleme amaçlı).
   */
  static exportToJson(data: any[], fileName: string = 'finance_backup.json') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Finansal verileri Excel (XLSX) formatında dışa aktarır.
   */
  static exportToExcel(transactions: Transaction[], fileName: string = 'finance_report.xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
        ID: t.id,
        Tarih: t.transaction_date,
        Açıklama: t.description,
        Tutar: t.amount,
        Kategori: (t as any).categories?.name || 'Belirsiz',
        Tür: (t as any).categories?.type === 'income' ? 'Gelir' : 'Gider'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "İşlemler");

    XLSX.writeFile(workbook, fileName);
  }
}
