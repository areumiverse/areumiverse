/* AreumiVerse — logika halaman utama */
(function () {
  const A = window.Areumi;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Link WhatsApp ---------- */
  const waGeneral = A.waLink("Halo Admin AreumiVerse, saya ingin bertanya tentang program dropshipper.");
  ["#wa-float", "#cta-wa", "#foot-wa"].forEach((s) => { const el = $(s); if (el) el.href = waGeneral; });
  $("#foot-wa").textContent = "WhatsApp " + A.CFG.WA_DISPLAY;
  $("#btn-produksi").href = A.waLink("Halo Admin AreumiVerse, saya ingin konsultasi PRODUKSI PAKAIAN dengan brand sendiri.\n\nJenis produk: \nPerkiraan jumlah: \nTarget selesai: ");

  /* ---------- Hero: isi nomor WA lalu lanjut ke form daftar ---------- */
  $("#hero-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#hero-wa").value.trim();
    if (v) $("#r-wa").value = v;
    $("#daftar").scrollIntoView();
    setTimeout(() => $("#r-nama").focus({ preventScroll: true }), 500);
  });

  /* ---------- Navbar ---------- */
  const nav = $("#nav"), menu = $("#mobile-menu"), tgl = $("#nav-toggle");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });
  tgl.addEventListener("click", () => { const o = menu.classList.toggle("open"); tgl.setAttribute("aria-expanded", o); });
  $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.classList.remove("open"); tgl.setAttribute("aria-expanded", false); }));

  /* ---------- Ilustrasi kategori ---------- */
  $$("[data-art]").forEach((el) => { const [k, w] = el.dataset.art.split("|"); el.innerHTML = A.garmentSVG(k, w); });

  /* ---------- Reveal on scroll ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 }) : null;
  const observe = (root) => $$(".reveal:not(.in)", root).forEach((el) => io ? io.observe(el) : el.classList.add("in"));
  observe(document);

  /* ---------- Katalog ---------- */
  const CATS = ["Semua", "Kaos Polos", "Baju Anak", "Kemeja Kantor", "Produksi Pakaian"];
  let products = [], activeCat = "Semua", q = "";
  const chips = $("#cat-chips");
  chips.innerHTML = CATS.map((c) => `<button class="chip${c === activeCat ? " active" : ""}" role="tab" data-c="${c}">${c}</button>`).join("");
  chips.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) setCat(b.dataset.c, false); });
  function setCat(c, scroll) {
    activeCat = c;
    $$(".chip", chips).forEach((b) => { const on = b.dataset.c === c; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
    renderProducts();
    if (scroll) $("#katalog").scrollIntoView();
  }
  $$("[data-cat]").forEach((b) => b.addEventListener("click", () => setCat(b.dataset.cat, true)));
  $$("[data-cat-link]").forEach((a) => a.addEventListener("click", () => setCat(a.dataset.catLink, false)));
  $("#q").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); renderProducts(); });

  function productCard(p) {
    const moq = Number(p.min_order) > 1 ? `<span class="badge dark">Min. ${p.min_order} pcs</span>` : `<span class="badge ok">Ready stock</span>`;
    return `<article class="product reveal">
      <div class="product-media">${A.productVisual(p)}<span class="badge-wrap" style="position:absolute;left:12px;top:12px">${moq}</span></div>
      <div class="product-body">
        <span class="sku">${A.esc(p.sku)} · ${A.esc(p.kategori)}</span>
        <h3>${A.esc(p.nama)}</h3>
        <span class="meta">${A.esc(p.bahan)}</span>
        <div class="swatches">${A.swatches(p, 5)}</div>
        <div class="price-row">
          <div><div class="lbl">Harga jual</div><div class="val">${A.rupiah(p.harga_jual_saran)}</div></div>
          <a class="locked" href="#daftar"><svg><use href="#i-lock"/></svg>Harga modal</a>
        </div>
      </div></article>`;
  }
  function renderProducts() {
    const list = products.filter((p) => (activeCat === "Semua" || p.kategori === activeCat) &&
      (!q || [p.nama, p.bahan, p.kategori, p.sku].join(" ").toLowerCase().includes(q)));
    $("#product-grid").innerHTML = list.length ? list.map(productCard).join("") : '<div class="empty">Produk tidak ditemukan. Coba kata kunci lain.</div>';
    observe($("#product-grid"));
  }

  /* ---------- Supplier ---------- */
  function supCard(s) {
    const initials = String(s.nama).replace(/^Mitra\s+/i, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    return `<article class="sup reveal">
      <div class="sup-head">
        <div style="display:flex;gap:12px"><div class="sup-avatar">${A.esc(initials)}</div>
          <div><h3>${A.esc(s.nama)}</h3><div class="loc"><svg><use href="#i-pin"/></svg>${A.esc(s.lokasi)}</div></div></div>
      </div>
      <span class="badge brand" style="align-self:start">${A.esc(s.kategori)}</span>
      <dl>
        <dt>Spesialis</dt><dd>${A.esc(s.spesialisasi)}</dd>
        <dt>Min. order</dt><dd>${A.esc(s.min_order)}</dd>
        <dt>Proses</dt><dd>${A.esc(s.estimasi_proses)}</dd>
      </dl>
      <div class="sup-foot"><span class="stars"><svg><use href="#i-star"/></svg>${Number(s.rating || 0).toFixed(1)}</span><span class="badge ok">${A.esc(s.status || "Terverifikasi")}</span></div>
    </article>`;
  }

  A.api.products().then((d) => { products = d || []; renderProducts(); }).catch(() => { $("#product-grid").innerHTML = '<div class="empty">Katalog gagal dimuat.</div>'; });
  A.api.suppliers().then((d) => { $("#sup-grid").innerHTML = (d || []).map(supCard).join(""); observe($("#sup-grid")); });

  /* ---------- Register ---------- */
  const form = $("#reg-form"), alertBox = $("#reg-alert"), btn = $("#reg-btn");
  $$(".pw-toggle").forEach((b) => b.addEventListener("click", () => {
    const i = document.getElementById(b.dataset.pw); const show = i.type === "password";
    i.type = show ? "text" : "password"; b.textContent = show ? "Sembunyi" : "Lihat";
  }));
  const setInvalid = (id, bad) => { const f = document.getElementById(id).closest(".field"); f.classList.toggle("invalid", bad); return !bad; };
  function validate() {
    const v = (id) => document.getElementById(id).value.trim();
    const wa = A.normWA(v("r-wa"));
    const checks = [
      setInvalid("r-nama", v("r-nama").length < 3),
      setInvalid("r-wa", !/^62\d{8,13}$/.test(wa)),
      setInvalid("r-email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("r-email"))),
      setInvalid("r-kota", !v("r-kota")),
      setInvalid("r-platform", !v("r-platform")),
      setInvalid("r-minat", !v("r-minat")),
      setInvalid("r-pw", v("r-pw").length < 6),
      setInvalid("r-pw2", v("r-pw2") !== v("r-pw") || !v("r-pw2")),
      setInvalid("r-agree", !document.getElementById("r-agree").checked)
    ];
    return checks.every(Boolean);
  }
  $$("input, select", form).forEach((el) => el.addEventListener("input", () => el.closest(".field").classList.remove("invalid")));
  const show = (type, msg) => { alertBox.className = "alert show " + type; alertBox.innerHTML = msg; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.className = "alert";
    if (!validate()) { const bad = $(".field.invalid input, .field.invalid select", form); if (bad) bad.focus(); return; }
    const fd = Object.fromEntries(new FormData(form).entries());
    delete fd.password2;
    fd.whatsapp = A.normWA(fd.whatsapp);
    btn.disabled = true; btn.textContent = "Menyimpan data…";
    try {
      const user = await A.api.register(fd);
      const msg = [
        "Halo Admin AreumiVerse 👋",
        "Saya baru saja mendaftar sebagai *Dropshipper*. Mohon aktivasi akun saya.",
        "",
        "ID Mitra   : " + (user.id || "-"),
        "Nama       : " + fd.nama,
        "WhatsApp   : " + fd.whatsapp,
        "Email      : " + fd.email,
        "Kota       : " + fd.kota,
        "Nama Toko  : " + (fd.nama_toko || "-"),
        "Kanal Jual : " + fd.platform,
        "Minat      : " + fd.minat,
        "",
        "Terima kasih."
      ].join("\n");
      const link = A.waLink(msg);
      show("success", `<strong>Pendaftaran berhasil!</strong> Anda akan diarahkan ke WhatsApp admin… Jika tidak terbuka, <a href="${link}" target="_blank" rel="noopener" style="font-weight:700">klik di sini</a>.`);
      form.reset();
      setTimeout(() => { window.location.href = link; }, 1200);
    } catch (err) {
      show("error", A.esc(err.message || "Pendaftaran gagal. Coba lagi."));
    } finally {
      btn.disabled = false; btn.innerHTML = '<svg><use href="#i-wa"/></svg>Daftar &amp; Lanjut ke WhatsApp';
    }
  });
})();
