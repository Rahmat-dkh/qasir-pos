# 💎 QASIR - Intelligent Retail POS System

QASIR adalah sistem Point of Sale (POS) modern berbasis cloud yang dibangun menggunakan **Google Apps Script** dan **Google Sheets** sebagai database. Aplikasi ini dirancang untuk kecepatan, keamanan, dan kemudahan bagi pelaku usaha retail kecil hingga menengah.

![Aesthetic](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop)

## ✨ Fitur Utama
- **📦 Inventory Master Control**: Manajemen stok barang secara real-time.
- **🛒 Smart Cashier Terminal**: Transaksi cepat dengan fitur barcode scanner ready.
- **📊 Business Analytics**: Visualisasi performa penjualan menggunakan Chart.js.
- **🔐 Secure Authentication**: Sistem login berbasis peran (Admin & Staff) dengan pembersihan otomatis spasi (trimming).
- **🌓 Adaptive Theme**: Dukungan mode gelap (Dark Mode) yang memukau.
- **📑 Digital Reports**: Ekspor data laporan penjualan ke format CSV dalam hitungan detik.

## 🚀 Teknologi
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Sheets (SpreadsheetApp API)
- **Icons**: Boxicons
- **Charts**: Chart.js

## 🛠️ Instalasi & Setup

1. **Persiapan Spreadsheet**:
   - Buat Google Sheets baru.
   - Buka menu **Extensions** > **Apps Script**.

2. **Deploy Kode**:
   - Salin isi dari `Code.gs`, `index.html`, `style.html`, dan `script.html` ke editor Apps Script Anda.
   - Pastikan nama file di Apps Script sama persis (sensitif huruf besar/kecil).

3. **Deploy Web App**:
   - Klik tombol **Deploy** > **New Deployment**.
   - Pilih type: **Web App**.
   - Execute as: **Me**.
   - Who has access: **Anyone** (atau sesuaikan dengan kebutuhan Anda).

4. **Inisialisasi Database**:
   - Saat pertama kali dijalankan, script akan otomatis membuat sheet: `Products`, `Transactions`, `Details`, dan `Users`.
   - **Default Credentials**:
     - **Username**: `admin`
     - **Password**: `admin123`

## 🔒 Keamanan
Proyek ini dikonfigurasi untuk menyembunyikan logika database di sisi server (Google Apps Script). Jangan pernah membagikan URL spreadsheet asli Anda kepada publik. Gunakan fitur **Test Deployments** untuk pengembangan lokal.

## 📄 Lisensi
Distributed under the MIT License. Lihat `LICENSE` untuk informasi lebih lanjut.

---
Developed with ❤️ by [Rahmat-dkh](https://github.com/Rahmat-dkh)
