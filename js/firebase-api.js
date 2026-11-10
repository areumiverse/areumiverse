/* AreumiVerse — backend Firebase (Authentication + Cloud Firestore)
   Struktur koleksi:
     users/{uid}          profil mitra (status/level/role hanya diubah admin)
     wa_index/{62xxx}     { email } -> agar bisa login pakai nomor WhatsApp
     produk/{sku}         data produk publik (tanpa harga modal)
     produk_modal/{sku}   { harga_modal } -> hanya untuk yang login
     supplier/{id}        daftar supplier
     pesanan/{autoId}     pesanan; mitra hanya bisa membaca miliknya
     admins/{uid}         dokumen kosong = akun admin
*/
(function () {
  const V = "10.12.2";
  const BASE = `https://www.gstatic.com/firebasejs/${V}/`;
  let ready = null;

  function boot() {
    if (ready) return ready;
    ready = (async () => {
      const [appM, authM, fsM] = await Promise.all([
        import(BASE + "firebase-app.js"),
        import(BASE + "firebase-auth.js"),
        import(BASE + "firebase-firestore.js")
      ]);
      const app = appM.initializeApp(window.AREUMI_CONFIG.FIREBASE);
      const auth = authM.getAuth(app);
      const db = fsM.getFirestore(app);
      // tunggu status login awal dipulihkan dari penyimpanan browser
      await new Promise((res) => { const off = authM.onAuthStateChanged(auth, () => { off(); res(); }); });
      return { auth, db, A: authM, F: fsM };
    })();
    return ready;
  }

  const normWA = (v) => {
    let d = String(v || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "62" + d.slice(1);
    if (d.startsWith("8")) d = "62" + d;
    return d;
  };
  const SESSION_ERR = "Sesi berakhir, silakan login kembali.";
  const friendly = (e) => {
    const c = (e && e.code) || "";
    const map = {
      "auth/email-already-in-use": "Email sudah terdaftar. Silakan login.",
      "auth/invalid-email": "Format email tidak valid.",
      "auth/weak-password": "Password minimal 6 karakter.",
      "auth/invalid-credential": "Nomor WhatsApp/email atau password salah.",
      "auth/wrong-password": "Nomor WhatsApp/email atau password salah.",
      "auth/user-not-found": "Nomor WhatsApp/email atau password salah.",
      "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
      "auth/network-request-failed": "Koneksi internet bermasalah.",
      "permission-denied": "Akses ditolak oleh aturan database."
    };
    return new Error(map[c] || (e && e.message) || "Terjadi kesalahan.");
  };
  const wrap = (fn) => async (p) => { try { return await fn(p || {}); } catch (e) { throw e && e.code ? friendly(e) : e; } };

  async function currentUser() {
    const { auth } = await boot();
    if (!auth.currentUser) throw new Error(SESSION_ERR);
    return auth.currentUser;
  }
  async function profile(uid) {
    const { db, F } = await boot();
    const snap = await F.getDoc(F.doc(db, "users", uid));
    if (!snap.exists()) throw new Error("Profil tidak ditemukan. Hubungi admin.");
    const u = snap.data();
    u.uid = uid;
    try { u.is_admin = (await F.getDoc(F.doc(db, "admins", uid))).exists(); } catch (e) { u.is_admin = false; }
    return u;
  }
  const docs = (snap) => snap.docs.map((d) => Object.assign({ _id: d.id }, d.data()));

  const api = {
    products: wrap(async () => {
      const { auth, db, F } = await boot();
      const list = docs(await F.getDocs(F.collection(db, "produk"))).filter((p) => p.aktif !== false);
      if (auth.currentUser) {
        const modal = {};
        docs(await F.getDocs(F.collection(db, "produk_modal"))).forEach((m) => { modal[m._id] = m.harga_modal; });
        list.forEach((p) => { p.harga_modal = modal[p.sku] || 0; });
      }
      return list.sort((a, b) => String(a.sku).localeCompare(b.sku));
    }),

    suppliers: wrap(async () => {
      const { db, F } = await boot();
      return docs(await F.getDocs(F.collection(db, "supplier"))).sort((a, b) => String(a.id).localeCompare(b.id));
    }),

    register: wrap(async (d) => {
      const { auth, db, A, F } = await boot();
      const wa = normWA(d.whatsapp);
      const email = String(d.email || "").trim().toLowerCase();
      if ((await F.getDoc(F.doc(db, "wa_index", wa))).exists()) throw new Error("Nomor WhatsApp sudah terdaftar. Silakan login.");
      const cred = await A.createUserWithEmailAndPassword(auth, email, d.password);
      const uid = cred.user.uid;
      const user = {
        id: "DS-" + uid.slice(0, 6).toUpperCase(),
        tanggal: new Date().toISOString(),
        nama: String(d.nama).trim(), whatsapp: wa, email,
        kota: String(d.kota || "").trim(), nama_toko: String(d.nama_toko || "").trim(),
        platform: d.platform || "", minat: d.minat || "",
        status: "Menunggu Verifikasi", level: "Dropshipper", role: "dropshipper"
      };
      const batch = F.writeBatch(db);
      batch.set(F.doc(db, "users", uid), user);
      batch.set(F.doc(db, "wa_index", wa), { email });
      await batch.commit();
      // Setelah daftar langsung lanjut ke WhatsApp, jadi keluarkan sesi agar login dilakukan dengan sadar
      await A.signOut(auth);
      return user;
    }),

    login: wrap(async (d) => {
      const { auth, db, A, F } = await boot();
      let email = String(d.identifier || "").trim().toLowerCase();
      if (!email.includes("@")) {
        const idx = await F.getDoc(F.doc(db, "wa_index", normWA(email)));
        if (!idx.exists()) throw new Error("Nomor WhatsApp/email atau password salah.");
        email = idx.data().email;
      }
      const cred = await A.signInWithEmailAndPassword(auth, email, d.password);
      const u = await profile(cred.user.uid);
      if (String(u.status).toLowerCase() === "nonaktif") { await A.signOut(auth); throw new Error("Akun dinonaktifkan. Hubungi admin."); }
      return { token: cred.user.uid, user: u };
    }),

    resetPassword: wrap(async (d) => {
      const { auth, db, A, F } = await boot();
      let email = String(d.identifier || "").trim().toLowerCase();
      if (!email.includes("@")) {
        const idx = await F.getDoc(F.doc(db, "wa_index", normWA(email)));
        if (!idx.exists()) throw new Error("Nomor WhatsApp tidak terdaftar.");
        email = idx.data().email;
      }
      await A.sendPasswordResetEmail(auth, email);
      return email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
    }),

    me: wrap(async () => profile((await currentUser()).uid)),

    updateProfile: wrap(async (d) => {
      const { db, F } = await boot();
      const uid = (await currentUser()).uid;
      const patch = {};
      ["nama", "kota", "nama_toko", "platform"].forEach((k) => { if (d[k] != null) patch[k] = String(d[k]).trim(); });
      await F.updateDoc(F.doc(db, "users", uid), patch);
      return profile(uid);
    }),

    myOrders: wrap(async () => {
      const { db, F } = await boot();
      const uid = (await currentUser()).uid;
      const q = F.query(F.collection(db, "pesanan"), F.where("user_uid", "==", uid));
      return docs(await F.getDocs(q)).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
    }),

    createOrder: wrap(async (d) => {
      const { db, F } = await boot();
      const uid = (await currentUser()).uid;
      const me = await profile(uid);
      const ref = F.doc(F.collection(db, "pesanan"));
      return F.runTransaction(db, async (tx) => {
        const pSnap = await tx.get(F.doc(db, "produk", d.sku));
        const mSnap = await tx.get(F.doc(db, "produk_modal", d.sku));
        if (!pSnap.exists()) throw new Error("Produk tidak ditemukan.");
        const p = pSnap.data();
        const modal = Number(mSnap.exists() ? mSnap.data().harga_modal : 0);
        const qty = Math.max(1, parseInt(d.qty, 10) || 1);
        if (qty < (Number(p.min_order) || 1)) throw new Error("Minimal order produk ini " + p.min_order + " pcs.");
        const stok = Number(p.stok) || 0;
        if (stok > 0 && qty > stok) throw new Error("Stok tidak cukup. Sisa " + stok + " pcs.");
        const jual = Number(d.harga_jual) || Number(p.harga_jual_saran) || 0;
        const now = new Date();
        const o = {
          id: "ORD-" + now.toISOString().slice(2, 10).replace(/-/g, "") + "-" + ref.id.slice(0, 5).toUpperCase(),
          tanggal: now.toISOString(), user_uid: uid, user_id: me.id, nama_dropshipper: me.nama, nama_toko: me.nama_toko || "",
          sku: d.sku, nama_produk: p.nama, warna: d.warna || "", ukuran: d.ukuran || "", qty,
          harga_modal: modal, harga_jual: jual, total_modal: modal * qty, profit: (jual - modal) * qty,
          nama_penerima: String(d.nama_penerima || "").trim(), hp_penerima: String(d.hp_penerima || "").trim(),
          alamat: String(d.alamat || "").trim(), ekspedisi: d.ekspedisi || "", ongkir: 0, resi: "",
          status: "Menunggu Pembayaran", catatan: String(d.catatan || "").trim()
        };
        tx.set(ref, o);
        if (stok > 0) tx.update(F.doc(db, "produk", d.sku), { stok: stok - qty });
        return o;
      });
    }),

    logout: wrap(async () => { const { auth, A } = await boot(); await A.signOut(auth); return true; }),

    /* ---------- Khusus admin ---------- */
    adminUsers: wrap(async () => {
      const { db, F } = await boot();
      return docs(await F.getDocs(F.collection(db, "users"))).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
    }),
    adminSetUser: wrap(async (d) => {
      const { db, F } = await boot();
      const patch = {}; ["status", "level"].forEach((k) => { if (d[k]) patch[k] = d[k]; });
      await F.updateDoc(F.doc(db, "users", d.uid), patch);
      return true;
    }),
    adminOrders: wrap(async () => {
      const { db, F } = await boot();
      return docs(await F.getDocs(F.collection(db, "pesanan"))).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
    }),
    adminSetOrder: wrap(async (d) => {
      const { db, F } = await boot();
      const patch = {};
      if (d.status) patch.status = d.status;
      if (d.resi != null) patch.resi = String(d.resi).trim();
      if (d.ongkir != null) patch.ongkir = Number(d.ongkir) || 0;
      await F.updateDoc(F.doc(db, "pesanan", d._id), patch);
      return true;
    }),
    adminSeed: wrap(async () => {
      const { db, F } = await boot();
      const demo = window.AREUMI_DEMO;
      const batch = F.writeBatch(db);
      demo.suppliers.forEach((s) => batch.set(F.doc(db, "supplier", s.id), s));
      demo.products.forEach((p) => {
        const pub = Object.assign({}, p, { aktif: true }); delete pub.harga_modal;
        batch.set(F.doc(db, "produk", p.sku), pub);
        batch.set(F.doc(db, "produk_modal", p.sku), { harga_modal: p.harga_modal });
      });
      await batch.commit();
      return { produk: demo.products.length, supplier: demo.suppliers.length };
    })
  };

  window.AreumiFirebase = api;
})();
