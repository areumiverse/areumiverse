# Setup AreumiVerse — Website Dropshipper

Website ini statis (bisa tetap di GitHub Pages `www.areumiverse.com`). Database-nya Google Spreadsheet
**db_dropship**, dihubungkan lewat Google Apps Script.

## Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Landing page: kategori, katalog, supplier, produksi, cara kerja, form daftar, FAQ |
| `login.html` | Form login dropshipper |
| `dashboard.html` | Dashboard: ringkasan & profit, katalog harga modal, caption, buat pesanan, riwayat, supplier, profil |
| `css/style.css` | Seluruh tampilan |
| `js/config.js` | **URL API & nomor WhatsApp admin** — diedit di sini |
| `js/common.js` | API, sesi login, helper, ilustrasi produk |
| `js/landing.js`, `js/dashboard.js` | Logika halaman |
| `js/data.js` | Data contoh (dipakai saat mode demo / API gagal) |
| `apps-script/Code.gs` | Backend Google Apps Script |

## 1. Pasang backend di spreadsheet

1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1QpbvYW5C66PKSZf5sJTfBy0qucEKcA85bS3t6LioapY/edit
2. Menu **Ekstensi → Apps Script**. Hapus isi `Code.gs` bawaan, tempel seluruh isi `apps-script/Code.gs`. Simpan.
3. Pilih fungsi **`setup`** di toolbar → **Jalankan** → izinkan akses akun Google.
   Ini membuat sheet `Users`, `Produk`, `Supplier`, `Pesanan` dan mengisi 12 contoh produk + 6 supplier.
4. **Terapkan → Deployment baru → (ikon gerigi) Aplikasi web**
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
5. Salin URL yang berakhiran `/exec`.

## 2. Hubungkan website

Edit `js/config.js`:

```js
API_URL: "https://script.google.com/macros/s/AKfy..../exec",
```

Commit & push. Banner kuning "Mode demo" akan hilang.

> Setiap kali `Code.gs` diubah, buat ulang deployment: **Terapkan → Kelola deployment → Edit → Versi baru**. URL tetap sama.

## 3. Pekerjaan admin sehari-hari (langsung di spreadsheet)

- **Verifikasi mitra:** sheet `Users`, kolom `status` → ubah ke `Aktif` (dropdown). `Nonaktif` memblokir login.
- **Update pesanan:** sheet `Pesanan`, isi `ongkir`, `resi`, dan ubah `status`
  (Menunggu Pembayaran → Diproses → Dikirim → Selesai). Dropshipper langsung melihatnya di dashboard.
- **Tambah/ubah produk:** sheet `Produk`. Kategori harus salah satu dari: Kaos Polos, Baju Anak, Kemeja Kantor,
  Produksi Pakaian. `gambar_url` boleh diisi link foto (jika kosong, tampil ilustrasi otomatis).
  `aktif` = FALSE untuk menyembunyikan produk. `stok` = 0 berarti produk by order (tidak dikurangi).
- **Supplier:** sheet `Supplier`. Kolom `kontak_internal` & `catatan` tidak pernah dikirim ke website.

## Alur yang terjadi

- **Daftar:** form → tersimpan di sheet `Users` (password di-hash SHA-256 + salt) → browser membuka WhatsApp admin
  dengan pesan berisi data pendaftar.
- **Login:** WhatsApp/email + password → token sesi 30 hari.
- **Pesanan:** dashboard → tersimpan di sheet `Pesanan`, stok dikurangi → WhatsApp admin terbuka dengan detail pesanan.
- **Harga modal** hanya dikirim API ke pengguna yang sudah login.

## Mode demo

Selama `API_URL` kosong, semua fitur tetap bisa dicoba: akun & pesanan disimpan di localStorage browser
(bukan di spreadsheet). Cocok untuk melihat tampilan sebelum backend dipasang.
