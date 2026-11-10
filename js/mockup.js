/* AreumiVerse — mesin mockup produk (SVG realistis) & logo supplier.
   mockup(tipe, warnaHex, { brand, print }) -> string <svg>
   tipe : tee | oversize | longsleeve | hoodie | kids | kidsset | pajama | shirt | blouse | uniform | print
   brand: AREUMI | RAYNOZ
   print: chest | center | big | embroidery
*/
(function () {
  let seq = 0;
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    return "#" + [c(n >> 16), c((n >> 8) & 255), c(n & 255)].map((x) => x.toString(16).padStart(2, "0")).join("");
  };
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  const ink = (hex) => (lum(hex) > 150 ? "#141414" : "#f7f7f5");

  /* ---------- Siluet (viewBox 0 0 400 400) ---------- */
  const S = {
    tee: "M152 58 C170 76 230 76 248 58 L300 74 C318 80 330 92 340 108 L372 160 L330 186 L302 150 L302 352 C302 360 296 364 288 364 L112 364 C104 364 98 360 98 352 L98 150 L70 186 L28 160 L60 108 C70 92 82 80 100 74 Z",
    oversize: "M150 56 C170 74 230 74 250 56 L310 70 C330 76 340 86 348 104 L384 196 L338 214 L316 160 L318 360 C318 368 312 372 304 372 L96 372 C88 372 82 368 82 360 L84 160 L62 214 L16 196 L52 104 C60 86 70 76 90 70 Z",
    longsleeve: "M152 58 C170 76 230 76 248 58 L300 74 C318 80 328 92 334 110 L362 300 C363 306 360 310 354 311 L330 314 C324 315 320 312 319 306 L302 168 L302 352 C302 360 296 364 288 364 L112 364 C104 364 98 360 98 352 L98 168 L81 306 C80 312 76 315 70 314 L46 311 C40 310 37 306 38 300 L66 110 C72 92 82 80 100 74 Z",
    shirt: "M160 54 C176 64 224 64 240 54 L300 72 C318 78 328 92 334 110 L362 300 C363 306 360 310 354 311 L330 314 C324 315 320 312 319 306 L302 168 L302 348 C302 362 290 370 272 366 C246 360 222 374 200 374 C178 374 154 360 128 366 C110 370 98 362 98 348 L98 168 L81 306 C80 312 76 315 70 314 L46 311 C40 310 37 306 38 300 L66 110 C72 92 82 78 100 72 Z",
    blouse: "M160 54 C176 64 224 64 240 54 L298 72 C316 78 326 92 332 110 L358 300 C359 306 356 310 350 311 L328 314 C322 315 318 312 317 306 L298 170 C292 220 290 250 300 300 L304 350 C304 362 292 368 276 366 C246 362 222 372 200 372 C178 372 154 362 124 366 C108 368 96 362 96 350 L100 300 C110 250 108 220 102 170 L83 306 C82 312 78 315 72 314 L50 311 C44 310 41 306 42 300 L68 110 C74 92 84 78 102 72 Z"
  };

  function defs(id, fill) {
    return `<defs>
      <linearGradient id="${id}h" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".2" stop-color="#000" stop-opacity=".05"/>
        <stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset=".8" stop-color="#000" stop-opacity=".05"/>
        <stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
      <linearGradient id="${id}v" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
      <filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="${id}d" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000" flood-opacity=".22"/></filter>
      <filter id="${id}n" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${(seq % 9) + 1}" result="t"/>
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 -.05" result="m"/>
        <feComposite in="m" in2="SourceGraphic" operator="in"/></filter>
      <filter id="${id}p"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" result="t"/>
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.25 1.02" result="m"/>
        <feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
    </defs>`;
  }

  /* lapisan kain: warna dasar + shading + lipatan + tekstur */
  function fabric(id, d, fill, folds, key) {
    const cid = id + "c" + (key || "");
    return `<g filter="url(#${id}d)"><path d="${d}" fill="${fill}"/></g>
      <path d="${d}" fill="url(#${id}h)"/><path d="${d}" fill="url(#${id}v)"/>
      <clipPath id="${cid}"><path d="${d}"/></clipPath>
      <g clip-path="url(#${cid})" filter="url(#${id}b)" fill="none" stroke-linecap="round">
        ${(folds || []).map((f) => `<path d="${f[0]}" stroke="${f[1] ? "#fff" : "#000"}" stroke-width="${f[2] || 7}" opacity="${f[1] ? 0.22 : 0.2}"/>`).join("")}
      </g>
      <path d="${d}" fill="#000" filter="url(#${id}n)" opacity=".7"/>
      <path d="${d}" fill="none" stroke="${shade(fill, -40)}" stroke-width="1.2" opacity=".55"/>`;
  }
  const seam = (d, fill, op) => `<path d="${d}" fill="none" stroke="${shade(fill, -55)}" stroke-width="1.3" stroke-dasharray="3.5 3" opacity="${op || 0.55}"/>`;
  const line = (d, fill, w, op) => `<path d="${d}" fill="none" stroke="${shade(fill, -45)}" stroke-width="${w || 1.6}" opacity="${op || 0.6}" stroke-linecap="round"/>`;

  /* ---------- Sablon / bordir brand ---------- */
  function brandPrint(id, brand, fill, x, y, scale, mode) {
    const c = ink(fill);
    const k = scale || 1;
    const emb = mode === "embroidery";
    const style = emb ? `filter="url(#${id}p)" opacity=".95"` : `filter="url(#${id}p)" opacity=".88"`;
    if (brand === "RAYNOZ") {
      return `<g transform="translate(${x} ${y}) scale(${k})" ${style}>
        <text x="0" y="0" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="900" font-style="italic" font-size="34" letter-spacing="1.5" fill="${c}">RAYNOZ</text>
        <rect x="-62" y="8" width="124" height="3.5" fill="${c}"/>
        ${emb ? "" : `<text x="0" y="26" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="9" letter-spacing="4.5" fill="${c}">APPAREL</text>`}
      </g>`;
    }
    return `<g transform="translate(${x} ${y}) scale(${k})" ${style}>
      <circle cx="0" cy="-30" r="13" fill="none" stroke="${c}" stroke-width="6.5" stroke-dasharray="62 20" transform="rotate(35 0 -30)"/>
      <circle cx="10" cy="-21" r="4" fill="${c}"/>
      <text x="0" y="6" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="24" letter-spacing="1" fill="${c}">AREUMI</text>
    </g>`;
  }

  /* ---------- Rakitan per tipe ---------- */
  const B = {
    tee(id, f, o) {
      return fabric(id, S.tee, f, [["M138 200 C150 262 132 300 148 352"], ["M266 206 C252 270 270 310 256 352"], ["M108 156 C126 178 134 196 140 220"], ["M200 86 C206 200 194 280 206 362", 1, 9]]) +
        `<path d="M152 58 C170 48 230 48 248 58 C230 76 170 76 152 58 Z" fill="${shade(f, -60)}"/>` +
        `<path d="M152 58 C170 76 230 76 248 58" fill="none" stroke="${shade(f, -14)}" stroke-width="9"/>` +
        seam("M156 67 C172 84 228 84 244 67", f) + line("M100 74 C108 100 102 130 98 150", f, 1.4, 0.45) + line("M300 74 C292 100 298 130 302 150", f, 1.4, 0.45) +
        seam("M36 154 L76 178", f) + seam("M364 154 L324 178", f) + seam("M100 350 L300 350", f) +
        brandPrint(id, o.brand, f, o.print === "chest" ? 246 : 200, o.print === "chest" ? 150 : 176, o.print === "chest" ? 0.55 : o.print === "big" ? 1.45 : 1.05, o.print);
    },
    oversize(id, f, o) {
      return fabric(id, S.oversize, f, [["M130 210 C142 270 124 320 140 362"], ["M276 214 C262 276 284 320 266 362"], ["M70 120 C92 150 96 170 92 200"], ["M330 120 C308 150 304 170 308 200"], ["M198 84 C208 200 192 290 206 370", 1, 10]]) +
        `<path d="M150 56 C170 46 230 46 250 56 C230 74 170 74 150 56 Z" fill="${shade(f, -60)}"/>` +
        `<path d="M150 56 C170 74 230 74 250 56" fill="none" stroke="${shade(f, -14)}" stroke-width="10"/>` +
        seam("M154 66 C172 84 228 84 246 66", f) + line("M70 92 C86 120 88 140 84 162", f, 1.4, 0.45) + line("M330 92 C314 120 312 140 316 162", f, 1.4, 0.45) +
        seam("M26 182 L66 198", f) + seam("M374 182 L334 198", f) + seam("M84 356 L316 356", f) +
        brandPrint(id, o.brand, f, 200, 186, o.print === "big" ? 1.6 : 1.15, o.print);
    },
    longsleeve(id, f, o) {
      return fabric(id, S.longsleeve, f, [["M140 200 C150 262 134 300 148 352"], ["M262 206 C250 270 268 310 256 352"], ["M70 160 C66 210 60 250 56 290"], ["M330 160 C334 210 340 250 344 290"], ["M200 86 C206 200 194 280 206 362", 1, 9]]) +
        `<path d="M152 58 C170 48 230 48 248 58 C230 76 170 76 152 58 Z" fill="${shade(f, -60)}"/>` +
        `<path d="M152 58 C170 76 230 76 248 58" fill="none" stroke="${shade(f, -14)}" stroke-width="9"/>` +
        seam("M156 67 C172 84 228 84 244 67", f) + line("M100 74 C110 110 104 140 98 168", f, 1.4, 0.45) + line("M300 74 C290 110 296 140 302 168", f, 1.4, 0.45) +
        line("M40 290 L80 294", f, 1.6) + line("M360 290 L320 294", f, 1.6) + seam("M100 350 L300 350", f) +
        brandPrint(id, o.brand, f, o.print === "chest" ? 248 : 200, o.print === "chest" ? 150 : 176, o.print === "chest" ? 0.55 : 1.05, o.print);
    },
    hoodie(id, f, o) {
      const d = S.longsleeve;
      return `<g filter="url(#${id}d)"><path d="M126 76 C116 22 158 4 200 4 C242 4 284 22 274 76 Z" fill="${shade(f, -10)}"/></g>
        <path d="M126 76 C116 22 158 4 200 4 C242 4 284 22 274 76 Z" fill="url(#${id}h)"/>` +
        fabric(id, d, f, [["M140 200 C150 250 134 290 148 340"], ["M262 206 C250 260 268 300 256 340"], ["M70 160 C66 210 60 250 56 290"], ["M330 160 C334 210 340 250 344 290"], ["M200 90 C206 200 194 260 206 340", 1, 9]]) +
        `<path d="M146 66 C150 26 250 26 254 66 C236 84 164 84 146 66 Z" fill="${shade(f, -62)}"/>
        <path d="M146 66 C164 84 236 84 254 66" fill="none" stroke="${shade(f, -8)}" stroke-width="7"/>
        <path d="M186 80 C184 110 182 130 180 152" stroke="${shade(f, 40)}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M214 80 C216 110 218 130 220 152" stroke="${shade(f, 40)}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <rect x="176" y="150" width="8" height="14" rx="2" fill="${shade(f, 55)}"/><rect x="216" y="150" width="8" height="14" rx="2" fill="${shade(f, 55)}"/>
        <path d="M138 262 L262 262 L286 332 L114 332 Z" fill="${shade(f, -6)}" opacity=".55"/>` +
        line("M138 262 L262 262 L286 332", f, 1.8) + line("M138 262 L114 332", f, 1.8) +
        `<rect x="98" y="334" width="204" height="30" fill="${shade(f, -12)}" opacity=".9"/>` +
        Array.from({ length: 25 }, (_, i) => `<line x1="${102 + i * 8}" y1="336" x2="${102 + i * 8}" y2="362" stroke="${shade(f, -40)}" stroke-width="1" opacity=".35"/>`).join("") +
        line("M100 290 L80 294", f, 1.6) + line("M40 290 L80 294", f, 1.6) + line("M360 290 L320 294", f, 1.6) +
        brandPrint(id, o.brand, f, 200, 214, 1.0, o.print);
    },
    shirt(id, f, o, women) {
      const d = women ? S.blouse : S.shirt;
      let s = fabric(id, d, f, [["M140 190 C150 252 130 300 146 360"], ["M262 196 C250 262 270 310 256 360"], ["M70 160 C66 210 60 250 56 290"], ["M330 160 C334 210 340 250 344 290"], ["M184 90 C186 200 180 280 186 366", 1, 8]]) +
        `<path d="M160 54 C176 64 224 64 240 54 L236 46 C220 40 180 40 164 46 Z" fill="${shade(f, -55)}"/>
        <path d="M160 54 L200 80 L176 110 L146 70 Z" fill="${shade(f, 6)}" stroke="${shade(f, -45)}" stroke-width="1.4"/>
        <path d="M240 54 L200 80 L224 110 L254 70 Z" fill="${shade(f, 2)}" stroke="${shade(f, -45)}" stroke-width="1.4"/>` +
        seam("M162 62 L196 84 L178 104", f, 0.4) + seam("M238 62 L204 84 L222 104", f, 0.4) +
        `<rect x="191" y="82" width="18" height="290" fill="${shade(f, 4)}" opacity=".6"/>` + line("M191 82 L191 370", f, 1.2, 0.5) + line("M209 82 L209 370", f, 1.2, 0.5) +
        [104, 146, 188, 230, 272, 314].map((y) => `<circle cx="200" cy="${y}" r="4.6" fill="${shade(f, 20)}" stroke="${shade(f, -50)}" stroke-width="1"/><circle cx="198.6" cy="${y - 1}" r="1" fill="${shade(f, -50)}"/><circle cx="201.4" cy="${y + 1}" r="1" fill="${shade(f, -50)}"/>`).join("") +
        `<path d="M40 286 L82 291 L81 306 C80 312 76 315 70 314 L46 311 C40 310 37 306 38 300 Z" fill="${shade(f, -4)}" stroke="${shade(f, -45)}" stroke-width="1.2"/>
        <path d="M360 286 L318 291 L319 306 C320 312 324 315 330 314 L354 311 C360 310 363 306 362 300 Z" fill="${shade(f, -4)}" stroke="${shade(f, -45)}" stroke-width="1.2"/>
        <circle cx="62" cy="301" r="3" fill="${shade(f, 20)}" stroke="${shade(f, -50)}"/><circle cx="338" cy="301" r="3" fill="${shade(f, 20)}" stroke="${shade(f, -50)}"/>` +
        line("M100 72 C110 110 104 140 98 168", f, 1.4, 0.45) + line("M300 72 C290 110 296 140 302 168", f, 1.4, 0.45);
      if (women) s += line("M150 200 C152 240 150 270 146 300", f, 1.2, 0.35) + line("M250 200 C248 240 250 270 254 300", f, 1.2, 0.35);
      else s += `<path d="M224 140 L270 140 L270 186 L247 194 L224 186 Z" fill="${shade(f, 3)}" stroke="${shade(f, -45)}" stroke-width="1.3"/>` + seam("M228 148 L266 148", f, 0.5);
      s += brandPrint(id, o.brand, f, women ? 250 : 247, women ? 140 : 132, 0.34, "embroidery");
      return s;
    },
    blouse(id, f, o) { return B.shirt(id, f, o, true); },
    uniform(id, f, o) {
      let s = B.shirt(id, f, { brand: o.brand }, false);
      s += `<path d="M130 140 L176 140 L176 186 L153 194 L130 186 Z" fill="${shade(f, 3)}" stroke="${shade(f, -45)}" stroke-width="1.3"/>
        <path d="M128 136 L178 136 L178 152 L128 152 Z" fill="${shade(f, 8)}" stroke="${shade(f, -45)}" stroke-width="1.3"/>
        <path d="M222 136 L272 136 L272 152 L222 152 Z" fill="${shade(f, 8)}" stroke="${shade(f, -45)}" stroke-width="1.3"/>
        <path d="M104 80 L150 64" stroke="${shade(f, -8)}" stroke-width="11" stroke-linecap="round"/><circle cx="144" cy="66" r="3.2" fill="${shade(f, 25)}"/>
        <path d="M296 80 L250 64" stroke="${shade(f, -8)}" stroke-width="11" stroke-linecap="round"/><circle cx="256" cy="66" r="3.2" fill="${shade(f, 25)}"/>`;
      return s;
    },
    kids(id, f, o) {
      return `<g transform="translate(40 46) scale(.8)">${B.tee(id, f, { brand: o.brand, print: "center" })}</g>`;
    },
    kidsset(id, f, o) {
      const sh = "M118 238 L282 238 L296 366 C296 370 293 372 289 372 L216 372 C212 372 210 370 209 366 L200 304 L191 366 C190 370 188 372 184 372 L111 372 C107 372 104 370 104 366 Z";
      return fabric(id, sh, f, [["M150 250 C156 300 150 330 156 370"], ["M250 250 C244 300 250 330 244 370"]], "s") +
        `<rect x="118" y="238" width="164" height="16" fill="${shade(f, -10)}"/>` + line("M118 254 L282 254", f, 1.2) + seam("M108 358 L190 358", f) + seam("M210 358 L292 358", f) +
        `<g transform="translate(76 4) scale(.62)">${B.tee(id, f, { brand: o.brand, print: "center" })}</g>`;
    },
    pajama(id, f, o) {
      const p = shade(f, lum(f) > 150 ? -70 : 80);
      return `<g transform="translate(40 40) scale(.8)">` + B.longsleeve(id, f, { brand: o.brand, print: "chest" }) +
        `<path d="M152 58 C170 76 230 76 248 58" fill="none" stroke="${p}" stroke-width="5"/>
        <rect x="193" y="76" width="14" height="280" fill="${shade(f, 6)}"/>` + line("M193 76 L193 356", f, 1.2) + line("M207 76 L207 356", f, 1.2) +
        [110, 160, 210, 260, 310].map((y) => `<circle cx="200" cy="${y}" r="5" fill="${p}"/>`).join("") +
        `<path d="M40 292 L80 296" stroke="${p}" stroke-width="5"/><path d="M360 292 L320 296" stroke="${p}" stroke-width="5"/></g>`;
    },
    print(id, f, o) {
      return B.tee(id, f, { brand: o.brand, print: "big" }) +
        `<g filter="url(#${id}p)" opacity=".85"><rect x="128" y="226" width="144" height="2" fill="${ink(f)}"/>
        <text x="200" y="246" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="11" letter-spacing="3.5" fill="${ink(f)}">CUSTOM PRODUCTION</text></g>`;
    }
  };

  function mockup(tipe, hex, opts) {
    const id = "mk" + ++seq;
    const o = Object.assign({ brand: "AREUMI", print: "center" }, opts || {});
    const build = B[tipe] || B.tee;
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mockup ${tipe} ${o.brand}">${defs(id, hex)}
      <ellipse cx="200" cy="384" rx="130" ry="9" fill="#000" opacity=".10" filter="url(#${id}b)"/>${build(id, hex, o)}</svg>`;
  }

  /* tebak tipe dari nama/kategori bila data produk tidak punya field 'tipe' */
  function guessType(p) {
    const n = (String(p.nama || "") + " " + String(p.kategori || "")).toLowerCase();
    if (n.includes("hoodie")) return "hoodie";
    if (n.includes("piyama")) return "pajama";
    if (n.includes("setelan")) return "kidsset";
    if (n.includes("seragam")) return "uniform";
    if (n.includes("wanita") && n.includes("kemeja")) return "blouse";
    if (n.includes("kemeja")) return "shirt";
    if (n.includes("produksi")) return "print";
    if (n.includes("anak")) return "kids";
    if (n.includes("oversize")) return "oversize";
    if (n.includes("lengan panjang")) return "longsleeve";
    return "tee";
  }

  /* ---------- Logo supplier ---------- */
  const ICONS = {
    tee: '<path d="M-14 -12 L-6 -16 Q0 -11 6 -16 L14 -12 L19 -3 L12 0 L11 -4 L11 16 L-11 16 L-11 -4 L-12 0 L-19 -3 Z"/>',
    spool: '<rect x="-12" y="-17" width="24" height="5" rx="1.5"/><rect x="-12" y="12" width="24" height="5" rx="1.5"/><rect x="-8" y="-12" width="16" height="24"/><path d="M-8 -6 L8 -2 M-8 0 L8 4 M-8 6 L8 10" stroke="currentColor" stroke-width="1.6" opacity=".45"/>',
    hanger: '<path d="M0 -10 C0 -14 -4 -17 -7 -15 M0 -10 L-19 4 C-21 6 -20 9 -17 9 L17 9 C20 9 21 6 19 4 Z" fill="none" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>',
    roll: '<rect x="-17" y="-11" width="28" height="22" rx="3"/><ellipse cx="11" cy="0" rx="6" ry="11"/><ellipse cx="11" cy="0" rx="2.4" ry="4.4" opacity=".45"/><path d="M-17 11 L-17 17 L4 17" fill="none" stroke-width="3"/>',
    needle: '<path d="M-14 14 L12 -12" stroke-width="4" stroke-linecap="round" fill="none"/><ellipse cx="12" cy="-12" rx="2.6" ry="5.6" transform="rotate(45 12 -12)" fill="none" stroke-width="2"/><path d="M14 -10 C24 0 4 6 -4 -2 C-12 -10 -20 0 -16 8" fill="none" stroke-width="2" opacity=".7"/>',
    dress: '<path d="M-6 -18 L-4 -10 L-9 -6 L-5 -3 L-15 17 L15 17 L5 -3 L9 -6 L4 -10 L6 -18 L2 -18 C1 -14 -1 -14 -2 -18 Z"/><path d="M-12 11 L12 11" stroke-width="1.6" opacity=".5"/>',
    hood: '<path d="M-10 -16 C-14 -6 -12 -4 -8 -2 L8 -2 C12 -4 14 -6 10 -16 C6 -19 -6 -19 -10 -16 Z"/><path d="M-16 -6 L-11 -4 L-11 16 L11 16 L11 -4 L16 -6 L20 12 L13 13 L12 4"/><path d="M-12 4 L-13 13 L-20 12 Z"/>'
  };
  const LOGOS = {
    "SUP-01": { icon: "tee", bg: ["#111111", "#3a3a3a"], fg: "#d6f44a", shape: "round" },
    "SUP-02": { icon: "hanger", bg: ["#ffcf5a", "#ff9f43"], fg: "#3b2300", shape: "circle" },
    "SUP-03": { icon: "needle", bg: ["#1f3b73", "#2f5fb3"], fg: "#ffffff", shape: "shield" },
    "SUP-04": { icon: "roll", bg: ["#6b4e2e", "#a87a46"], fg: "#fff6e8", shape: "hex" },
    "SUP-05": { icon: "spool", bg: ["#c62a1d", "#ff5a3c"], fg: "#ffffff", shape: "round" },
    "SUP-06": { icon: "dress", bg: ["#7a3b69", "#b5629a"], fg: "#fff4fa", shape: "circle" }
  };
  const SHAPES = {
    round: '<rect x="-30" y="-30" width="60" height="60" rx="16"/>',
    circle: '<circle r="30"/>',
    shield: '<path d="M0 -31 L27 -21 L27 4 C27 19 14 28 0 32 C-14 28 -27 19 -27 4 L-27 -21 Z"/>',
    hex: '<path d="M0 -31 L27 -15.5 L27 15.5 L0 31 L-27 15.5 L-27 -15.5 Z"/>'
  };
  function supplierLogo(s) {
    if (s.logo_url) return `<img src="${String(s.logo_url).replace(/"/g, "&quot;")}" alt="Logo ${String(s.nama || "").replace(/"/g, "")}" loading="lazy">`;
    const keys = Object.keys(LOGOS);
    const spec = LOGOS[s.id] || LOGOS[keys[Math.abs(String(s.id || s.nama).split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % keys.length]];
    const id = "lg" + ++seq;
    return `<svg viewBox="-34 -34 68 68" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo ${String(s.nama || "")}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${spec.bg[0]}"/><stop offset="1" stop-color="${spec.bg[1]}"/></linearGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <g fill="url(#${id})">${SHAPES[spec.shape]}</g><g fill="url(#${id}g)">${SHAPES[spec.shape]}</g>
      <g fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.2" transform="scale(.86)">${SHAPES[spec.shape]}</g>
      <g fill="${spec.fg}" stroke="${spec.fg}" color="${spec.fg}" stroke-width="0">${ICONS[spec.icon].replace(/currentColor/g, spec.bg[0])}</g></svg>`;
  }

  window.AreumiMockup = { mockup, guessType, supplierLogo };
})();
