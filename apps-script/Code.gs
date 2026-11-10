/**
 * AreumiVerse — Backend Google Apps Script
 * Database: Google Spreadsheet "db_dropship"
 *
 * Cara pakai singkat (lengkapnya di SETUP.md):
 *  1. Buka spreadsheet > Ekstensi > Apps Script, tempel seluruh file ini.
 *  2. Jalankan fungsi setup() sekali (izinkan akses).
 *  3. Deploy > Deployment baru > Aplikasi web
 *       Jalankan sebagai : Saya
 *       Akses            : Siapa saja
 *  4. Salin URL /exec ke js/config.js -> API_URL
 */

const SHEET_ID = '1QpbvYW5C66PKSZf5sJTfBy0qucEKcA85bS3t6LioapY';
const TOKEN_DAYS = 30;

const SCHEMA = {
  Users: ['id', 'tanggal', 'nama', 'whatsapp', 'email', 'kota', 'nama_toko', 'platform', 'minat',
          'status', 'level', 'role', 'password_hash', 'salt', 'token', 'token_exp', 'last_login'],
  Produk: ['sku', 'nama', 'kategori', 'supplier_id', 'bahan', 'ukuran', 'warna', 'harga_modal',
           'harga_jual_saran', 'stok', 'min_order', 'deskripsi', 'gambar_url', 'aktif'],
  Supplier: ['id', 'nama', 'kategori', 'lokasi', 'spesialisasi', 'min_order', 'estimasi_proses',
             'rating', 'status', 'kontak_internal', 'catatan'],
  Pesanan: ['id', 'tanggal', 'user_id', 'nama_dropshipper', 'nama_toko', 'sku', 'nama_produk', 'warna', 'ukuran',
            'qty', 'harga_modal', 'harga_jual', 'total_modal', 'profit', 'nama_penerima', 'hp_penerima',
            'alamat', 'ekspedisi', 'ongkir', 'resi', 'status', 'catatan']
};
const PRIVATE_USER_FIELDS = ['password_hash', 'salt', 'token', 'token_exp'];

/* ======================= ROUTER ======================= */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  return handle_(Object.assign({}, e ? e.parameter : {}, { action: action }));
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out_({ ok: false, error: 'Format data tidak valid.' }); }
  return handle_(body);
}

function handle_(p) {
  const routes = {
    ping: () => ({ pong: true, time: new Date() }),
    products: () => listProducts_(p.token),
    suppliers: () => listSuppliers_(),
    register: () => register_(p),
    login: () => login_(p),
    me: () => publicUser_(auth_(p.token).user),
    updateProfile: () => updateProfile_(p),
    myOrders: () => myOrders_(p.token),
    createOrder: () => createOrder_(p),
    logout: () => logout_(p.token)
  };
  try {
    if (!routes[p.action]) throw new Error('Aksi tidak dikenal: ' + p.action);
    return out_({ ok: true, data: routes[p.action]() });
  } catch (err) {
    return out_({ ok: false, error: err.message || String(err) });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ======================= SHEET HELPERS ======================= */
function ss_() { return SpreadsheetApp.openById(SHEET_ID); }

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Sheet "' + name + '" belum ada. Jalankan setup() terlebih dahulu.');
  return sh;
}

function rows_(name) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  const head = values.shift() || [];
  return values.map((r, i) => {
    const o = { _row: i + 2 };
    head.forEach((h, j) => { o[h] = r[j] instanceof Date ? r[j].toISOString() : r[j]; });
    return o;
  }).filter(o => head.some(h => o[h] !== '' && o[h] != null));
}

function append_(name, obj) {
  const sh = sheet_(name);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(head.map(h => (obj[h] == null ? '' : obj[h])));
}

function update_(name, rowIndex, patch) {
  const sh = sheet_(name);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  Object.keys(patch).forEach(k => {
    const c = head.indexOf(k);
    if (c > -1) sh.getRange(rowIndex, c + 1).setValue(patch[k]);
  });
}

function clean_(o) { const c = Object.assign({}, o); delete c._row; return c; }

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ======================= AUTH ======================= */
function hash_(pw, salt) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + pw, Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function normWA_(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.indexOf('0') === 0) d = '62' + d.slice(1);
  if (d.indexOf('8') === 0) d = '62' + d;
  return d;
}

