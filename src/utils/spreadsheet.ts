import * as XLSX from 'xlsx';
import { 
  WorkItem, 
  Worker, 
  MaterialStock, 
  EquipmentItem, 
  PettyCashTransaction, 
  SPBSubmission,
  AttendanceRecord 
} from '../types';

// Helper to trigger browser download of an ArrayBuffer as file
function saveAsExcelFile(buffer: any, fileName: string) {
  const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  const url = window.URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

// 1. Template Generators
export function downloadTemplateListPekerjaan() {
  const sampleData = [
    {
      'Divisi Pekerjaan': 'Pekerjaan Struktur Beton & Baja',
      'Sub Divisi': 'Struktur Balok & Plat Lantai 3',
      'Volume': 150,
      'Satuan': 'm³',
      'Harga Satuan (Rp)': 4650000,
      'Bobot (%)': 15.5,
      'Progress (%)': 80,
      'Status': 'Sedang Berjalan',
      'Catatan': 'Pengecoran zona 1 selesai, persiapan zona 2.'
    },
    {
      'Divisi Pekerjaan': 'Pekerjaan Arsitektur & Finishing',
      'Sub Divisi': 'Pasangan Bata Ringan Lt 2',
      'Volume': 600,
      'Satuan': 'm²',
      'Harga Satuan (Rp)': 165000,
      'Bobot (%)': 3.2,
      'Progress (%)': 25,
      'Status': 'Sedang Berjalan',
      'Catatan': 'Bata ringan dan mortar siap.'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_List_Pekerjaan');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, 'Template_List_Pekerjaan_CivilTrack');
}

export function downloadTemplateSDM() {
  const sampleData = [
    {
      'Nama Tenaga Kerja': 'Bambang Supriyanto',
      'Jabatan': 'Mandor Pembesian',
      'Kategori': 'Borongan',
      'Internal atau Vendor': 'Vendor',
      'Nama Vendor / Subkon': 'Mandor Bambang Brebes',
      'No Telepon / HP': '0812-3344-5566',
      'Upah Harian (Rp)': 180000,
      'Status': 'Aktif',
      'Catatan': 'Membawahi 15 tukang besi'
    },
    {
      'Nama Tenaga Kerja': 'Ahmad Fauzi',
      'Jabatan': 'Operator Excavator',
      'Kategori': 'Teknis',
      'Internal atau Vendor': 'Internal',
      'Nama Vendor / Subkon': '-',
      'No Telepon / HP': '0857-8899-1122',
      'Upah Harian (Rp)': 160000,
      'Status': 'Aktif',
      'Catatan': 'SIO Kelas 2 Kemnaker'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Tenaga_Kerja');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, 'Template_SDM_TenagaKerja_CivilTrack');
}

export function downloadTemplateBahan() {
  const sampleData = [
    {
      'Nama Bahan': 'Besi Beton Ulir D16 (12m)',
      'Kategori': 'Baja & Besi',
      'Satuan': 'Batang',
      'Stok Awal': 200,
      'Batas Minimum Stok': 50,
      'Catatan': 'SNI BJTS 420B sertifikat pabrik'
    },
    {
      'Nama Bahan': 'Semen Portland PCC 50kg',
      'Kategori': 'Semen',
      'Satuan': 'Zak',
      'Stok Awal': 150,
      'Batas Minimum Stok': 60,
      'Catatan': 'Simpan terlindung palet kayu'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Stok_Bahan');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, 'Template_Stok_Bahan_CivilTrack');
}

export function downloadTemplateAlat() {
  const sampleData = [
    {
      'Nama Alat': 'Excavator Komatsu PC200',
      'No Seri / Kode Aset': 'EXC-002',
      'Kategori': 'Alat Berat',
      'Kepemilikan': 'Sewa Rental',
      'Vendor Rental': 'PT Mitra Perkasa Alatindo',
      'Tarif Harian (Rp)': 1850000,
      'Tanggal Masuk': '2026-02-01',
      'Status': 'Beroperasi',
      'Operator Penanggung Jawab': 'Surya Wibowo',
      'Zona Lokasi': 'Area Galian Utama',
      'Keterangan': 'Pengecekan oli hidrolik rutin'
    },
    {
      'Nama Alat': 'Stamper Kodok Mikasa',
      'No Seri / Kode Aset': 'STMP-001',
      'Kategori': 'Mesin Ringan',
      'Kepemilikan': 'Milik Sendiri',
      'Vendor Rental': '-',
      'Tarif Harian (Rp)': 0,
      'Tanggal Masuk': '2026-01-15',
      'Status': 'Siap Pakai',
      'Operator Penanggung Jawab': 'Mandor Lapangan',
      'Zona Lokasi': 'Gudang Alat',
      'Keterangan': 'Kondisi baik'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Stok_Alat');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, 'Template_Stok_Alat_CivilTrack');
}

// 2. Generic Export of data array to Excel
export function exportTableToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
  if (!data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, fileName);
}

// 3. File Parser (Reads File from <input type="file">)
export function parseSpreadsheetFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

// 4. Raw CSV Text parser (e.g. from pasted Google Sheets URL or copy-pasted text)
export function parseRawCsvText(csvText: string): any[] {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
}
