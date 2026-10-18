import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { parseSpreadsheetFile, parseRawCsvText } from '../../utils/spreadsheet';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onDownloadTemplate: () => void;
  onImportData: (data: any[]) => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  onClose,
  title,
  onDownloadTemplate,
  onImportData
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gsheet'>('upload');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [gsheetUrl, setGsheetUrl] = useState<string>('');
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);
    setFileName(file.name);

    try {
      const data = await parseSpreadsheetFile(file);
      if (data.length === 0) {
        setError('File Excel/CSV kosong atau tidak berisi baris data valid.');
      } else {
        setParsedRows(data);
      }
    } catch (err: any) {
      setError(`Gagal membaca file: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGSheet = async () => {
    setError('');
    if (!gsheetUrl) {
      setError('Masukkan tautan Google Sheets atau CSV terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      // If user provided a standard Google Sheets share link, convert it to CSV export URL
      let exportUrl = gsheetUrl;
      const match = gsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        exportUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }

      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error('Gagal mengakses Google Sheets. Pastikan dokumen diatur ke "Siapa saja dengan tautan dapat melihat" (Public/Shared).');
      }
      const csvData = await res.text();
      const rows = parseRawCsvText(csvData);
      if (rows.length === 0) {
        setError('Tabel Google Sheets kosong.');
      } else {
        setParsedRows(rows);
        setFileName('Google Sheets Import');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengimpor dari tautan.');
    } finally {
      setLoading(false);
    }
  };

  const handleParseRawText = () => {
    if (!rawCsvText.trim()) return;
    try {
      const rows = parseRawCsvText(rawCsvText);
      if (rows.length === 0) {
        setError('Teks CSV / TSV tidak valid.');
      } else {
        setParsedRows(rows);
        setFileName('Pasted CSV Data');
      }
    } catch (err: any) {
      setError('Gagal membaca data teks.');
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportData(parsedRows);
    onClose();
    setParsedRows([]);
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Impor Data Spreadsheet - {title}
              </h3>
              <p className="text-xs text-neutral-500">
                Dukung file Excel (.xlsx, .xls), CSV, atau tautan Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Download Template Strip */}
          <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-200">
                Format Template Excel Standar
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Gunakan template resmi agar nama kolom dan tipe data terbaca otomatis.
              </div>
            </div>
            <button
              onClick={onDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Template
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'upload'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              Upload File Excel (.xlsx / .csv)
            </button>
            <button
              onClick={() => setActiveTab('gsheet')}
              className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'gsheet'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              Link Google Sheets / Teks CSV
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div>
              <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50 dark:bg-neutral-800/40">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Pilih file spreadsheet dari komputer Anda
                </span>
                <span className="text-xs text-neutral-500 mt-1">
                  Mendukung .xlsx, .xls, .csv hingga 10MB
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Tautan Google Sheets Publik:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={gsheetUrl}
                      onChange={(e) => setGsheetUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={handleFetchGSheet}
                    disabled={loading || !gsheetUrl}
                    className="px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Mengambil...' : 'Muat Sheet'}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  *File Google Sheets harus diset &quot;Anyone with the link can view&quot;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Atau Tempel (Paste) Teks CSV / Salinan Tabel:
                </label>
                <textarea
                  rows={3}
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  placeholder="Paste baris CSV atau data dari spreadsheet langsung ke sini..."
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  onClick={handleParseRawText}
                  disabled={!rawCsvText.trim()}
                  className="mt-2 px-3 py-1.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-100 rounded-lg disabled:opacity-50"
                >
                  Proses Teks
                </button>
              </div>
            </div>
          )}

          {/* Feedback & Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview of Parsed Data */}
          {parsedRows.length > 0 && (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-neutral-50 dark:bg-neutral-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Berhasil membaca {parsedRows.length} baris dari {fileName || 'file'}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Menampilkan 3 baris sampel
                </span>
              </div>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 dark:border-neutral-700 text-neutral-500">
                      {Object.keys(parsedRows[0] || {}).slice(0, 5).map((k) => (
                        <th key={k} className="p-1 font-medium">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {Object.values(row).slice(0, 5).map((val: any, j) => (
                          <td key={j} className="p-1 truncate max-w-[120px]">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Tambahkan {parsedRows.length} Data ke Proyek
          </button>
        </div>
      </div>
    </div>
  );
};