function publicUser_(u) {
  const c = clean_(u);
  PRIVATE_USER_FIELDS.forEach(k => delete c[k]);
  c.whatsapp = String(c.whatsapp);
  return c;
}

function auth_(token) {
  if (!token) throw new Error('Sesi berakhir, silakan login kembali.');
  const u = rows_('Users').find(x => x.token && String(x.token) === String(token));
  if (!u || new Date(u.token_exp) < new Date()) throw new Error('Sesi berakhir, silakan login kembali.');
  if (String(u.status).toLowerCase() === 'nonaktif') throw new Error('Akun dinonaktifkan. Hubungi admin.');
  return { user: u };
}

function register_(p) {
  const req = ['nama', 'whatsapp', 'email', 'kota', 'platform', 'minat', 'password'];
  req.forEach(k => { if (!String(p[k] || '').trim()) throw new Error('Kolom ' + k + ' wajib diisi.'); });
  if (String(p.password).length < 6) throw new Error('Password minimal 6 karakter.');
  const wa = normWA_(p.whatsapp);
  if (!/^62\d{8,13}$/.test(wa)) throw new Error('Nomor WhatsApp tidak valid.');
  const email = String(p.email).trim().toLowerCase();

  return withLock_(() => {
    const users = rows_('Users');
    if (users.some(u => normWA_(u.whatsapp) === wa)) throw new Error('Nomor WhatsApp sudah terdaftar. Silakan login.');
    if (users.some(u => String(u.email).toLowerCase() === email)) throw new Error('Email sudah terdaftar. Silakan login.');
    const salt = Utilities.getUuid();
    const user = {
      id: 'DS-' + ('0000' + (users.length + 1)).slice(-4),
      tanggal: new Date(),
      nama: String(p.nama).trim(), whatsapp: "'" + wa, email: email,
      kota: String(p.kota).trim(), nama_toko: String(p.nama_toko || '').trim(),
      platform: p.platform, minat: p.minat,
      status: 'Menunggu Verifikasi', level: 'Dropshipper', role: 'dropshipper',
      password_hash: "'" + hash_(p.password, salt), salt: salt, token: '', token_exp: '', last_login: ''
    };
    append_('Users', user);
    user.whatsapp = wa;
    return publicUser_(user);
  });
}

function login_(p) {
  const id = String(p.identifier || '').trim().toLowerCase();
  if (!id || !p.password) throw new Error('Lengkapi WhatsApp/email dan password.');
  const wa = normWA_(id);
  const u = rows_('Users').find(x => normWA_(x.whatsapp) === wa || String(x.email).toLowerCase() === id);
  if (!u || hash_(p.password, u.salt) !== u.password_hash) throw new Error('Nomor WhatsApp/email atau password salah.');
  if (String(u.status).toLowerCase() === 'nonaktif') throw new Error('Akun dinonaktifkan. Hubungi admin.');
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  const exp = new Date(Date.now() + TOKEN_DAYS * 864e5);
  update_('Users', u._row, { token: "'" + token, token_exp: exp, last_login: new Date() });
  return { token: token, user: publicUser_(u) };
}

function logout_(token) {
  try { const u = auth_(token).user; update_('Users', u._row, { token: '', token_exp: '' }); } catch (e) {}
  return true;
}

function updateProfile_(p) {
  const u = auth_(p.token).user;
  const patch = {};
  ['nama', 'email', 'kota', 'nama_toko', 'platform'].forEach(k => { if (p[k] != null) patch[k] = String(p[k]).trim(); });
  update_('Users', u._row, patch);
  return publicUser_(Object.assign(u, patch));
}

/* ======================= DATA ======================= */
function listProducts_(token) {
  let logged = false;
  try { if (token) { auth_(token); logged = true; } } catch (e) {}
  return rows_('Produk')
    .filter(p => String(p.aktif).toUpperCase() !== 'FALSE' && String(p.aktif).toLowerCase() !== 'tidak')
    .map(p => {
      const c = clean_(p);
      if (!logged) delete c.harga_modal; // harga modal hanya untuk mitra yang login
      return c;
    });
}

function listSuppliers_() {
  return rows_('Supplier').map(s => { const c = clean_(s); delete c.kontak_internal; delete c.catatan; return c; });
}

function myOrders_(token) {
  const u = auth_(token).user;
  return rows_('Pesanan').filter(o => o.user_id === u.id).map(clean_).reverse();
}

