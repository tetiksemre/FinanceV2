"use client";

import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { parseFile, getExcelHeaders, RawTransaction, BankMapping } from '@/lib/parser';
import { useFinanceStore } from '@/store/useFinanceStore';
import { ruleEngine } from '@/services/RuleEngine';
import { isDuplicate } from '@/services/duplicateDetection';
import { MappingDialog } from './MappingDialog';
import { ImportPreviewModal } from './ImportPreviewModal';

export const FileUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const { transactions: existingTransactions } = useFinanceStore();
  
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    fileName: string;
    rawTransactions: RawTransaction[];
    adapterName: string;
    inferredType: 'ACCOUNT' | 'CARD' | 'UNKNOWN';
  }>({
    isOpen: false,
    fileName: '',
    rawTransactions: [],
    adapterName: '',
    inferredType: 'UNKNOWN'
  });

  const [mappingState, setMappingState] = useState<{
    isOpen: boolean;
    headers: string[];
    currentFile: File | null;
  }>({
    isOpen: false,
    headers: [],
    currentFile: null
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
    setErrorLogs([]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrorLogs([]);
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setErrorLogs([]);
    
    try {
      const file = files[0]; 
      const result = await parseFile(file);
      
      if (result.transactions.length === 0) {
         setErrorLogs([`${file.name}: Hiçbir işlem bulunamadı veya banka formatı tanınamadı.`]);
         return;
      }

      setPreviewState({
        isOpen: true,
        fileName: file.name,
        rawTransactions: result.transactions,
        adapterName: result.adapterName,
        inferredType: result.inferredType
      });
      
      setFiles([]);
    } catch (error: any) {
      console.error(error);
      setErrorLogs([`Hata oluştu: ${error.message || "Bilinmeyen sistem hatası"}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingConfirm = async (mapping: BankMapping) => {
    // Note: Manual mapping fallback is currently handled within the adapters if auto-detect fails,
    // but for simplicity in this turn, we focus on the agnostic flow.
    // If we need manual mapping back, we'd Re-implement it here.
    setMappingState({ ...mappingState, isOpen: false });
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[0.98]' 
            : 'border-muted-foreground/20'
        }`}
      >
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Dosya yüklemek için sürükleyin</p>
          <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls) veya PDF (.pdf) ekstresi desteklenir.</p>
        </div>
        <input 
          type="file" 
          accept=".xlsx,.xls,.pdf"
          className="hidden" 
          id="fileInput" 
          onChange={(e) => {
            setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
            setErrorLogs([]);
          }}
        />
        <Button onClick={() => document.getElementById('fileInput')?.click()} variant="secondary">
          Veya Dosya Seç
        </Button>
      </div>

      {errorLogs.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-medium mb-1">
            <AlertCircle className="w-5 h-5" />
            İçe Aktarım Uyarıları / Hataları ({errorLogs.length})
          </div>
          <ul className="space-y-1 text-sm text-destructive/90 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-destructive/20">
            {errorLogs.map((log, index) => (
              <li key={index} className="flex gap-2">
                <span className="opacity-50">•</span> {log}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <h4 className="font-medium">Hazır Dosyalar</h4>
          <ul className="space-y-2">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(i)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <Button 
            className="w-full gap-2" 
            onClick={processFiles}
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                İçe Aktarımı Başlat
              </>
            )}
          </Button>
        </div>
      )}

      {/* MappingDialog is kept for future manually triggered mapping if needed */}
      <MappingDialog 
        isOpen={mappingState.isOpen}
        headers={mappingState.headers}
        onClose={() => setMappingState({ ...mappingState, isOpen: false })}
        onConfirm={handleMappingConfirm}
      />

      <ImportPreviewModal 
        isOpen={previewState.isOpen}
        fileName={previewState.fileName}
        rawTransactions={previewState.rawTransactions}
        adapterName={previewState.adapterName}
        inferredType={previewState.inferredType}
        onClose={() => setPreviewState({ ...previewState, isOpen: false })}
      />
    </div>
  );
};
