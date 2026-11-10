/* Data katalog AreumiVerse.
   Dipakai sebagai data contoh (mode demo) dan untuk mengisi Firestore lewat admin.html.
   Field gambar:
     foto       : { "Nama Warna": "url" }  -> foto utama per warna
     gambar_url : foto umum (dipakai bila warna tidak punya foto)
     galeri     : foto tambahan untuk tampilan detail
     tipe/brand : dipakai untuk mockup otomatis bila foto belum ada
   Harga & stok di bawah adalah perkiraan awal — sesuaikan sebelum dipakai. */
(function () {
  const P = "images/produk/";
  window.AREUMI_DEMO = {
    categories: ["AREUMI Modest", "Kaos Polos & Motif", "Baju Anak", "Dress Wanita", "Produksi Pakaian"],

    suppliers: [
      { id: "SUP-AR", nama: "AREUMI Modest Apparel", kategori: "AREUMI Modest", lokasi: "Brand in-house AreumiVerse",
        spesialisasi: "Kaos muslimah oversize: colorblock, basic, stripe, graphic tee", min_order: "1 pcs",
        estimasi_proses: "Kirim H+1", rating: 4.9, status: "Brand Resmi", logo_url: "images/brand/areumi-logo.png" },
      { id: "SUP-RZ", nama: "RAYNOZ! Apparel", kategori: "Kaos Polos & Motif", lokasi: "Raynoz Imperium × Dapurbadjoe",
        spesialisasi: "Long sleeve logo-only, band series sablon DTF raster, kaos custom", min_order: "1 pcs",
        estimasi_proses: "Kirim H+1–2", rating: 4.9, status: "Brand Resmi", logo_url: "images/brand/raynoz-logo.png" },
      { id: "SUP-01", nama: "Mitra Konveksi Kaos Polos", kategori: "Kaos Polos & Motif", lokasi: "Bandung (Suci), Jawa Barat",
        spesialisasi: "Kaos cotton combed 20s/24s/30s, 15+ warna, oversize", min_order: "1 pcs (dropship) / 3 lusin (grosir)",
        estimasi_proses: "Kirim H+1", rating: 4.8, status: "Terverifikasi" },
      { id: "SUP-02", nama: "Mitra Pakaian Anak", kategori: "Baju Anak", lokasi: "Solo, Jawa Tengah",
        spesialisasi: "Kaos anak polos & karakter, usia 1–12 tahun", min_order: "1 pcs / 1 seri ukuran",
        estimasi_proses: "Kirim H+1", rating: 4.8, status: "Terverifikasi" },
      { id: "SUP-05", nama: "Mitra Konveksi & Sablon", kategori: "Produksi Pakaian", lokasi: "Bandung & Bogor",
        spesialisasi: "Produksi brand sendiri: sablon DTF/plastisol, bordir, label, hangtag & packaging", min_order: "24 pcs per desain",
        estimasi_proses: "14–21 hari kerja", rating: 4.9, status: "Terverifikasi" },
      { id: "SUP-06", nama: "Mitra Dress & Fashion Wanita", kategori: "Dress Wanita", lokasi: "Jakarta (Tanah Abang)",
        spesialisasi: "Dress, gamis & atasan wanita: smock, floral, wrap, tiered dress", min_order: "1 pcs / paket random 2 pcs",
        estimasi_proses: "Kirim H+1–2", rating: 4.7, status: "Terverifikasi" }
    ],

    products: [
      /* ---------- AREUMI Modest ---------- */
      { sku: "AR-CB01", nama: "AREUMI Colorblock Oversize Long Sleeve", kategori: "AREUMI Modest", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Premium cotton, modest fit", ukuran: "M, L, XL", warna: "Rose Plum, Sage, Denim, Mono, Latte, Blue Terracotta",
        harga_modal: 69000, harga_jual_saran: 109000, stok: 180, min_order: 1,
        deskripsi: "More than just a tee. Kaos oversize colorblock 3 panel dengan sablon AREUMI, lengan panjang ber-manset. Lembut, menutup, nyaman dipakai seharian.",
        foto: { "Rose Plum": P + "areumi-colorblock-rose-plum.jpg", "Sage": P + "areumi-colorblock-sage.jpg", "Denim": P + "areumi-colorblock-denim.jpg",
                "Mono": P + "areumi-colorblock-mono.jpg", "Latte": P + "areumi-colorblock-latte.jpg", "Blue Terracotta": P + "areumi-colorblock-blue-terracotta.jpg" },
        galeri: [P + "galeri-areumi-colorblock-2.jpg", P + "galeri-areumi-colorblock-1.jpg", P + "galeri-areumi-colorblock-3.jpg"] },
      { sku: "AR-EV01", nama: "AREUMI Everyday Collection — Basic, Colorblock, Stripe", kategori: "AREUMI Modest", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Premium cotton, breathable & soft", ukuran: "M, L, XL", warna: "Cream, Dusty Rose, Mocha",
        harga_modal: 65000, harga_jual_saran: 99000, stok: 150, min_order: 1,
        deskripsi: "Tiga gaya dalam satu koleksi: 01 Basic (cream/off white), 02 Colorblock (dusty rose), 03 Stripe (mocha/latte). Modest look, brighter you.",
        foto: { "Cream": P + "areumi-basic-cream.jpg", "Dusty Rose": P + "areumi-colorblock-dusty-rose.jpg", "Mocha": P + "areumi-stripe-mocha.jpg" },
        galeri: [P + "galeri-areumi-everyday.jpg"] },
      { sku: "RZ-LO01", nama: "RAYNOZ! × AREUMI Logo Only Long Sleeve", kategori: "AREUMI Modest", brand: "RAYNOZ", supplier_id: "SUP-RZ",
        bahan: "Cotton premium, oversize fit", ukuran: "S, M, L, XL", warna: "Brown, White, Blue",
        harga_modal: 55000, harga_jual_saran: 89000, stok: 240, min_order: 1,
        deskripsi: "Premium long sleeve edition, logo only — minimalis dan modern. Size chart (cm) — S: LD 52, P 68, PL 54 · M: LD 54, P 70, PL 56 · L: LD 56, P 72, PL 58 · XL: LD 58, P 74, PL 60. Toleransi 1–2 cm.",
        foto: { "Brown": P + "logo-only-brown.jpg", "White": P + "logo-only-white.jpg", "Blue": P + "logo-only-blue.jpg" },
        galeri: [P + "galeri-logo-only.jpg", P + "logo-only-foto-1.jpg", P + "logo-only-foto-2.jpg", P + "logo-only-foto-3.jpg",
                 P + "logo-only-foto-4.jpg", P + "logo-only-foto-5.jpg", P + "logo-only-foto-6.jpg"] },

      /* ---------- Kaos Polos & Motif ---------- */
      { sku: "AR-GT01", nama: "AREUMI Graphic Tee — Daisy", kategori: "Kaos Polos & Motif", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Cotton combed 24s, sablon DTF", ukuran: "All size (fit to L)", warna: "Magenta",
        harga_modal: 42000, harga_jual_saran: 69000, stok: 60, min_order: 1,
        deskripsi: "Kaos boxy dengan sablon bunga daisy. Lengkap dengan label leher & hangtag AREUMI.",
        foto: { "Magenta": P + "areumi-daisy-magenta-1.jpg" }, galeri: [P + "areumi-daisy-magenta-2.jpg"] },
      { sku: "AR-GT02", nama: "AREUMI Graphic Tee — ME!", kategori: "Kaos Polos & Motif", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Cotton combed 24s, sablon DTF", ukuran: "All size (fit to L)", warna: "Pink",
        harga_modal: 42000, harga_jual_saran: 69000, stok: 60, min_order: 1,
        deskripsi: "Kaos boxy warna pink dengan ilustrasi kucing 'ME!' yang playful.",
        foto: { "Pink": P + "areumi-me-pink.jpg" } },
      { sku: "AR-GT03", nama: "AREUMI Graphic Tee — French Fries", kategori: "Kaos Polos & Motif", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Cotton combed 24s, sablon DTF", ukuran: "M, L, XL", warna: "Hitam",
        harga_modal: 42000, harga_jual_saran: 69000, stok: 60, min_order: 1,
        deskripsi: "Kaos hitam dengan sablon French Fries, label leher & hangtag AREUMI.",
        foto: { "Hitam": P + "areumi-french-fries-hitam.jpg" } },
      { sku: "AR-LT01", nama: "AREUMI Logo Tee Short Sleeve", kategori: "Kaos Polos & Motif", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Cotton combed 24s, sablon logo", ukuran: "S, M, L, XL, XXL", warna: "White, Black",
        harga_modal: 39000, harga_jual_saran: 65000, stok: 300, min_order: 1,
        deskripsi: "Kaos lengan pendek basic dengan logo AREUMI kecil di dada. Unisex, lengkap dengan label leher & hangtag AREUMI 아름.",
        foto: { "White": P + "areumi-logo-tee-white.jpg", "Black": P + "areumi-logo-tee-black.jpg" },
        galeri: [P + "galeri-areumi-logo-tee-1.jpg", P + "galeri-areumi-logo-tee-2.jpg", P + "galeri-areumi-logo-tee-3.jpg"] },
      { sku: "AR-CT01", nama: "AREUMI Crop Tee — ME!, French Fries, Daisy", kategori: "Kaos Polos & Motif", brand: "AREUMI", supplier_id: "SUP-AR",
        bahan: "Cotton combed 24s, sablon DTF", ukuran: "All size (fit to L)", warna: "Pink, Hitam, Magenta",
        harga_modal: 45000, harga_jual_saran: 75000, stok: 150, min_order: 1,
        deskripsi: "Crop tee boxy dengan 3 pilihan motif: ME! (pink), French Fries (hitam), Daisy (magenta). Cocok dipadukan dengan celana jeans high waist.",
        foto: { "Pink": P + "areumi-crop-me-pink.jpg", "Hitam": P + "areumi-crop-fries-black.jpg", "Magenta": P + "areumi-crop-daisy-magenta.jpg" },
        galeri: [P + "galeri-areumi-crop-tee.jpg"] },
      { sku: "KP-PL01", nama: "Kaos Polos Cotton Combed 30s — 15 Warna", kategori: "Kaos Polos & Motif", tipe: "tee", brand: "AREUMI", supplier_id: "SUP-01",
        bahan: "Cotton combed 30s (150 gsm)", ukuran: "S, M, L, XL, XXL",
        warna: "Ungu, Abu Tua, Merah, Hitam, Biru Benhur, Khaki, Sage, Navy, Pink, Biru Muda, Bata, Coklat, Cream, Putih, Lilac",
        harga_modal: 25000, harga_jual_saran: 45000, stok: 1500, min_order: 1,
        deskripsi: "Kaos polos basic adem, jahitan rantai di bahu, cocok untuk daily wear maupun bahan sablon.",
        gambar_url: P + "kaos-polos-warna.jpg" },
      { sku: "KP-RD01", nama: "Paket Random Kaos Pria & Wanita (Polos & Motif)", kategori: "Kaos Polos & Motif", supplier_id: "SUP-01",
        bahan: "Cotton combed 24s/30s", ukuran: "M, L, XL", warna: "Random",
        harga_modal: 22000, harga_jual_saran: 39000, stok: 500, min_order: 3,
        deskripsi: "Paket kaos random polos & motif untuk pria dan wanita. Cocok untuk live jualan dan reseller. Minimal 3 pcs.",
        gambar_url: P + "kaos-random-pria-wanita.jpg" },
      { sku: "RZ-BS01", nama: "RAYNOZ Band Series — Nirvana", kategori: "Kaos Polos & Motif", brand: "RAYNOZ", supplier_id: "SUP-RZ",
        bahan: "Cotton combed 24s, sablon DTF raster", ukuran: "M, L, XL, XXL", warna: "Hitam",
        harga_modal: 49000, harga_jual_saran: 85000, stok: 120, min_order: 1,
        deskripsi: "Band series dengan 10 pilihan desain. Sebutkan nomor desain di catatan pesanan.",
        gambar_url: P + "raynoz-nirvana-series.jpg" },
      { sku: "RZ-BS02", nama: "RAYNOZ Band Series — AC/DC Raster DTF", kategori: "Kaos Polos & Motif", brand: "RAYNOZ", supplier_id: "SUP-RZ",
        bahan: "Cotton combed 24s, sablon DTF raster", ukuran: "M, L, XL, XXL", warna: "Hitam",
        harga_modal: 49000, harga_jual_saran: 85000, stok: 120, min_order: 1,
        deskripsi: "Band series sablon DTF raster, 6 pilihan desain. Sebutkan desain di catatan pesanan.",
        gambar_url: P + "raynoz-acdc-series.jpg" },

      /* ---------- Baju Anak ---------- */
      { sku: "BA-PL01", nama: "Kaos Anak Polos & Karakter", kategori: "Baju Anak", tipe: "kids", brand: "AREUMI", supplier_id: "SUP-02",
        bahan: "Cotton combed 30s", ukuran: "1-2th, 3-4th, 5-6th, 7-8th, 9-10th", warna: "Merah, Biru Muda, Kuning, Hitam, Cream, Bata, Biru Benhur, Coklat",
        harga_modal: 19000, harga_jual_saran: 35000, stok: 800, min_order: 1,
        deskripsi: "Kaos anak lembut, tersedia polos dan karakter (dino, be cool, bunga). Aman untuk kulit sensitif.",
        gambar_url: P + "kaos-anak-random-2.jpg" },
      { sku: "BA-RD01", nama: "Kaos Anak Random Motif", kategori: "Baju Anak", supplier_id: "SUP-02",
        bahan: "Cotton combed 30s", ukuran: "2-3th, 4-5th, 6-7th, 8-9th", warna: "Random",
        harga_modal: 17000, harga_jual_saran: 32000, stok: 600, min_order: 3,
        deskripsi: "Paket kaos anak motif random (dino, monster truck, stripe). Minimal 3 pcs.",
        gambar_url: P + "kaos-anak-random-1.jpg" },

      /* ---------- Dress Wanita ---------- */
      { sku: "DR-RD01", nama: "Dress Wanita Random", kategori: "Dress Wanita", supplier_id: "SUP-06",
        bahan: "Crinkle, rayon, katun (campur)", ukuran: "All size (fit to XL)", warna: "Random",
        harga_modal: 45000, harga_jual_saran: 79000, stok: 200, min_order: 2,
        deskripsi: "Dress wanita model random: smock, floral button, wrap dress, tiered dress. Minimal 2 pcs.",
        gambar_url: P + "dress-wanita-random.jpg" },

      /* ---------- Produksi Pakaian ---------- */
      { sku: "PR-001", nama: "Produksi Kaos Brand Sendiri (Sablon DTF + Hangtag)", kategori: "Produksi Pakaian", tipe: "print", brand: "AREUMI", supplier_id: "SUP-05",
        bahan: "Cotton combed 24s/30s", ukuran: "S – XXL", warna: "Bebas pilih",
        harga_modal: 48000, harga_jual_saran: 85000, stok: 0, min_order: 24,
        deskripsi: "Harga per pcs termasuk bahan, sablon DTF A4, label leher, hangtag & plastik. Contoh hasil: koleksi graphic tee AREUMI. Proses 14 hari kerja.",
        gambar_url: P + "areumi-daisy-magenta-2.jpg", galeri: [P + "areumi-daisy-magenta-1.jpg", P + "areumi-french-fries-hitam.jpg", P + "areumi-me-pink.jpg"] }
    ]
  };
})();
