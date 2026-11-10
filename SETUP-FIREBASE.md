# Menghubungkan AreumiVerse ke Firebase

Website tetap statis (GitHub Pages). Firebase dipakai untuk login/daftar (Authentication) dan database (Cloud Firestore).
Semua langkah di bawah gratis (paket Spark).

## 1. Buat project

1. Buka https://console.firebase.google.com → **Create a project** (nama bebas, misal `areumiverse`). Google Analytics boleh dimatikan.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
3. **Authentication → Settings → Authorized domains → Add domain** → `www.areumiverse.com` (dan `areumiverse.com`).
4. **Build → Firestore Database → Create database** → lokasi **asia-southeast2 (Jakarta)** → **Start in production mode**.
5. **Firestore Database → Rules** → hapus isinya, tempel seluruh isi file `firestore.rules` → **Publish**.

## 2. Ambil konfigurasi web

1. Ikon gerigi ⚙ → **Project settings → General → Your apps → ikon `</>` (Web)**.
2. Nama app bebas (misal `areumi-web`), **jangan** centang Firebase Hosting → **Register app**.
3. Salin objek `firebaseConfig` yang muncul, lalu isi ke `js/config.js` bagian `FIREBASE`:

```js
FIREBASE: {
  apiKey: "AIza...",
  authDomain: "areumiverse.firebaseapp.com",
  projectId: "areumiverse",
  storageBucket: "areumiverse.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
},
```

> `apiKey` Firebase memang aman ditaruh di website publik — keamanan data dijaga oleh `firestore.rules`.

## 3. Jadikan akun Anda admin

1. Buka website → **Daftar** seperti mitra biasa (pakai email & nomor WA Anda).
2. Login → buka `admin.html`. Halaman akan menampilkan **UID** Anda.
   (Atau lihat di **Authentication → Users**, kolom *User UID*.)
3. **Firestore Database → Data → Start collection** → Collection ID: `admins` → Document ID: *(tempel UID Anda)* →
   tambah satu field bebas, misal `nama` = `Owner` → **Save**.
4. Muat ulang `admin.html` → menu **Data Produk → Isi produk & supplier** untuk mengisi 12 produk dan 6 supplier contoh.

## Pekerjaan admin sehari-hari (admin.html)

- **Mitra:** ubah status `Menunggu Verifikasi → Aktif` (atau `Nonaktif` untuk memblokir), atur level.
- **Semua Pesanan:** isi ongkir, nomor resi, ubah status → **Simpan**. Mitra langsung melihatnya di dashboard.
- **Produk:** ubah di Firebase Console → Firestore → koleksi `produk` (nama, stok, warna, ukuran, `gambar_url`, `aktif`)
  dan `produk_modal` (harga modal, ID dokumen = SKU).

## Struktur data

| Koleksi | Isi | Siapa yang bisa membaca |
|---|---|---|
| `users/{uid}` | Profil mitra | Pemilik akun & admin |
| `wa_index/{62xxx}` | Email untuk login via nomor WA | Publik (per nomor) |
| `produk/{sku}` | Data produk tanpa harga modal | Publik |
| `produk_modal/{sku}` | `harga_modal` | Yang sudah login |
| `supplier/{id}` | Daftar supplier | Publik |
| `pesanan/{id}` | Pesanan | Pemilik pesanan & admin |
| `admins/{uid}` | Penanda akun admin | Dibuat manual |

## Catatan

- Login bisa memakai **nomor WhatsApp atau email** + password. Lupa password → link reset dikirim ke email.
- Harga modal dan total modal pada pesanan divalidasi oleh rules terhadap `produk_modal`, jadi tidak bisa dimanipulasi dari browser.
- Kuota gratis Firestore: 50.000 baca & 20.000 tulis per hari — cukup untuk ratusan mitra aktif.