function createOrder_(p) {
  const u = auth_(p.token).user;
  ['sku', 'nama_penerima', 'hp_penerima', 'alamat'].forEach(k => { if (!String(p[k] || '').trim()) throw new Error('Kolom ' + k + ' wajib diisi.'); });
  return withLock_(() => {
    const prod = rows_('Produk').find(x => x.sku === p.sku);
    if (!prod) throw new Error('Produk tidak ditemukan.');
    const qty = Math.max(1, parseInt(p.qty, 10) || 1);
    if (qty < (Number(prod.min_order) || 1)) throw new Error('Minimal order produk ini ' + prod.min_order + ' pcs.');
    const stok = Number(prod.stok) || 0;
    const isReady = stok > 0;
    if (isReady && qty > stok) throw new Error('Stok tidak cukup. Sisa ' + stok + ' pcs.');
    const modal = Number(prod.harga_modal) || 0;
    const jual = Number(p.harga_jual) || Number(prod.harga_jual_saran) || 0;
    const order = {
      id: 'ORD-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10),
      tanggal: new Date(), user_id: u.id, nama_dropshipper: u.nama, nama_toko: u.nama_toko,
      sku: prod.sku, nama_produk: prod.nama, warna: p.warna || '', ukuran: p.ukuran || '', qty: qty,
      harga_modal: modal, harga_jual: jual, total_modal: modal * qty, profit: (jual - modal) * qty,
      nama_penerima: p.nama_penerima, hp_penerima: "'" + String(p.hp_penerima), alamat: p.alamat,
      ekspedisi: p.ekspedisi || '', ongkir: '', resi: '', status: 'Menunggu Pembayaran', catatan: p.catatan || ''
    };
    append_('Pesanan', order);
    if (isReady) update_('Produk', prod._row, { stok: stok - qty });
    order.hp_penerima = String(p.hp_penerima);
    order.tanggal = order.tanggal.toISOString();
    return order;
  });
}

/* ======================= SETUP (jalankan sekali) ======================= */
function setup() {
  const ss = ss_();
  Object.keys(SCHEMA).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, SCHEMA[name].length).setValues([SCHEMA[name]])
        .setFontWeight('bold').setBackground('#1c1917').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  // hapus Sheet1 bawaan bila kosong
  const s1 = ss.getSheetByName('Sheet1');
  if (s1 && s1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s1);

  // kolom status pesanan & user diberi dropdown agar admin mudah mengubah
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'], true).build();
  sheet_('Pesanan').getRange(2, SCHEMA.Pesanan.indexOf('status') + 1, 1000).setDataValidation(statusRule);
  const userRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Menunggu Verifikasi', 'Aktif', 'Nonaktif'], true).build();
  sheet_('Users').getRange(2, SCHEMA.Users.indexOf('status') + 1, 1000).setDataValidation(userRule);

  seed_('Supplier', SEED_SUPPLIERS);
  seed_('Produk', SEED_PRODUCTS);
  Logger.log('Setup selesai. Sekarang Deploy > Deployment baru > Aplikasi web.');
}

function seed_(name, list) {
  const sh = sheet_(name);
  if (sh.getLastRow() > 1) return; // sudah ada data, jangan timpa
  const head = SCHEMA[name];
  sh.getRange(2, 1, list.length, head.length).setValues(list.map(o => head.map(h => (o[h] == null ? '' : o[h]))));
  sh.autoResizeColumns(1, head.length);
}

