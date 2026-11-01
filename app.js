(function () {
  "use strict";
  var C = window.FDP, $ = function (id) { return document.getElementById(id); };
  var ALL = "Todo", OLD_HOST = /^https?:\/\/flord-pilchasok\.vercel\.app\/((?:remera|vestido)-[\w-]+\.webp)$/;
  var products = [], current = ALL, open = null, colorIdx = 0, size = null, slideMeta = [], lastFocus = null;
  var money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  var fmt = function (n) { return money.format(Number(n) || 0).replace(/\u00a0/g, " "); };
  var waBase = "https://wa.me/" + C.whatsapp;

  function localize(u, small) {
    if (!u) return "";
    var m = String(u).match(OLD_HOST);
    if (m) u = "img/" + m[1];
    if (small && /^img\/.+\.webp$/.test(u) && !/\.w480\.webp$/.test(u)) u = u.replace(/\.webp$/, ".w480.webp");
    return u;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function normalize(p) {
    var colors = (Array.isArray(p.colors) ? p.colors : []).filter(function (c) { return c && c.name; }).map(function (c) {
      return { name: String(c.name), hex: c.hex || "#ccc", images: (c.images || []).filter(Boolean) };
    });
    var images = (p.images || []).filter(Boolean);
    if (!images.length && colors[0] && colors[0].images.length) images = colors[0].images.slice();
    var sizes = (p.sizes || []).map(function (s) { return String(s).trim(); }).filter(Boolean);
    return { id: String(p.id), name: String(p.name || ""), price: p.price, category: p.category || "", description: p.description || "",
      sizes: sizes.length ? sizes : ["Único"], colors: colors, images: images, soldOut: !!(p.sold_out || p.soldOut) };
  }

  function load() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 3500);
    var headers = { apikey: C.supabaseKey };
    if (/^eyJ/.test(C.supabaseKey)) headers.Authorization = "Bearer " + C.supabaseKey;
    return fetch(C.supabaseUrl + "/rest/v1/products?select=*&active=eq.true&order=sort.asc,name.asc", { headers: headers, signal: ctrl && ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rows) { if (!Array.isArray(rows) || !rows.length) throw new Error("vacío"); return rows; })
      .catch(function () { return window.FDP_FALLBACK || []; })
      .then(function (rows) { clearTimeout(timer); return rows.map(normalize).filter(function (p) { return p.name; }); });
  }

  /* Categorías */
  function renderChips() {
    var box = $("chips"); box.textContent = "";
    var cats = [ALL].concat(C.categories);
    products.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    cats.forEach(function (c) {
      var n = c === ALL ? products.length : products.filter(function (p) { return p.category === c; }).length;
      if (!n && c !== ALL) return;
      var b = el("button", "chip" + (c === current ? " is-on" : ""));
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", c === current);
      b.dataset.cat = c; b.appendChild(document.createTextNode(c)); b.appendChild(el("small", null, n));
      b.addEventListener("click", function () { current = c; renderChips(); renderGrid(); });
      box.appendChild(b);
    });
    updateChipHint();
  }
  function updateChipHint() { var b = $("chips"); $("chips").parentNode.classList.toggle("has-more", b.scrollWidth - b.clientWidth - b.scrollLeft > 6); }

  /* Grilla */
  function renderGrid() {
    var grid = $("grid"); grid.textContent = ""; grid.setAttribute("aria-busy", "false");
    var list = products.filter(function (p) { return current === ALL || p.category === current; });
    $("empty").hidden = list.length > 0;
    list.forEach(function (p, i) {
      var card = el("button", "card"); card.type = "button"; card.style.setProperty("--i", Math.min(i, 12));
      card.dataset.id = p.id;
      card.setAttribute("aria-label", p.name + ", " + fmt(p.price) + (p.soldOut ? ", agotado" : ""));
      var box = el("div", "card__img");
      var srcs = p.images.slice(0, 2);
      if (srcs.length < 2 && p.colors[1] && p.colors[1].images[0]) srcs.push(p.colors[1].images[0]);
      srcs.forEach(function (s, k) {
        var im = el("img", k ? "" : "is-loading"); im.alt = ""; im.width = 480; im.height = 600; im.decoding = "async";
        im.loading = i < 4 && !k ? "eager" : "lazy";
        if (!k) im.onload = im.onerror = function () { im.classList.remove("is-loading"); };
        im.src = localize(s, true); box.appendChild(im);
      });
      if (p.soldOut) box.appendChild(el("span", "tag", "Agotado"));
      card.appendChild(box);
      card.appendChild(el("span", "card__name", p.name));
      var foot = el("span", "card__foot"); foot.appendChild(el("span", "price", fmt(p.price)));
      if (p.colors.length > 1) {
        var d = el("span", "dots-mini"); d.setAttribute("aria-hidden", "true");
        p.colors.slice(0, 5).forEach(function (c) { var x = el("i"); x.style.background = c.hex; d.appendChild(x); });
        foot.appendChild(d);
      }
      card.appendChild(foot);
      card.addEventListener("click", function () { openProduct(p.id); });
      grid.appendChild(card);
    });
  }

  /* Detalle */
  function buildSlides(p) {
    slideMeta = [];
    if (p.colors.length) p.colors.forEach(function (c, ci) { (c.images.length ? c.images : p.images.slice(0, 1)).forEach(function (s) { slideMeta.push({ src: s, color: ci }); }); });
    var seen = {}; slideMeta.forEach(function (m) { seen[m.src] = 1; });
    p.images.forEach(function (s) { if (!seen[s]) slideMeta.push({ src: s, color: -1 }); });
    if (!slideMeta.length) slideMeta.push({ src: "logo-640.webp", color: -1 });
    var box = $("slides"), dots = $("dots"); box.textContent = ""; dots.textContent = "";
    slideMeta.forEach(function (m, i) {
      var s = el("div", "slide"), im = el("img"); im.src = localize(m.src); im.width = 800; im.height = 1000;
      im.alt = p.name + (m.color >= 0 ? " — " + p.colors[m.color].name : "") + " (foto " + (i + 1) + " de " + slideMeta.length + ")";
      im.loading = i < 2 ? "eager" : "lazy"; s.appendChild(im); box.appendChild(s); dots.appendChild(el("i"));
    });
    box.scrollLeft = 0;
  }
  function slideIndex() { var b = $("slides"); return Math.round(b.scrollLeft / (b.clientWidth || 1)); }
  function goSlide(i, smooth) {
    var b = $("slides"); i = Math.max(0, Math.min(slideMeta.length - 1, i));
    b.scrollTo({ left: i * b.clientWidth, behavior: smooth === false || matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    syncSlide(i);
  }
  function syncSlide(i) {
    if (i == null) i = slideIndex();
    var many = slideMeta.length > 1;
    $("dPrev").hidden = !many || i <= 0; $("dNext").hidden = !many || i >= slideMeta.length - 1;
    $("dots").hidden = !many;
    Array.prototype.forEach.call($("dots").children, function (d, k) { d.classList.toggle("on", k === i); });
    var m = slideMeta[i]; if (m && m.color >= 0 && m.color !== colorIdx) { colorIdx = m.color; renderColors(); updateWa(); }
  }
  function renderColors() {
    var p = open, box = $("dColors"); box.textContent = "";
    $("dColorsWrap").hidden = !p.colors.length;
    if (!p.colors.length) return;
    $("dColor").textContent = p.colors[colorIdx].name;
    p.colors.forEach(function (c, i) {
      var b = el("button", "opt-btn opt-btn--color"); b.type = "button"; b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", i === colorIdx); b.dataset.color = c.name;
      var dot = el("i"); dot.style.background = c.hex; b.appendChild(dot); b.appendChild(document.createTextNode(c.name));
      b.addEventListener("click", function () {
        colorIdx = i; renderColors(); updateWa();
        for (var k = 0; k < slideMeta.length; k++) if (slideMeta[k].color === i) { goSlide(k); break; }
      });
      box.appendChild(b);
    });
  }
  function renderSizes() {
    var p = open, box = $("dSizes"); box.textContent = "";
    $("dSizeHint").textContent = p.sizes.length > 1 && !size ? " · elegí uno" : "";
    p.sizes.forEach(function (s) {
      var b = el("button", "opt-btn", s); b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", s === size);
      b.addEventListener("click", function () { size = s; renderSizes(); updateWa(); });
      box.appendChild(b);
    });
  }
  function link(p) {
    var base = location.origin && location.origin !== "null" ? location.origin + location.pathname : "https://flordepilchas-nueva.vercel.app/";
    return base + "#p=" + encodeURIComponent(p.id) + (p.colors.length ? "&c=" + encodeURIComponent(p.colors[colorIdx].name) : "");
  }
  function waMessage(p) {
    var parts = [p.name.toUpperCase()];
    if (p.colors.length) parts.push("Color: " + p.colors[colorIdx].name);
    parts.push(size ? "Talle " + size : "Talles " + p.sizes.join("/"));
    parts.push(fmt(p.price));
    return (p.soldOut ? "Hola Nancy! ¿Va a volver a entrar? Me interesa: " : "Hola Nancy! Quería consultar stock de: ") + parts.join(" - ") + "\n" + link(p);
  }
  function updateWa() {
    if (!open) return;
    $("dWa").href = waBase + "?text=" + encodeURIComponent(waMessage(open));
    $("dWa").querySelector("span").textContent = open.soldOut ? "Consultar si vuelve" : "Consultá stock con Nancy";
    if (history.replaceState) history.replaceState(null, "", "#p=" + encodeURIComponent(open.id) + (open.colors.length ? "&c=" + encodeURIComponent(open.colors[colorIdx].name) : ""));
  }
  function openProduct(id, colorName) {
    var p = products.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    if (!open) lastFocus = document.activeElement;
    open = p; size = p.sizes.length === 1 ? p.sizes[0] : null;
    colorIdx = 0; p.colors.forEach(function (c, i) { if (colorName && c.name === colorName) colorIdx = i; });
    $("dCat").textContent = p.category; $("dName").textContent = p.name; $("dPrice").textContent = fmt(p.price);
    $("dOut").hidden = !p.soldOut; $("dDesc").textContent = p.description; $("dDesc").hidden = !p.description;
    $("sheet").hidden = false; $("sheetBg").hidden = false; document.body.classList.add("locked");
    $("sheet").scrollTop = 0;
    buildSlides(p); renderColors(); renderSizes(); updateWa();
    var first = -1; for (var k = 0; k < slideMeta.length; k++) if (slideMeta[k].color === colorIdx) { first = k; break; }
    requestAnimationFrame(function () { goSlide(Math.max(first, 0), false); });
    $("dClose").focus({ preventScroll: true });
  }
  function closeProduct() {
    if (!open) return; open = null;
    $("sheet").hidden = true; $("sheetBg").hidden = true; document.body.classList.remove("locked");
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function fromHash() {
    var h = new URLSearchParams(location.hash.replace(/^#/, "")), id = h.get("p");
    if (id && (!open || open.id !== id)) openProduct(id, h.get("c"));
  }

  /* Eventos */
  var st; $("slides").addEventListener("scroll", function () { clearTimeout(st); st = setTimeout(function () { syncSlide(); }, 70); }, { passive: true });
  $("dPrev").addEventListener("click", function () { goSlide(slideIndex() - 1); });
  $("dNext").addEventListener("click", function () { goSlide(slideIndex() + 1); });
  $("dClose").addEventListener("click", closeProduct);
  $("sheetBg").addEventListener("click", closeProduct);
  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") closeProduct();
    else if (e.key === "ArrowLeft" && !/INPUT|TEXTAREA/.test(e.target.tagName)) goSlide(slideIndex() - 1);
    else if (e.key === "ArrowRight" && !/INPUT|TEXTAREA/.test(e.target.tagName)) goSlide(slideIndex() + 1);
    else if (e.key === "Tab") {
      var f = $("sheet").querySelectorAll("button:not([hidden]),a[href],[tabindex='0']");
      f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener("hashchange", fromHash);
  window.addEventListener("resize", function () { updateChipHint(); if (open) goSlide(slideIndex(), false); });
  $("chips").addEventListener("scroll", updateChipHint, { passive: true });
  var top = $("top"); window.addEventListener("scroll", function () { top.classList.toggle("is-scrolled", scrollY > 8); }, { passive: true });

  var themeBtn = $("themeBtn");
  function syncThemeLabel() { var d = document.documentElement.getAttribute("data-theme") === "dark"; themeBtn.setAttribute("aria-label", d ? "Cambiar a modo claro" : "Cambiar a modo oscuro"); document.querySelector('meta[name="theme-color"]').content = d ? "#1d1922" : "#fbf4ec"; }
  themeBtn.addEventListener("click", function () {
    var r = document.documentElement, n = r.getAttribute("data-theme") === "dark" ? "light" : "dark";
    r.classList.add("theme-anim"); r.setAttribute("data-theme", n); setTimeout(function () { r.classList.remove("theme-anim"); }, 450);
    try { localStorage.setItem("fdpn-theme", n); } catch (e) {}
    syncThemeLabel();
  });
  syncThemeLabel();

  var hello = waBase + "?text=" + encodeURIComponent("Hola Nancy! Vi la tienda de Flor de Pilchas y quería hacerte una consulta.");
  $("fab").href = hello; $("footWa").href = hello; $("footIg").href = C.instagramUrl;
  $("footCopy").textContent = "© " + new Date().getFullYear() + " Flor de Pilchas";

  var g = $("grid"); for (var i = 0; i < 8; i++) g.appendChild(el("div", "ph"));
  load().then(function (list) { products = list; renderChips(); renderGrid(); fromHash(); });
})();
