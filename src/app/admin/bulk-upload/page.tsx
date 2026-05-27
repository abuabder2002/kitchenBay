'use client';

import { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  RefreshCw,
  FileText,
  Database,
  History
} from 'lucide-react';

interface ImportLog {
  id: string;
  adminEmail: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  duplicateCount: number;
  createdAt: string;
}

interface PreviewSummary {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Loading & Progress States
  const [previewLoading, setPreviewLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Data States
  const [previewSummary, setPreviewSummary] = useState<PreviewSummary | null>(null);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [invalidRows, setInvalidRows] = useState<any[]>([]);
  const [duplicateRows, setDuplicateRows] = useState<any[]>([]);
  const [importHistory, setImportHistory] = useState<ImportLog[]>([]);
  
  // Filter Tabs: 'all' | 'valid' | 'invalid' | 'duplicates'
  const [activePreviewTab, setActivePreviewTab] = useState<'all' | 'valid' | 'invalid' | 'duplicates'>('all');
  
  // Main view tabs: 'upload' | 'history'
  const [activeMainTab, setActiveMainTab] = useState<'upload' | 'history'>('upload');
  
  // Alert messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/admin/bulk-upload/history');
      const data = await res.json();
      if (res.ok && data.success) {
        setImportHistory(data.logs);
      } else {
        console.error('Failed to load history:', data.error);
      }
    } catch (err) {
      console.error('Error fetching import history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'csv') {
        setFile(droppedFile);
        resetState();
      } else {
        setErrorMsg('Only Excel (.xlsx) and CSV files are supported.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      resetState();
    }
  };

  const resetState = () => {
    setPreviewSummary(null);
    setValidRows([]);
    setInvalidRows([]);
    setDuplicateRows([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Hit the preview API to validate rows and show results
  const generatePreview = async () => {
    if (!file) return;
    setPreviewLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/bulk-upload/preview', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setPreviewSummary(data.summary);
      setValidRows(data.validRows);
      setInvalidRows(data.invalidRows);
      setDuplicateRows(data.duplicateRows);

      if (data.invalidRows.length > 0 || data.duplicateRows.length > 0) {
        setErrorMsg('Some rows contain errors or duplicates. Please review before importing.');
      } else {
        setSuccessMsg('All rows verified successfully! Ready to import.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during preview generation.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Hit the commit API to write products to database
  const commitImport = async () => {
    if (validRows.length === 0) return;
    setCommitLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/bulk-upload/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: validRows.map(r => r.data),
          fileName: file?.name,
          totalRows: previewSummary?.totalRows || 0,
          failedCount: invalidRows.length,
          duplicateCount: duplicateRows.length,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete import');
      }

      setSuccessMsg(`Import successful! ${data.importedCount} products were successfully saved to the database.`);
      // Clear file and preview
      setFile(null);
      setPreviewSummary(null);
      setValidRows([]);
      setInvalidRows([]);
      setDuplicateRows([]);
      
      // Refresh import history
      fetchImportHistory();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during product import.');
    } finally {
      setCommitLoading(false);
    }
  };

  const triggerExport = async (format: 'csv' | 'xlsx') => {
    try {
      window.open(`/api/admin/products/export?format=${format}`, '_blank');
    } catch (err) {
      alert('Failed to trigger export.');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-2">
      {/* Header section with export and template links */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Database className="text-blue-600" size={26} /> Bulk Product Upload
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload XLSX/CSV files to add or update store products in bulk with validation and logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/bulk-upload/template"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-200/50 transition-all active:scale-95"
          >
            <Download size={14} /> Download Sample Template
          </a>
          <button
            onClick={() => triggerExport('xlsx')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200/50 transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Export to Excel
          </button>
          <button
            onClick={() => triggerExport('csv')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200 transition-all active:scale-95 cursor-pointer"
          >
            <FileText size={14} /> Export to CSV
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveMainTab('upload')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UploadCloud size={16} /> Upload & Preview
        </button>
        <button
          onClick={() => setActiveMainTab('history')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeMainTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History size={16} /> Import Logs & History
        </button>
      </div>

      {activeMainTab === 'upload' && (
        <div className="space-y-6">
          {/* Messages */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800">
              <AlertTriangle className="shrink-0 text-red-500 mt-0.5" size={18} />
              <div className="text-sm font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-800">
              <CheckCircle className="shrink-0 text-emerald-500 mt-0.5" size={18} />
              <div className="text-sm font-medium">{successMsg}</div>
            </div>
          )}

          {/* Upload Drop Zone Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <UploadCloud className="text-blue-600" size={28} />
              </div>
              <p className="text-base font-bold text-gray-800">
                Drag and drop your spreadsheet here, or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports Excel (.xlsx) and CSV files up to 20MB.
              </p>
            </div>

            {/* File Details & Actions */}
            {file && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-xs md:max-w-md">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={generatePreview}
                    disabled={previewLoading}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-200"
                  >
                    {previewLoading ? <RefreshCw className="animate-spin" size={14} /> : 'Generate Preview'}
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      resetState();
                    }}
                    className="inline-flex items-center justify-center text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Clear File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Summary & Tables */}
          {previewSummary && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100">
                <div className="p-5 border-r border-gray-100 text-center">
                  <p className="text-2xl font-black text-gray-900">{previewSummary.totalRows}</p>
                  <p className="text-xs font-semibold text-gray-400 mt-1">Total Rows</p>
                </div>
                <div className="p-5 border-r border-gray-100 text-center">
                  <p className="text-2xl font-black text-emerald-600">{previewSummary.validCount}</p>
                  <p className="text-xs font-semibold text-emerald-500 mt-1">Ready to Import</p>
                </div>
                <div className="p-5 border-r border-gray-100 text-center">
                  <p className="text-2xl font-black text-red-600">{previewSummary.invalidCount}</p>
                  <p className="text-xs font-semibold text-red-500 mt-1">Errors Found</p>
                </div>
                <div className="p-5 text-center">
                  <p className="text-2xl font-black text-amber-600">{previewSummary.duplicateCount}</p>
                  <p className="text-xs font-semibold text-amber-500 mt-1">Duplicates Detected</p>
                </div>
              </div>

              {/* Toolbar & Filters */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActivePreviewTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'all'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All Rows ({previewSummary.totalRows})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('valid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'valid'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50/50'
                    }`}
                  >
                    Valid ({previewSummary.validCount})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('invalid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'invalid'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white text-red-600 border border-red-100 hover:bg-red-50/50'
                    }`}
                  >
                    Errors ({previewSummary.invalidCount})
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('duplicates')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'duplicates'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-amber-600 border border-amber-100 hover:bg-amber-50/50'
                    }`}
                  >
                    Duplicates ({previewSummary.duplicateCount})
                  </button>
                </div>

                {validRows.length > 0 && (
                  <button
                    onClick={commitImport}
                    disabled={commitLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-100"
                  >
                    {commitLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} /> Importing...
                      </>
                    ) : (
                      <>
                        Import Valid Rows ({validRows.length}) <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16 text-center">Row</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">SKU</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Price</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24 text-center">Stock</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-72">Details / Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Render Tab Filtered Rows */}
                    {activePreviewTab === 'all' && (
                      <>
                        {invalidRows.map(renderInvalidRow)}
                        {duplicateRows.map(renderDuplicateRow)}
                        {validRows.map(renderValidRow)}
                      </>
                    )}
                    {activePreviewTab === 'valid' && validRows.map(renderValidRow)}
                    {activePreviewTab === 'invalid' && invalidRows.map(renderInvalidRow)}
                    {activePreviewTab === 'duplicates' && duplicateRows.map(renderDuplicateRow)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMainTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Import Logs History</h2>
            <button
              onClick={fetchImportHistory}
              disabled={historyLoading}
              className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={historyLoading ? 'animate-spin' : ''} size={16} />
            </button>
          </div>

          {historyLoading && importHistory.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <RefreshCw className="animate-spin" size={24} />
              <p className="text-sm font-semibold">Loading logs...</p>
            </div>
          ) : importHistory.length === 0 ? (
            <div className="py-16 text-center">
              <History size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No imports recorded yet</p>
              <p className="text-xs text-gray-300 mt-1">Spreadsheet uploads and commit history logs will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Filename</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Rows</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Success</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Failed</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Duplicates</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importHistory.map((log) => {
                    const status = log.failedCount > 0 ? 'partial' : 'success';
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-600 font-medium">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-gray-900 font-bold max-w-xs truncate">{log.fileName}</td>
                        <td className="p-4 text-gray-600 font-semibold">{log.adminEmail}</td>
                        <td className="p-4 text-center font-bold text-gray-800">{log.totalRows}</td>
                        <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-50/20">{log.successCount}</td>
                        <td className="p-4 text-center font-bold text-red-600 bg-red-50/20">{log.failedCount}</td>
                        <td className="p-4 text-center font-bold text-amber-600 bg-amber-50/20">{log.duplicateCount}</td>
                        <td className="p-4">
                          {status === 'success' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircle size={10} /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
                              <AlertTriangle size={10} /> Partial Import
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Row Renderers for Tables
  function renderValidRow(row: any) {
    return (
      <tr key={`valid-${row.row}`} className="hover:bg-gray-50/50 transition-colors">
        <td className="p-4 text-center font-medium text-gray-400">{row.row}</td>
        <td className="p-4">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
            <CheckCircle size={10} /> Valid
          </span>
        </td>
        <td className="p-4 font-semibold text-gray-700">{row.data.sku || '—'}</td>
        <td className="p-4 font-bold text-gray-900">{row.data.name}</td>
        <td className="p-4 text-gray-600 capitalize">{row.data.category}</td>
        <td className="p-4 font-semibold text-gray-800">₹{(row.data.price / 100).toFixed(2)}</td>
        <td className="p-4 text-center text-gray-700">{row.data.stock}</td>
        <td className="p-4 text-xs text-gray-500 italic max-w-xs truncate">Ready to import</td>
      </tr>
    );
  }

  function renderInvalidRow(row: any) {
    return (
      <tr key={`invalid-${row.row}`} className="bg-red-50/10 hover:bg-red-50/20 transition-colors">
        <td className="p-4 text-center font-medium text-gray-400">{row.row}</td>
        <td className="p-4">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-md">
            <XCircle size={10} /> Error
          </span>
        </td>
        <td className="p-4 font-semibold text-gray-500">{row.original.SKU || row.original.sku || '—'}</td>
        <td className="p-4 font-bold text-gray-600">{row.original['Product Name'] || row.original.name || '—'}</td>
        <td className="p-4 text-gray-400">{row.original.Category || row.original.category || '—'}</td>
        <td className="p-4 text-gray-400">₹{row.original.Price || row.original.price || '0'}</td>
        <td className="p-4 text-center text-gray-400">{row.original.Stock || row.original.stock || '0'}</td>
        <td className="p-4 text-xs text-red-600 font-semibold space-y-1">
          {row.errors.map((err: string, idx: number) => (
            <div key={idx} className="flex items-center gap-1">
              <span>• {err}</span>
            </div>
          ))}
        </td>
      </tr>
    );
  }

  function renderDuplicateRow(row: any) {
    return (
      <tr key={`dup-${row.row}`} className="bg-amber-50/10 hover:bg-amber-50/20 transition-colors">
        <td className="p-4 text-center font-medium text-gray-400">{row.row}</td>
        <td className="p-4">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
            <AlertTriangle size={10} /> Duplicate
          </span>
        </td>
        <td className="p-4 font-semibold text-gray-500">{row.data.sku || '—'}</td>
        <td className="p-4 font-bold text-gray-600">{row.data.name}</td>
        <td className="p-4 text-gray-400 capitalize">{row.data.category}</td>
        <td className="p-4 text-gray-400">₹{(row.data.price / 100).toFixed(2)}</td>
        <td className="p-4 text-center text-gray-400">{row.data.stock}</td>
        <td className="p-4 text-xs text-amber-700 font-medium">
          {row.reasons.map((reason: string, idx: number) => (
            <div key={idx}>• {reason}</div>
          ))}
        </td>
      </tr>
    );
  }
}