const SEED_SUPPLIERS = [
  { id: 'SUP-01', nama: 'Mitra Konveksi Kaos Polos', kategori: 'Kaos Polos', lokasi: 'Bandung (Suci), Jawa Barat', spesialisasi: 'Kaos cotton combed 20s/24s/30s, oversize, lengan panjang', min_order: '1 pcs (dropship) / 3 lusin (grosir)', estimasi_proses: 'Kirim H+1', rating: 4.9, status: 'Terverifikasi', kontak_internal: '', catatan: '' },
  { id: 'SUP-02', nama: 'Mitra Pakaian Anak', kategori: 'Baju Anak', lokasi: 'Solo, Jawa Tengah', spesialisasi: 'Setelan anak, kaos karakter polos, piyama katun bayi–12 th', min_order: '1 pcs / 1 seri ukuran', estimasi_proses: 'Kirim H+1', rating: 4.8, status: 'Terverifikasi', kontak_internal: '', catatan: '' },
  { id: 'SUP-03', nama: 'Mitra Kemeja Formal', kategori: 'Kemeja Kantor', lokasi: 'Jakarta (Tanah Abang)', spesialisasi: 'Kemeja kantor pria & wanita, katun/oxford/japan drill, seragam', min_order: '1 pcs / 12 pcs seragam', estimasi_proses: 'Kirim H+1–2', rating: 4.8, status: 'Terverifikasi', kontak_internal: '', catatan: '' },
  { id: 'SUP-04', nama: 'Mitra Bahan & Kain', kategori: 'Bahan Baku', lokasi: 'Bandung (Cigondewah)', spesialisasi: 'Kain cotton combed, fleece, lacoste, drill per roll/kg', min_order: '1 roll / 25 kg', estimasi_proses: 'Kirim H+1–2', rating: 4.7, status: 'Terverifikasi', kontak_internal: '', catatan: '' },
  { id: 'SUP-05', nama: 'Mitra Konveksi & Sablon', kategori: 'Produksi Pakaian', lokasi: 'Bandung & Bogor', spesialisasi: 'Produksi brand sendiri: sablon DTF/plastisol, bordir, label & packaging', min_order: '24 pcs per desain', estimasi_proses: '14–21 hari kerja', rating: 4.9, status: 'Terverifikasi', kontak_internal: '', catatan: '' },
  { id: 'SUP-06', nama: 'Mitra Hoodie & Outerwear', kategori: 'Kaos Polos', lokasi: 'Bandung, Jawa Barat', spesialisasi: 'Hoodie, crewneck, zipper fleece cotton 280–330 gsm', min_order: '1 pcs / 1 lusin', estimasi_proses: 'Kirim H+1–2', rating: 4.7, status: 'Terverifikasi', kontak_internal: '', catatan: '' }
];

