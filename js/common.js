/* AreumiVerse — utilitas bersama: API, sesi, format, ilustrasi produk */
(function () {
  const CFG = window.AREUMI_CONFIG || {};
  const DEMO = !CFG.API_URL;

  /* ---------- Format ---------- */
  const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const normWA = (v) => {
    let d = String(v || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "62" + d.slice(1);
    if (d.startsWith("8")) d = "62" + d;
    return d;
  };
  const waLink = (text, to) => "https://wa.me/" + (to || CFG.WA_ADMIN) + "?text=" + encodeURIComponent(text);
  const fmtDate = (v) => {
    const d = new Date(v);
    return isNaN(d) ? String(v || "") : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  /* ---------- Ilustrasi produk (SVG) ---------- */
  const COLORS = {
    hitam: "#232323", putih: "#f4f1ec", navy: "#25324d", merah: "#c4231f", maroon: "#6e1a24",
    "abu misty": "#a7abb0", cream: "#ece0c8", "dusty pink": "#d79c94", sage: "#a3b39a",
    kuning: "#f2c84b", "biru muda": "#9cc7e6", pink: "#f0a9bd", "hijau mint": "#a6dcc6", "bebas pilih": "#c4231f"
  };
  const colorHex = (name) => COLORS[String(name || "").trim().toLowerCase()] || "#c4231f";
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    return "#" + [c(n >> 16), c((n >> 8) & 255), c(n & 255)].map((x) => x.toString(16).padStart(2, "0")).join("");
  };
  function garmentSVG(kategori, warna) {
    const fill = colorHex(warna);
    const line = shade(fill, -38);
    const k = String(kategori || "").toLowerCase();
    let body;
    if (k.includes("kemeja")) {
      body = `<path d="M60 40 L88 30 Q100 40 112 30 L140 40 L172 72 L154 92 L140 80 L140 170 L60 170 L60 80 L46 92 L28 72 Z" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M88 30 L100 52 L112 30 L106 26 L100 36 L94 26 Z" fill="${shade(fill, 18)}" stroke="${line}" stroke-width="2"/>
        <line x1="100" y1="52" x2="100" y2="170" stroke="${line}" stroke-width="2"/>
        ${[70, 92, 114, 136, 158].map((y) => `<circle cx="104" cy="${y}" r="2.6" fill="${line}"/>`).join("")}
        <rect x="114" y="74" width="16" height="14" rx="2" fill="none" stroke="${line}" stroke-width="2"/>`;
    } else if (k.includes("anak")) {
      body = `<path d="M70 52 L88 44 Q100 56 112 44 L130 52 L156 74 L142 90 L130 82 L130 150 L70 150 L70 82 L58 90 L44 74 Z" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M88 44 Q100 56 112 44" fill="none" stroke="${line}" stroke-width="3"/>
        <circle cx="100" cy="104" r="12" fill="${shade(fill, 30)}" stroke="${line}" stroke-width="2"/>
        <path d="M95 102 h0.01 M105 102 h0.01" stroke="${line}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M95 108 Q100 112 105 108" fill="none" stroke="${line}" stroke-width="2" stroke-linecap="round"/>`;
    } else if (k.includes("produksi")) {
      body = `<path d="M58 40 L84 30 Q100 46 116 30 L142 40 L174 74 L154 94 L140 82 L140 170 L60 170 L60 82 L46 94 L26 74 Z" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M84 30 Q100 46 116 30" fill="none" stroke="${line}" stroke-width="3"/>
        <rect x="76" y="82" width="48" height="44" rx="4" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 5"/>
        <text x="100" y="109" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#fff">LOGO</text>`;
    } else {
      body = `<path d="M58 40 L84 30 Q100 46 116 30 L142 40 L174 74 L154 94 L140 82 L140 170 L60 170 L60 82 L46 94 L26 74 Z" fill="${fill}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M84 30 Q100 46 116 30" fill="none" stroke="${line}" stroke-width="3"/>
        <path d="M60 82 L60 60 M140 82 L140 60" stroke="${line}" stroke-width="1.5" opacity=".45"/>`;
    }
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi ${esc(kategori)}">${body}</svg>`;
  }
  function productVisual(p, warna) {
    if (p.gambar_url) return `<img src="${esc(p.gambar_url)}" alt="${esc(p.nama)}" loading="lazy">`;
    const first = warna || String(p.warna || "").split(",")[0];
    return garmentSVG(p.kategori, first);
  }
  function swatches(p, max) {
    const list = String(p.warna || "").split(",").map((s) => s.trim()).filter(Boolean);
    const shown = list.slice(0, max || 6);
    return shown.map((w) => `<span class="swatch" title="${esc(w)}" style="background:${colorHex(w)}"></span>`).join("") +
      (list.length > shown.length ? `<span class="swatch-more">+${list.length - shown.length}</span>` : "");
  }

  /* ---------- Sesi ---------- */
  const SKEY = "areumi_session";
  const session = {
    get() { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(SKEY, JSON.stringify(v)); } catch (e) {} },
    clear() { try { localStorage.removeItem(SKEY); } catch (e) {} }
  };

  /* ---------- Backend DEMO (localStorage) ---------- */
  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const store = {
    read(k, d) { try { return JSON.parse(localStorage.getItem("areumi_demo_" + k)) || d; } catch (e) { return d; } },
    write(k, v) { try { localStorage.setItem("areumi_demo_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const publicUser = (u) => { const c = Object.assign({}, u); delete c.password_hash; delete c.token; return c; };
  const demoApi = {
    async products() { return window.AREUMI_DEMO.products; },
    async suppliers() { return window.AREUMI_DEMO.suppliers; },
    async register(d) {
      const users = store.read("users", []);
      const wa = normWA(d.whatsapp);
      if (users.some((u) => u.whatsapp === wa)) throw new Error("Nomor WhatsApp sudah terdaftar. Silakan login.");
      const u = { id: "DS-" + String(users.length + 1).padStart(4, "0"), tanggal: new Date().toISOString(), nama: d.nama, whatsapp: wa,
        email: d.email, kota: d.kota, nama_toko: d.nama_toko, platform: d.platform, minat: d.minat,
        password_hash: await sha256(d.password), status: "Menunggu Verifikasi", role: "dropshipper" };
      users.push(u); store.write("users", users);
      return publicUser(u);
    },
    async login(d) {
      const users = store.read("users", []);
      const id = String(d.identifier || "").trim().toLowerCase();
      const wa = normWA(id);
      const u = users.find((x) => x.whatsapp === wa || String(x.email).toLowerCase() === id);
      if (!u || u.password_hash !== (await sha256(d.password))) throw new Error("Nomor WhatsApp/email atau password salah.");
      u.token = "demo-" + Math.random().toString(36).slice(2);
      store.write("users", users);
      return { token: u.token, user: publicUser(u) };
    },
    async me(d) {
      const u = store.read("users", []).find((x) => x.token && x.token === d.token);
      if (!u) throw new Error("Sesi berakhir, silakan login kembali.");
      return publicUser(u);
    },
    async myOrders(d) {
      const me = await demoApi.me(d);
      return store.read("orders", []).filter((o) => o.user_id === me.id).reverse();
    },
    async createOrder(d) {
      const me = await demoApi.me(d);
      const p = window.AREUMI_DEMO.products.find((x) => x.sku === d.sku);
      if (!p) throw new Error("Produk tidak ditemukan.");
      const orders = store.read("orders", []);
      const qty = Number(d.qty) || 1;
      const o = { id: "ORD-" + Date.now().toString().slice(-8), tanggal: new Date().toISOString(), user_id: me.id, nama_dropshipper: me.nama,
        sku: p.sku, nama_produk: p.nama, warna: d.warna, ukuran: d.ukuran, qty, harga_modal: p.harga_modal, harga_jual: Number(d.harga_jual) || p.harga_jual_saran,
        total_modal: p.harga_modal * qty, profit: ((Number(d.harga_jual) || p.harga_jual_saran) - p.harga_modal) * qty,
        nama_penerima: d.nama_penerima, hp_penerima: d.hp_penerima, alamat: d.alamat, ekspedisi: d.ekspedisi, resi: "", status: "Menunggu Pembayaran", catatan: d.catatan || "" };
      orders.push(o); store.write("orders", orders);
      return o;
    },
    async updateProfile(d) {
      const users = store.read("users", []);
      const u = users.find((x) => x.token && x.token === d.token);
      if (!u) throw new Error("Sesi berakhir, silakan login kembali.");
      ["nama", "email", "kota", "nama_toko", "platform"].forEach((k) => { if (d[k] != null) u[k] = d[k]; });
      store.write("users", users);
      return publicUser(u);
    },
    async logout() { return true; }
  };

  /* ---------- Backend NYATA (Google Apps Script) ---------- */
  async function remote(action, payload) {
    const res = await fetch(CFG.API_URL, {
      method: "POST",
      // text/plain agar tidak memicu CORS preflight di Apps Script
      body: JSON.stringify(Object.assign({ action }, payload || {}))
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Terjadi kesalahan pada server.");
    return json.data;
  }

  const api = new Proxy({}, {
    get: (_, action) => async (payload) => {
      if (DEMO) return demoApi[action](payload || {});
      try { return await remote(action, payload); }
      catch (err) {
        // katalog & supplier tetap tampil walau API gagal
        if (action === "products" || action === "suppliers") { console.warn("API gagal, memakai data contoh:", err); return demoApi[action](); }
        throw err;
      }
    }
  });

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    let box = document.getElementById("toast-box");
    if (!box) { box = document.createElement("div"); box.id = "toast-box"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 3600);
    setTimeout(() => t.remove(), 4100);
  }

  window.Areumi = { CFG, DEMO, api, session, rupiah, esc, normWA, waLink, fmtDate, garmentSVG, productVisual, swatches, colorHex, toast };
})();
