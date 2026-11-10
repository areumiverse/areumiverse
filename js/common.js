/* AreumiVerse — utilitas bersama: API, sesi, format, ilustrasi produk */
(function () {
  const CFG = window.AREUMI_CONFIG || {};
  const BACKEND = CFG.FIREBASE && CFG.FIREBASE.apiKey ? "firebase" : CFG.API_URL ? "sheets" : "demo";
  const DEMO = BACKEND === "demo";

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
    "abu misty": "#a7abb0", cream: "#efe7da", "dusty pink": "#d79c94", "dusty rose": "#cf8f8a", sage: "#8fa58a",
    kuning: "#f2c84b", "biru muda": "#9cc7e6", pink: "#e9a3b4", "hijau mint": "#a6dcc6", "bebas pilih": "#232323",
    "rose plum": "#b0798c", denim: "#5a7fb5", mono: "#3a3a3c", latte: "#b89a7e", "blue terracotta": "#6b86c4",
    mocha: "#7a5a45", brown: "#a8693a", white: "#f7f7f7", blue: "#4f7fb8", magenta: "#8e1f5c",
    ungu: "#6b3fa0", "abu tua": "#4a4a4a", "biru benhur": "#1e4fc0", khaki: "#b8a272", bata: "#b5503c",
    coklat: "#7a4a2e", lilac: "#b9a6d9"
  };
  const colorHex = (name) => COLORS[String(name || "").trim().toLowerCase()] || "#232323";
  const colorList = (p) => String(p.warna || "").split(",").map((s) => s.trim()).filter(Boolean);
  const CAT_ART = {
    "kaos polos": ["tee", "AREUMI"], "baju anak": ["kids", "AREUMI"], "kemeja kantor": ["shirt", "RAYNOZ"], "produksi pakaian": ["print", "RAYNOZ"]
  };
  // ilustrasi mockup untuk kartu kategori
  function garmentSVG(kategori, warna) {
    const k = CAT_ART[String(kategori || "").toLowerCase()] || ["tee", "AREUMI"];
    return window.AreumiMockup.mockup(k[0], colorHex(warna), { brand: k[1] });
  }
  /* Gambar produk. Urutan: foto per warna -> mockup per warna (bila produk punya tipe)
     -> gambar_url -> foto pertama -> mockup tebakan. */
  function productSrc(p, warna) {
    const w = warna || colorList(p)[0];
    if (p.foto && p.foto[w]) return p.foto[w];
    if (warna && p.tipe) return null;
    if (p.gambar_url) return p.gambar_url;
    if (p.foto) return Object.values(p.foto)[0];
    return null;
  }
  function productVisual(p, warna) {
    const w = warna || colorList(p)[0];
    const src = productSrc(p, warna);
    if (src) return `<img src="${esc(src)}" alt="${esc(p.nama)} warna ${esc(w)}" loading="lazy">`;
    const M = window.AreumiMockup;
    return M.mockup(p.tipe || M.guessType(p), colorHex(w), { brand: p.brand || "AREUMI", print: p.print });
  }
  const supplierLogo = (s) => window.AreumiMockup.supplierLogo(s);
  const swatchBg = (w) => /^(random|bebas pilih)$/i.test(w)
    ? "conic-gradient(#c4231f, #f2c84b, #8fa58a, #4f7fb8, #b9a6d9, #c4231f)" : colorHex(w);
  function swatches(p, max) {
    const list = colorList(p);
    const shown = list.slice(0, max || 6);
    return shown.map((w) => `<span class="swatch" title="${esc(w)}" style="background:${swatchBg(w)}"></span>`).join("") +
      (list.length > shown.length ? `<span class="swatch-more">+${list.length - shown.length}</span>` : "");
  }

  /* ---------- Detail produk + galeri foto ---------- */
  function openProduct(p, opts) {
    opts = opts || {};
    let box = document.getElementById("pd-modal");
    if (!box) {
      box = document.createElement("div");
      box.id = "pd-modal"; box.className = "modal"; box.setAttribute("aria-hidden", "true");
      document.body.appendChild(box);
      box.addEventListener("click", (e) => { if (e.target.closest("[data-pd-close]")) closeProduct(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeProduct(); });
    }
    const colors = colorList(p);
    const shots = [];
    colors.forEach((w) => { const s = p.foto && p.foto[w]; if (s && !shots.some((x) => x.src === s)) shots.push({ src: s, label: w }); });
    if (p.gambar_url && !shots.some((x) => x.src === p.gambar_url)) shots.push({ src: p.gambar_url, label: "Foto produk" });
    (p.galeri || []).forEach((g) => { if (!shots.some((x) => x.src === g)) shots.push({ src: g, label: "Galeri" }); });
    const main = shots.length ? `<img id="pd-main" src="${esc(shots[0].src)}" alt="${esc(p.nama)}">` : productVisual(p);
    const margin = opts.showModal && p.harga_modal ? `<div><div class="lbl">Harga modal</div><div class="val">${rupiah(p.harga_modal)}</div></div>` : "";
    box.innerHTML = `<div class="modal-backdrop" data-pd-close></div>
      <div class="modal-card pd-card" role="dialog" aria-modal="true" aria-label="${esc(p.nama)}">
        <button class="icon-btn pd-x" data-pd-close aria-label="Tutup"><svg><use href="#i-close"/></svg></button>
        <div class="pd-grid">
          <div class="pd-media"><div class="pd-main">${main}</div>
            ${shots.length > 1 ? `<div class="pd-thumbs">${shots.map((s, i) => `<button class="pd-thumb${i ? "" : " active"}" data-src="${esc(s.src)}" title="${esc(s.label)}"><img src="${esc(s.src)}" alt="${esc(s.label)}" loading="lazy"></button>`).join("")}</div>` : ""}
          </div>
          <div class="pd-info">
            <span class="sku">${esc(p.sku)} · ${esc(p.kategori)}</span>
            <h3>${esc(p.nama)}</h3>
            <p class="muted">${esc(p.deskripsi || "")}</p>
            <dl class="pd-spec"><dt>Bahan</dt><dd>${esc(p.bahan)}</dd><dt>Ukuran</dt><dd>${esc(p.ukuran)}</dd>
              <dt>Warna</dt><dd>${colors.map((w) => `<button class="pd-color" data-w="${esc(w)}"><span class="swatch" style="background:${swatchBg(w)}"></span>${esc(w)}</button>`).join("")}</dd>
              <dt>Min. order</dt><dd>${esc(p.min_order || 1)} pcs</dd></dl>
            <div class="price-row" style="border:0;padding-top:4px">
              <div><div class="lbl">Harga jual saran</div><div class="val">${rupiah(p.harga_jual_saran)}</div></div>${margin}
            </div>
            <div class="pd-cta">${opts.cta || ""}</div>
          </div>
        </div>
      </div>`;
    const setMain = (src) => {
      const m = box.querySelector(".pd-main");
      m.innerHTML = `<img id="pd-main" src="${esc(src)}" alt="${esc(p.nama)}">`;
      box.querySelectorAll(".pd-thumb").forEach((t) => t.classList.toggle("active", t.dataset.src === src));
    };
    box.querySelectorAll(".pd-thumb").forEach((t) => t.addEventListener("click", () => setMain(t.dataset.src)));
    box.querySelectorAll(".pd-color").forEach((b) => b.addEventListener("click", () => {
      const src = productSrc(p, b.dataset.w);
      if (src) setMain(src); else box.querySelector(".pd-main").innerHTML = productVisual(p, b.dataset.w);
    }));
    if (opts.onReady) opts.onReady(box);
    box.classList.add("open"); box.setAttribute("aria-hidden", "false");
  }
  function closeProduct() { const b = document.getElementById("pd-modal"); if (b) { b.classList.remove("open"); b.setAttribute("aria-hidden", "true"); } }

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
      if (DEMO) {
        if (!demoApi[action]) throw new Error("Fitur ini membutuhkan database Firebase.");
        return demoApi[action](payload || {});
      }
      try {
        if (BACKEND === "firebase") {
          if (!window.AreumiFirebase[action]) throw new Error("Aksi tidak tersedia: " + action);
          const call = window.AreumiFirebase[action](payload || {});
          const isPublic = action === "products" || action === "suppliers";
          // katalog publik tidak boleh menggantung bila Firestore lambat/tidak terjangkau
          const res = isPublic
            ? await Promise.race([call, new Promise((_, rej) => setTimeout(() => rej(new Error("Firestore timeout")), 8000))])
            : await call;
          // katalog kosong (belum di-seed) -> tampilkan data contoh
          if ((action === "products" || action === "suppliers") && (!res || !res.length)) return demoApi[action]();
          return res;
        }
        return await remote(action, payload);
      }
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

  window.Areumi = { CFG, DEMO, BACKEND, api, session, rupiah, esc, normWA, waLink, fmtDate, garmentSVG, productVisual, productSrc, openProduct, closeProduct, supplierLogo, swatches, colorList, colorHex, toast };
})();