const SEED_PRODUCTS = [
  { sku: 'KP-001', nama: 'Kaos Polos Cotton Combed 30s', kategori: 'Kaos Polos', supplier_id: 'SUP-01', bahan: 'Cotton combed 30s (150 gsm)', ukuran: 'S, M, L, XL, XXL', warna: 'Hitam, Putih, Navy, Merah, Maroon, Abu Misty', harga_modal: 32000, harga_jual_saran: 55000, stok: 1200, min_order: 1, deskripsi: 'Kaos basic adem, jahitan rantai di bahu, cocok untuk sablon & daily wear.', gambar_url: '', aktif: true },
  { sku: 'KP-002', nama: 'Kaos Oversize Cotton 24s', kategori: 'Kaos Polos', supplier_id: 'SUP-01', bahan: 'Cotton combed 24s (190 gsm)', ukuran: 'M, L, XL', warna: 'Hitam, Putih, Cream, Dusty Pink, Sage', harga_modal: 45000, harga_jual_saran: 79000, stok: 640, min_order: 1, deskripsi: 'Potongan boxy drop-shoulder, tebal tidak menerawang. Best seller anak muda.', gambar_url: '', aktif: true },
  { sku: 'KP-003', nama: 'Kaos Lengan Panjang Combed 30s', kategori: 'Kaos Polos', supplier_id: 'SUP-01', bahan: 'Cotton combed 30s', ukuran: 'S, M, L, XL, XXL', warna: 'Hitam, Putih, Merah, Dusty Pink, Navy', harga_modal: 39000, harga_jual_saran: 65000, stok: 520, min_order: 1, deskripsi: 'Lengan panjang manset rib, nyaman untuk muslimah & outer layering.', gambar_url: '', aktif: true },
  { sku: 'KP-004', nama: 'Hoodie Polos Fleece 280gsm', kategori: 'Kaos Polos', supplier_id: 'SUP-06', bahan: 'Cotton fleece 280 gsm', ukuran: 'M, L, XL, XXL', warna: 'Hitam, Abu Misty, Navy, Cream', harga_modal: 89000, harga_jual_saran: 145000, stok: 300, min_order: 1, deskripsi: 'Hoodie tebal bagian dalam berbulu halus, tali & kantong kangguru.', gambar_url: '', aktif: true },
  { sku: 'BA-001', nama: 'Kaos Anak Polos Combed 30s', kategori: 'Baju Anak', supplier_id: 'SUP-02', bahan: 'Cotton combed 30s', ukuran: '1-2th, 3-4th, 5-6th, 7-8th, 9-10th', warna: 'Kuning, Biru Muda, Pink, Putih, Hijau Mint', harga_modal: 22000, harga_jual_saran: 39000, stok: 900, min_order: 1, deskripsi: 'Lembut di kulit anak, tidak panas, aman untuk kulit sensitif.', gambar_url: '', aktif: true },
  { sku: 'BA-002', nama: 'Setelan Anak Harian (Kaos + Celana)', kategori: 'Baju Anak', supplier_id: 'SUP-02', bahan: 'Cotton spandex', ukuran: '1-2th, 3-4th, 5-6th, 7-8th', warna: 'Pink, Biru Muda, Kuning, Sage', harga_modal: 42000, harga_jual_saran: 75000, stok: 410, min_order: 1, deskripsi: 'Setelan santai stretch, pinggang karet, cocok untuk main & tidur.', gambar_url: '', aktif: true },
  { sku: 'BA-003', nama: 'Piyama Anak Katun Lengan Panjang', kategori: 'Baju Anak', supplier_id: 'SUP-02', bahan: 'Katun jersey', ukuran: '2-3th, 4-5th, 6-7th, 8-9th', warna: 'Biru Muda, Pink, Cream', harga_modal: 48000, harga_jual_saran: 85000, stok: 260, min_order: 1, deskripsi: 'Piyama adem motif polos, kancing depan, mudah dipakai sendiri.', gambar_url: '', aktif: true },
  { sku: 'KK-001', nama: 'Kemeja Kantor Pria Slim Fit', kategori: 'Kemeja Kantor', supplier_id: 'SUP-03', bahan: 'Katun oxford', ukuran: 'S, M, L, XL, XXL', warna: 'Putih, Biru Muda, Navy, Abu Misty', harga_modal: 78000, harga_jual_saran: 135000, stok: 350, min_order: 1, deskripsi: 'Kemeja formal lengan panjang, kerah kaku, tidak mudah kusut.', gambar_url: '', aktif: true },
  { sku: 'KK-002', nama: 'Kemeja Wanita Formal Lengan Panjang', kategori: 'Kemeja Kantor', supplier_id: 'SUP-03', bahan: 'Katun toyobo', ukuran: 'S, M, L, XL', warna: 'Putih, Dusty Pink, Biru Muda, Cream', harga_modal: 72000, harga_jual_saran: 125000, stok: 280, min_order: 1, deskripsi: 'Potongan rapi untuk kerja, busui friendly dengan kancing depan.', gambar_url: '', aktif: true },
  { sku: 'KK-003', nama: 'Kemeja Seragam Japan Drill', kategori: 'Kemeja Kantor', supplier_id: 'SUP-03', bahan: 'Japan drill', ukuran: 'S, M, L, XL, XXL, 3XL', warna: 'Navy, Hitam, Abu Misty, Putih', harga_modal: 95000, harga_jual_saran: 160000, stok: 200, min_order: 12, deskripsi: 'Untuk seragam kantor/komunitas, bisa tambah bordir logo.', gambar_url: '', aktif: true },
  { sku: 'PR-001', nama: 'Produksi Kaos Brand Sendiri (Sablon DTF)', kategori: 'Produksi Pakaian', supplier_id: 'SUP-05', bahan: 'Cotton combed 24s/30s', ukuran: 'S – XXL', warna: 'Bebas pilih', harga_modal: 58000, harga_jual_saran: 99000, stok: 0, min_order: 24, deskripsi: 'Harga per pcs termasuk sablon DTF A4, label leher & plastik. Proses 14 hari kerja.', gambar_url: '', aktif: true },
  { sku: 'PR-002', nama: 'Produksi Kemeja Seragam + Bordir', kategori: 'Produksi Pakaian', supplier_id: 'SUP-05', bahan: 'Japan drill / American drill', ukuran: 'S – 3XL', warna: 'Bebas pilih', harga_modal: 115000, harga_jual_saran: 185000, stok: 0, min_order: 24, deskripsi: 'Termasuk bordir logo dada & lengan. Cocok untuk instansi, sekolah, komunitas.', gambar_url: '', aktif: true }
];
