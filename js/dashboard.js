/* AreumiVerse — logika dashboard dropshipper */
(function () {
  const A = window.Areumi;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const sess = A.session.get();
  if (!sess || !sess.token) { location.replace("login.html"); return; }
  const token = sess.token;
  let me = sess.user || {}, products = [], orders = [];

  $("#side-wa").href = A.waLink("Halo Admin AreumiVerse, saya dropshipper dengan ID " + (me.id || "-") + ".");

  /* ---------- Navigasi view ---------- */
  const TITLES = { ringkasan: "Ringkasan", katalog: "Katalog & Harga Modal", order: "Buat Pesanan", pesanan: "Riwayat Pesanan", supplier: "Supplier", profil: "Profil Toko" };
  function go(view) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "v-" + view));
    $$(".side-link[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $("#view-title").textContent = TITLES[view];
    $("#side").classList.remove("open");
    history.replaceState(null, "", "#" + view);
    window.scrollTo(0, 0);
  }
  $$(".side-link[data-view]").forEach((b) => b.addEventListener("click", () => go(b.dataset.view)));
  document.addEventListener("click", (e) => { const g = e.target.closest("[data-goto]"); if (g) { e.preventDefault(); go(g.dataset.goto); } });
  $("#menu-btn").addEventListener("click", () => $("#side").classList.toggle("open"));
  $("#logout").addEventListener("click", async () => { try { await A.api.logout({ token }); } catch (e) {} A.session.clear(); location.replace("login.html"); });

  /* ---------- Profil ---------- */
  function renderMe() {
    const name = me.nama || "Dropshipper";
    $("#u-name").textContent = name;
    $("#u-id").textContent = me.id || "";
    $("#u-avatar").textContent = name.trim()[0].toUpperCase();
    const h = new Date().getHours();
    const salam = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam";
    $("#greet").textContent = `${salam}, ${name.split(" ")[0]}${me.nama_toko ? " · " + me.nama_toko : ""}`;
    const pending = String(me.status || "").toLowerCase() !== "aktif";
    if (me.is_admin && !$("#admin-link")) {
      $("#logout").insertAdjacentHTML("beforebegin", '<a class="side-link" id="admin-link" href="admin.html"><svg><use href="#i-shield"/></svg>Panel Admin</a>');
    }
    $("#verify-slot").innerHTML = pending ? `<div class="verify-banner"><span>Akun Anda berstatus <b>${A.esc(me.status || "Menunggu Verifikasi")}</b>. Pesanan tetap bisa dibuat, admin akan mengaktifkan akun setelah konfirmasi.</span><a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="${A.waLink("Halo Admin, mohon verifikasi akun dropshipper saya. ID: " + (me.id || "-") + ", Nama: " + name)}"><svg><use href="#i-wa"/></svg>Minta verifikasi</a></div>` : "";
    const pf = $("#profile-form");
    ["nama", "nama_toko", "email", "kota", "platform"].forEach((k) => { pf[k].value = me[k] || ""; });
    $("#acc-info").innerHTML = `<dl>
      <dt>ID Mitra</dt><dd>${A.esc(me.id || "-")}</dd>
      <dt>WhatsApp</dt><dd>${A.esc(me.whatsapp || "-")}</dd>
      <dt>Status</dt><dd><span class="badge ${pending ? "warn" : "ok"}">${A.esc(me.status || "-")}</span></dd>
      <dt>Level</dt><dd>${A.esc(me.level || "Dropshipper")}</dd>
      <dt>Bergabung</dt><dd>${A.esc(A.fmtDate(me.tanggal))}</dd>
      <dt>Minat</dt><dd>${A.esc(me.minat || "-")}</dd></dl>`;
  }
  $("#profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#profile-btn"); btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(e.target).entries());
      me = await A.api.updateProfile(Object.assign({ token }, data));
      A.session.set({ token, user: me }); renderMe(); A.toast("Profil tersimpan", "success");
    } catch (err) { A.toast(err.message, "error"); }
    btn.disabled = false;
  });

  /* ---------- Katalog ---------- */
  const CATS = ["Semua", "Kaos Polos", "Baju Anak", "Kemeja Kantor", "Produksi Pakaian"];
  let cat = "Semua", q = "";
  $("#d-chips").innerHTML = CATS.map((c) => `<button class="chip${c === cat ? " active" : ""}" data-c="${c}">${c}</button>`).join("");
  $("#d-chips").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (!b) return; cat = b.dataset.c; $$("#d-chips .chip").forEach((x) => x.classList.toggle("active", x === b)); renderCatalog(); });
  $("#d-q").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); renderCatalog(); });

  function renderCatalog() {
    const list = products.filter((p) => (cat === "Semua" || p.kategori === cat) && (!q || [p.nama, p.bahan, p.sku].join(" ").toLowerCase().includes(q)));
    $("#d-products").innerHTML = list.length ? list.map((p) => {
      const margin = Number(p.harga_jual_saran) - Number(p.harga_modal);
      const stokTxt = Number(p.stok) > 0 ? `<span class="badge ok">Stok ${p.stok}</span>` : `<span class="badge dark">By order · min ${p.min_order}</span>`;
      return `<article class="product">
        <div class="product-media">${A.productVisual(p)}<span style="position:absolute;left:12px;top:12px">${stokTxt}</span></div>
        <div class="product-body">
          <span class="sku">${A.esc(p.sku)} · ${A.esc(p.kategori)}</span>
          <h3>${A.esc(p.nama)}</h3>
          <span class="meta">${A.esc(p.bahan)} · ${A.esc(p.ukuran)}</span>
          <div class="swatches">${A.swatches(p, 6)}</div>
          <div class="price-row">
            <div><div class="lbl">Modal</div><div class="val">${A.rupiah(p.harga_modal)}</div></div>
            <div style="text-align:right"><div class="lbl">Jual saran</div><div style="font-weight:700">${A.rupiah(p.harga_jual_saran)}</div></div>
          </div>
          <span class="margin-pill" style="align-self:start">Untung ${A.rupiah(margin)}/pcs</span>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button class="btn btn-ghost btn-sm" style="flex:1" data-caption="${A.esc(p.sku)}"><svg><use href="#i-copy"/></svg>Caption</button>
            <button class="btn btn-primary btn-sm" style="flex:1" data-order="${A.esc(p.sku)}">Pesan</button>
          </div>
        </div></article>`;
    }).join("") : '<div class="empty">Tidak ada produk.</div>';
  }
  $("#d-products").addEventListener("click", (e) => {
    const c = e.target.closest("[data-caption]"), o = e.target.closest("[data-order]");
    if (c) openCaption(c.dataset.caption);
    if (o) { selectProduct(o.dataset.order); go("order"); }
  });

  /* ---------- Caption ---------- */
  const modal = $("#cap-modal");
  let capSku = null;
  function openCaption(sku) {
    const p = products.find((x) => x.sku === sku); if (!p) return;
    capSku = sku;
    $("#cap-text").value = [
      `✨ ${p.nama} ✨`, "",
      p.deskripsi, "",
      `🧵 Bahan: ${p.bahan}`,
      `📏 Ukuran: ${p.ukuran}`,
      `🎨 Warna: ${p.warna}`, "",
      `💰 Harga: ${A.rupiah(p.harga_jual_saran)}`,
      Number(p.min_order) > 1 ? `📦 Minimal order ${p.min_order} pcs` : "📦 Ready stock, bisa beli satuan", "",
      `Order sekarang via DM / WhatsApp ${me.nama_toko ? "*" + me.nama_toko + "*" : ""}`.trim(), "",
      "#kaospolos #bajuanak #kemejakantor #fashionindonesia #" + String(p.kategori).replace(/\s+/g, "").toLowerCase()
    ].join("\n");
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
    $("#cap-text").focus();
  }
  const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  $("#cap-copy").addEventListener("click", async () => {
    const t = $("#cap-text");
    try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand("copy"); }
    A.toast("Caption disalin", "success");
  });
  $("#cap-order").addEventListener("click", () => { closeModal(); selectProduct(capSku); go("order"); });

  /* ---------- Form pesanan ---------- */
  const of = $("#order-form");
  const split = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
  function fillProductSelect() {
    of.sku.innerHTML = products.map((p) => `<option value="${A.esc(p.sku)}">${A.esc(p.sku)} — ${A.esc(p.nama)}</option>`).join("");
    onProductChange();
  }
  function selectProduct(sku) { if (sku) { of.sku.value = sku; onProductChange(); } }
  function onProductChange() {
    const p = products.find((x) => x.sku === of.sku.value); if (!p) return;
    of.warna.innerHTML = split(p.warna).map((w) => `<option>${A.esc(w)}</option>`).join("");
    of.ukuran.innerHTML = split(p.ukuran).map((w) => `<option>${A.esc(w)}</option>`).join("");
    const moq = Math.max(1, Number(p.min_order) || 1);
    of.qty.min = moq; if (Number(of.qty.value) < moq) of.qty.value = moq;
    $("#o-moq").textContent = moq > 1 ? `Minimal order ${moq} pcs` : "";
    of.harga_jual.value = p.harga_jual_saran;
    updateCalc();
  }
  function updateCalc() {
    const p = products.find((x) => x.sku === of.sku.value); if (!p) return;
    const qty = Math.max(1, Number(of.qty.value) || 1);
    const jual = Number(of.harga_jual.value) || 0;
    const modal = Number(p.harga_modal) * qty;
    $("#o-visual").innerHTML = A.productVisual(p, of.warna.value);
    $("#o-calc").innerHTML = `
      <div><span>${A.esc(p.nama)}</span><span></span></div>
      <div><span>Modal ${A.rupiah(p.harga_modal)} × ${qty}</span><b>${A.rupiah(modal)}</b></div>
      <div><span>Harga jual ${A.rupiah(jual)} × ${qty}</span><span>${A.rupiah(jual * qty)}</span></div>
      <div class="total"><span>Transfer ke admin</span><span>${A.rupiah(modal)} + ongkir</span></div>
      <div class="profit"><span>Estimasi profit Anda</span><b>${A.rupiah((jual - p.harga_modal) * qty)}</b></div>`;
  }
  of.sku.addEventListener("change", onProductChange);
  ["warna", "qty", "harga_jual"].forEach((n) => of[n].addEventListener("input", updateCalc));

  of.addEventListener("submit", async (e) => {
    e.preventDefault();
    const box = $("#order-alert"), btn = $("#order-btn");
    let ok = true;
    ["nama_penerima", "hp_penerima", "alamat"].forEach((n) => { const bad = !of[n].value.trim(); of[n].closest(".field").classList.toggle("invalid", bad); if (bad) ok = false; });
    const p = products.find((x) => x.sku === of.sku.value);
    if (p && Number(of.qty.value) < Number(p.min_order || 1)) { box.className = "alert show error"; box.textContent = `Minimal order produk ini ${p.min_order} pcs.`; return; }
    if (!ok) return;
    btn.disabled = true; btn.textContent = "Menyimpan pesanan…"; box.className = "alert";
    try {
      const data = Object.fromEntries(new FormData(of).entries());
      const o = await A.api.createOrder(Object.assign({ token }, data));
      const msg = [
        "*PESANAN DROPSHIP BARU* 🧾",
        "No. Order : " + o.id,
        "Dropshipper: " + (me.nama || "-") + " (" + (me.id || "-") + ")",
        "Nama Toko  : " + (me.nama_toko || "-"),
        "",
        "Produk : " + o.sku + " — " + o.nama_produk,
        "Warna  : " + o.warna + " | Ukuran: " + o.ukuran,
        "Qty    : " + o.qty + " pcs",
        "Modal  : " + A.rupiah(o.total_modal),
        "",
        "*Penerima*",
        o.nama_penerima + " (" + o.hp_penerima + ")",
        o.alamat,
        "Ekspedisi: " + o.ekspedisi,
        o.catatan ? "Catatan: " + o.catatan : "",
        "",
        "Mohon info total ongkir & rekening pembayaran. Terima kasih."
      ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "").join("\n");
      const link = A.waLink(msg);
      box.className = "alert show success";
      box.innerHTML = `Pesanan <b>${A.esc(o.id)}</b> tersimpan. Membuka WhatsApp admin… <a href="${link}" target="_blank" rel="noopener" style="font-weight:700">Buka manual</a>`;
      ["nama_penerima", "hp_penerima", "alamat", "catatan"].forEach((n) => { of[n].value = ""; });
      await loadOrders();
      setTimeout(() => { window.location.href = link; }, 1000);
    } catch (err) {
      box.className = "alert show error"; box.textContent = err.message;
      if (/sesi/i.test(err.message)) setTimeout(() => { A.session.clear(); location.replace("login.html"); }, 1500);
    } finally {
      btn.disabled = false; btn.innerHTML = '<svg><use href="#i-wa"/></svg>Simpan &amp; Kirim ke Admin';
    }
  });

  /* ---------- Pesanan & statistik ---------- */
  const statusClass = (s) => { s = String(s).toLowerCase(); return s.includes("selesai") || s.includes("terkirim") ? "ok" : s.includes("dikirim") || s.includes("proses") ? "info" : s.includes("batal") ? "brand" : "warn"; };
  function orderTable(list) {
    if (!list.length) return '<div class="empty">Belum ada pesanan. <a href="#" data-goto="order" style="color:var(--brand);font-weight:700">Buat pesanan pertama</a>.</div>';
    return `<table class="data"><thead><tr><th>No. Order</th><th>Tanggal</th><th>Produk</th><th>Penerima</th><th class="num">Qty</th><th class="num">Modal</th><th class="num">Profit</th><th>Status</th><th>Resi</th></tr></thead><tbody>${
      list.map((o) => `<tr><td><b>${A.esc(o.id)}</b></td><td>${A.esc(A.fmtDate(o.tanggal))}</td><td>${A.esc(o.nama_produk)}<br><span class="small muted">${A.esc(o.warna)} · ${A.esc(o.ukuran)}</span></td>
        <td>${A.esc(o.nama_penerima)}<br><span class="small muted">${A.esc(o.ekspedisi)}</span></td><td class="num">${A.esc(o.qty)}</td><td class="num">${A.rupiah(o.total_modal)}</td>
        <td class="num" style="color:var(--ok);font-weight:700">${A.rupiah(o.profit)}</td><td><span class="badge ${statusClass(o.status)}">${A.esc(o.status)}</span></td><td>${A.esc(o.resi || "—")}</td></tr>`).join("")
    }</tbody></table>`;
  }
  function renderOrders() {
    const valid = orders.filter((o) => !String(o.status).toLowerCase().includes("batal"));
    const sum = (k) => valid.reduce((a, o) => a + (Number(o[k]) || 0), 0);
    $("#s-orders").textContent = orders.length;
    $("#s-pcs").textContent = sum("qty");
    $("#s-omzet").textContent = A.rupiah(valid.reduce((a, o) => a + Number(o.harga_jual) * Number(o.qty), 0));
    $("#s-profit").textContent = A.rupiah(sum("profit"));
    $("#recent-orders").innerHTML = orderTable(orders.slice(0, 5));
    $("#all-orders").innerHTML = orderTable(orders);

    // Profit per bulan (6 bulan terakhir)
    const now = new Date(), months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString("id-ID", { month: "short" }), v: 0 }); }
    valid.forEach((o) => { const d = new Date(o.tanggal); const b = months.find((x) => x.y === d.getFullYear() && x.m === d.getMonth()); if (b) b.v += Number(o.profit) || 0; });
    const max = Math.max(1, ...months.map((x) => x.v));
    $("#bars").innerHTML = months.map((x) => `<div class="bar" title="${x.label}: ${A.rupiah(x.v)}"><span>${x.v ? (x.v >= 1e6 ? (x.v / 1e6).toFixed(1) + "jt" : Math.round(x.v / 1e3) + "rb") : ""}</span><i style="height:${(x.v / max) * 100}%"></i><span>${x.label}</span></div>`).join("");
    $("#s-month").textContent = "Bulan ini " + A.rupiah(months[5].v);
  }
  async function loadOrders() {
    try { orders = (await A.api.myOrders({ token })) || []; }
    catch (err) {
      if (/sesi/i.test(err.message)) { A.session.clear(); location.replace("login.html"); return; }
      A.toast(err.message, "error");
    }
    renderOrders();
  }
  $("#refresh-orders").addEventListener("click", () => loadOrders().then(() => A.toast("Data diperbarui")));

  /* ---------- Supplier ---------- */
  function renderSuppliers(list) {
    $("#d-suppliers").innerHTML = (list || []).map((s) => `<article class="sup">
      <div class="sup-head"><div><h3>${A.esc(s.nama)}</h3><div class="loc"><svg><use href="#i-pin"/></svg>${A.esc(s.lokasi)}</div></div><span class="badge brand">${A.esc(s.id)}</span></div>
      <span class="badge" style="align-self:start">${A.esc(s.kategori)}</span>
      <dl><dt>Spesialis</dt><dd>${A.esc(s.spesialisasi)}</dd><dt>Min. order</dt><dd>${A.esc(s.min_order)}</dd><dt>Proses</dt><dd>${A.esc(s.estimasi_proses)}</dd>
      <dt>Produk</dt><dd>${products.filter((p) => p.supplier_id === s.id).length} item di katalog</dd></dl>
      <div class="sup-foot"><span class="stars"><svg><use href="#i-star"/></svg>${Number(s.rating || 0).toFixed(1)}</span><span class="badge ok">${A.esc(s.status || "Terverifikasi")}</span></div></article>`).join("");
  }

  /* ---------- Init ---------- */
  renderMe();
  (async () => {
    try { me = await A.api.me({ token }); A.session.set({ token, user: me }); renderMe(); }
    catch (err) {
      if (/sesi/i.test(err.message)) { A.session.clear(); location.replace("login.html"); return; }
      A.toast("Gagal terhubung ke server: " + err.message, "error");
    }
    products = (await A.api.products({ token })) || [];
    renderCatalog(); fillProductSelect();
    loadOrders();
    renderSuppliers(await A.api.suppliers());
    const start = location.hash.slice(1);
    if (TITLES[start]) go(start);
  })();
})();
