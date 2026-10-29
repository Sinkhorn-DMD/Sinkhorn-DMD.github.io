"use strict";
/* sDMD project page. Everything below reads from window.SDMD_DATA (assets/js/data.js). */
(() => {
  const DATA = window.SDMD_DATA || {};
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const METHODS = {
    teacher: { label: "Teacher", note: "100 NFE" },
    dmd2: { label: "DMD2", note: "4 steps" },
    rcm: { label: "rCM", note: "4 steps" },
    anyflow: { label: "AnyFlow", note: "4 steps" },
    sdmd: { label: "sDMD", note: "4 steps · ours", ours: true },
  };
  const ORDER = ["teacher", "dmd2", "rcm", "anyflow", "sdmd"];
  const PATHS = {
    play: "M8 5.5v13l11-6.5z",
    chevL: "M14 6l-6 6 6 6",
    chevR: "M10 6l6 6-6 6",
    close: "M6 6l12 12M18 6L6 18",
    text: "M4 6h16M4 12h10M4 18h7",
    check: "M5 12l4 4L19 6",
  };

  const versioned = url => (DATA.version ? `${url}?v=${DATA.version}` : url);

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function icon(d, cls) {
    const s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    d.split("M").filter(Boolean).forEach(seg => {
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", "M" + seg);
      s.append(p);
    });
    return s;
  }
  function chip(method) {
    const m = METHODS[method];
    const c = el("span", `chip ${method === "teacher" ? "teacher" : ""}${m.ours ? " ours" : ""}`);
    c.append(document.createTextNode(m.label + " "), el("span", "nfe", m.note));
    return c;
  }

  /* ------------------------------------------------------------ topbar */
  (function topbar() {
    const bar = document.querySelector(".topbar");
    if (!bar) return;
    const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const btn = bar.querySelector(".menu-btn");
    btn?.addEventListener("click", () => {
      const open = bar.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    bar.querySelectorAll(".topnav a").forEach(a => a.addEventListener("click", () => bar.classList.remove("open")));

    const links = [...bar.querySelectorAll('.topnav a[href^="#"]')];
    const targets = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if (!targets.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    targets.forEach(t => io.observe(t));
  })();

  /* ------------------------------------------------------- hero backdrop */
  // A decorative field of particles drifting toward a few attractors: a nod to
  // transport, not a figure. Skipped entirely under reduced motion.
  (function heroFlow() {
    const canvas = document.querySelector(".hero-flow");
    if (!canvas) return;
    if (REDUCED) { canvas.remove(); return; }
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const MODES = [[.12, .40], [.30, .20], [.50, .66], [.70, .18], [.88, .44], [.50, .92]];
    const N = 160;
    const parts = [];
    let W = 0, H = 0;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(p) {
      p.x = Math.random() * W; p.y = Math.random() * H;
      const m = MODES[Math.floor(Math.random() * MODES.length)];
      const r = Math.sqrt(Math.random()) * Math.min(W, H) * .07;
      const a = Math.random() * Math.PI * 2;
      p.tx = m[0] * W + Math.cos(a) * r; p.ty = m[1] * H + Math.sin(a) * r;
      p.life = 0; p.ttl = 7 + Math.random() * 7; p.rate = .35 + Math.random() * .45;
    }
    resize();
    for (let i = 0; i < N; i++) { const p = {}; spawn(p); p.life = Math.random() * p.ttl; parts.push(p); }

    let running = false, last = 0;
    function frame(now) {
      if (!running) return;
      const dt = Math.min(.05, (now - last) / 1000) || 0; last = now;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.life += dt;
        const k = 1 - Math.exp(-p.rate * dt);
        p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k;
        const dx = p.tx - p.x, dy = p.ty - p.y;
        const fadeIn = Math.min(1, p.life / 1.5);
        const fadeOut = Math.max(0, Math.min(1, (p.ttl - p.life) / 2));
        const alpha = .5 * fadeIn * fadeOut;
        ctx.strokeStyle = `rgba(123,215,154,${(alpha * .4).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x - dx * .11, p.y - dy * .11); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = `rgba(123,215,154,${alpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2); ctx.fill();
        if (p.life > p.ttl) spawn(p);
      }
      requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function stop() { running = false; }
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()), { threshold: .05 }).observe(hero);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 120); });
  })();

  /* ------------------------------------------------------------ lightbox */
  const lightbox = (() => {
    const root = document.getElementById("lightbox");
    if (!root) return { open() {}, close() {} };
    const body = root.querySelector(".lightbox-body");
    const closeBtn = root.querySelector(".close");
    let lastFocus = null;
    function close() {
      root.hidden = true;
      body.replaceChildren();
      document.body.classList.remove("modal-open");
      lastFocus?.focus?.();
    }
    function open(media, { kicker, caption } = {}) {
      lastFocus = document.activeElement;
      const fig = el("figure");
      fig.append(media);
      if (kicker || caption) {
        const cap = el("figcaption");
        if (kicker) cap.append(el("span", "kicker", kicker));
        if (caption) cap.append(document.createTextNode(caption));
        fig.append(cap);
      }
      body.replaceChildren(fig);
      root.hidden = false;
      document.body.classList.add("modal-open");
      closeBtn.focus();
    }
    closeBtn.addEventListener("click", close);
    root.addEventListener("click", e => { if (e.target === root) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !root.hidden) close(); });
    return { open, close };
  })();

  function lightboxImage(src, alt) {
    const img = el("img");
    img.src = versioned(src); img.alt = alt || "";
    return img;
  }
  function lightboxVideo(clip, label) {
    const v = el("video");
    v.controls = true; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
    v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
    v.poster = versioned(clip.poster); v.src = versioned(clip.src);
    v.setAttribute("aria-label", label || "video");
    return v;
  }

  /* ---------------------------------------------------------------- reel */
  (function reel() {
    const reel = document.querySelector(".reel");
    const items = DATA.showcase;
    if (!reel || !items?.length) return;
    const rowEls = [...reel.querySelectorAll(".reel-row")];
    const half = Math.ceil(items.length / rowEls.length);
    const groups = rowEls.map((_, i) => items.slice(i * half, (i + 1) * half));

    function makeClip(index) {
      const item = items[index];
      const clip = item.clips.sdmd[0];
      const fig = el("figure", "clip");
      fig.dataset.index = index;
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", `Open clip: ${item.label}`);
      if (REDUCED) {
        const img = el("img"); img.src = versioned(clip.poster); img.alt = item.label; img.loading = "lazy";
        fig.append(img);
      } else {
        const v = el("video");
        v.muted = true; v.loop = true; v.playsInline = true;
        v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
        v.preload = "none"; v.poster = versioned(clip.poster); v.dataset.src = versioned(clip.src);
        fig.append(v);
      }
      fig.append(el("figcaption", "clip-label", item.label));
      return fig;
    }

    const rows = rowEls.map((rowEl, i) => {
      const track = el("div", "reel-track");
      groups[i].forEach((_, j) => track.append(makeClip(i * half + j)));
      rowEl.append(track);
      return { rowEl, track, dir: i % 2 === 0 ? 1 : -1, speed: i % 2 === 0 ? 24 : 19, offset: 0, paused: false, base: groups[i].length };
    });

    reel.addEventListener("click", e => {
      const fig = e.target.closest(".clip");
      if (!fig) return;
      const item = items[+fig.dataset.index];
      lightbox.open(lightboxVideo(item.clips.sdmd[0], item.label), { kicker: "sDMD · Wan2.1-14B · 4 steps", caption: item.prompt });
    });
    reel.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("clip")) { e.preventDefault(); e.target.click(); }
    });

    if (REDUCED) { reel.classList.add("reduced-motion"); return; }

    // Make every row long enough to recycle without a visible seam: clone the
    // original clips until the track comfortably exceeds the viewport.
    const rowShown = row => row.rowEl.clientWidth > 0;
    function ensureFill(row) {
      if (!rowShown(row)) return;
      const need = row.rowEl.clientWidth + 2 * 380;
      let guard = 0;
      while (row.track.scrollWidth < need && guard++ < 8) {
        [...row.track.children].slice(0, row.base).forEach(c => row.track.append(c.cloneNode(true)));
      }
    }
    rows.forEach(ensureFill);

    const gapOf = track => parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 10;
    let running = false, last = 0;
    function tick(now) {
      if (!running) return;
      const dt = Math.min(.05, (now - last) / 1000) || 0; last = now;
      for (const row of rows) {
        if (row.paused || !rowShown(row)) continue;
        row.offset += row.speed * dt * row.dir;
        const gap = gapOf(row.track);
        if (row.dir > 0) {
          const first = row.track.firstElementChild;
          const w = first.getBoundingClientRect().width + gap;
          if (row.offset >= w) { row.offset -= w; row.track.append(first); }
        } else if (row.offset <= 0) {
          const lastChild = row.track.lastElementChild;
          const w = lastChild.getBoundingClientRect().width + gap;
          row.track.prepend(lastChild); row.offset += w;
        }
        row.track.style.transform = `translate3d(${(-row.offset).toFixed(2)}px,0,0)`;
      }
      requestAnimationFrame(tick);
    }
    function play() {
      rows.forEach(row => {
        if (!rowShown(row)) return;
        row.track.querySelectorAll("video").forEach(v => {
          if (!v.getAttribute("src")) { v.src = v.dataset.src; v.load(); }
          v.play().catch(() => {});
        });
      });
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
    }
    function pause() {
      running = false;
      reel.querySelectorAll("video").forEach(v => v.pause());
    }
    rows.forEach(row => {
      row.rowEl.addEventListener("mouseenter", () => { row.paused = true; });
      row.rowEl.addEventListener("mouseleave", () => { row.paused = false; });
      row.rowEl.addEventListener("focusin", () => { row.paused = true; });
      row.rowEl.addEventListener("focusout", () => { row.paused = false; });
    });
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible && !document.hidden ? play() : pause(); }, { rootMargin: "120px 0px" }).observe(reel);
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : visible && play()));
    let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => rows.forEach(ensureFill), 200); });
  })();

  /* ---------------------------------------------------------------- tabs */
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    function select(i) {
      tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => { if (p) p.hidden = i !== j; });
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        select(n); tabs[n].focus();
      });
    });
    select(Math.max(0, tabs.findIndex(t => t.getAttribute("aria-selected") === "true")));
  });

  /* ---------------------------------------------------------------- wall */
  (function wall() {
    const wall = document.getElementById("wall");
    if (!wall || !DATA.teaser) return;
    const tiles = [...DATA.teaser];
    // lead with the tile that spells the method's name
    const lead = tiles.findIndex(t => /sDMD/.test(t.caption || ""));
    if (lead > 0) tiles.unshift(...tiles.splice(lead, 1));
    tiles.forEach(t => {
      const fig = el("figure", "tile" + (t.big ? " big" : ""));
      fig.tabIndex = 0;
      const img = el("img");
      img.src = versioned(t.src); img.alt = t.caption || ""; img.loading = "lazy"; img.decoding = "async";
      fig.append(img, el("figcaption", null, t.caption || ""));
      const open = () => lightbox.open(lightboxImage(t.src, t.caption), { kicker: "sDMD · 4 steps", caption: t.caption });
      fig.addEventListener("click", open);
      fig.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      wall.append(fig);
    });
  })();

  /* ------------------------------------------------------------ explorer */
  (function explorer() {
    if (!DATA.images) return;
    Object.entries(DATA.images).forEach(([family, set]) => {
      const panel = document.getElementById(`explorer-${family}`);
      if (!panel || !set.rows?.length) return;
      const strip = el("div", "strip");
      strip.setAttribute("role", "group"); strip.setAttribute("aria-label", `${set.title} prompts`);
      const cmp = el("div", "cmp");
      let current = -1;

      function render(i) {
        if (i === current) return;
        current = i;
        const row = set.rows[i];
        strip.querySelectorAll(".pick").forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
        cmp.replaceChildren(...set.methods.map(([key, label]) => {
          const r = el("div", `cmp-row${key === "sdmd" ? " ours" : ""}`);
          const lab = el("div", "cmp-label");
          lab.append(el("span", `chip${key === "sdmd" ? " ours" : key === "teacher" ? " teacher" : ""}`, label));
          const imgs = el("div", "cmp-images");
          (row.cells[key] || []).forEach((src, k) => {
            const img = el("img"); img.src = versioned(src); img.alt = `${label}, ${row.label}, sample ${k + 1}`; img.loading = "lazy"; img.decoding = "async";
            img.addEventListener("click", () => lightbox.open(lightboxImage(src, img.alt), { kicker: `${label} · ${set.title}` }));
            imgs.append(img);
          });
          r.append(lab, imgs);
          return r;
        }));
      }
      set.rows.forEach((row, i) => {
        const b = el("button", "pick", `Example ${i + 1}`);
        b.type = "button"; b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", () => render(i));
        strip.append(b);
      });
      panel.append(strip, cmp);
      render(0);
    });
  })();

  /* --------------------------------------------------- synced playback */
  const whenReady = v => new Promise(res => {
    if (v.readyState >= 3 || v.error) return res();
    const done = () => { clearTimeout(t); res(); };
    const t = setTimeout(done, 8000);
    v.addEventListener("canplay", done, { once: true });
    v.addEventListener("error", done, { once: true });
  });

  class SyncGroup {
    constructor(root, videos) {
      this.root = root; this.videos = videos;
      this.visible = false; this.userPaused = REDUCED; this.started = false;
      if (this.userPaused) root.classList.add("paused");
      videos[0].addEventListener("ended", () => this.visible && !this.userPaused && this.play(true));
      root.addEventListener("click", () => this.toggle());
    }
    load() {
      this.videos.forEach(v => { if (!v.getAttribute("src")) { v.preload = "auto"; v.src = v.dataset.src; v.load(); } });
    }
    async play(fromStart) {
      this.load();
      await Promise.all(this.videos.map(whenReady));
      if (!this.visible || this.userPaused || this.disposed) return;
      if (fromStart || !this.started) { this.videos.forEach(v => { v.currentTime = 0; }); this.started = true; }
      this.root.classList.remove("paused");
      this.videos.forEach(v => v.play().catch(() => {}));
      this.align();
    }
    align() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (!this.visible || this.userPaused) return;
        const lead = this.videos[0];
        if (lead.paused || lead.readyState < 3) return;
        const remaining = lead.duration - lead.currentTime;
        if (!Number.isFinite(remaining) || remaining < .25) return;
        this.videos.slice(1).forEach(v => {
          if (v.readyState < 2) return;
          if (v.paused) v.play().catch(() => {});
          if (Math.abs(v.currentTime - lead.currentTime) <= .08) return;
          for (let i = 0; i < v.buffered.length; i++) {
            if (v.buffered.start(i) <= lead.currentTime && lead.currentTime <= v.buffered.end(i)) { v.currentTime = lead.currentTime; return; }
          }
        });
      }, 500);
    }
    pause() { clearInterval(this.timer); this.videos.forEach(v => v.pause()); }
    toggle() {
      this.userPaused = !this.userPaused;
      if (this.userPaused) { this.pause(); this.root.classList.add("paused"); } else this.play(false);
    }
    setVisible(on) { this.visible = on; on ? this.play(false) : this.pause(); }
    dispose() {
      this.disposed = true; clearInterval(this.timer);
      this.videos.forEach(v => { v.pause(); v.removeAttribute("src"); v.load(); });
    }
  }
  const groups = new Map();
  const groupObserver = new IntersectionObserver(entries => {
    entries.forEach(e => groups.get(e.target)?.setVisible(e.isIntersecting));
  }, { rootMargin: "160px 0px", threshold: .01 });
  function registerGroup(root) {
    const videos = [...root.querySelectorAll("video")];
    if (!videos.length) return;
    groups.set(root, new SyncGroup(root, videos));
    groupObserver.observe(root);
  }
  function unregisterGroup(root) {
    const g = groups.get(root);
    if (!g) return;
    groupObserver.unobserve(root); g.dispose(); groups.delete(root);
  }
  document.addEventListener("visibilitychange", () => {
    groups.forEach(g => (document.hidden ? g.pause() : g.visible && g.play(false)));
  });

  function frame(clip, label) {
    const f = el("div", "frame");
    const v = el("video");
    v.muted = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("disablepictureinpicture", "");
    v.preload = "none"; v.poster = versioned(clip.poster); v.dataset.src = versioned(clip.src);
    v.setAttribute("aria-label", label);
    const glyph = el("div", "pause-glyph"); glyph.append(icon(PATHS.play));
    f.append(v, glyph);
    return f;
  }

  /* -------------------------------------------------------------- viewers */
  // One viewer shows `pageSize` prompts per slide. With a single prompt the method
  // chip sits on every cell; with several, one header row labels the columns.
  function buildViewer(root, rows, { samples = 1, pageSize = 1 } = {}) {
    if (!root || !rows?.length) return;
    const paged = pageSize > 1;
    const pageCount = Math.ceil(rows.length / pageSize);
    const pad = n => String(n).padStart(2, "0");
    let page = 0, userDriven = false;
    if (paged) root.classList.add("paged");

    const head = el("div", "viewer-head");
    const nav = el("div", "viewer-nav");
    const prev = el("button", "step"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.append(icon(PATHS.chevL));
    const next = el("button", "step"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.append(icon(PATHS.chevR));
    const count = el("span", "count");
    nav.append(prev, count, next);
    const actions = el("div", "viewer-actions");
    const promptBtn = el("button", "pill"); promptBtn.type = "button"; promptBtn.setAttribute("aria-pressed", "false");
    promptBtn.append(icon(PATHS.text), document.createTextNode(paged ? "Prompts" : "Prompt"));
    actions.append(promptBtn);
    head.append(nav, actions);

    const grid = el("div", "vgrid" + (paged ? " rows" : ""));
    grid.setAttribute("role", "group"); grid.setAttribute("aria-label", "Click to pause or resume all clips");
    const prompt = el("div", "viewer-prompt"); prompt.hidden = true;
    const thumbs = el("div", "thumbs"); thumbs.setAttribute("aria-label", "Prompts");
    root.append(head, grid, prompt, thumbs);

    rows.forEach((row, i) => {
      const b = el("button"); b.type = "button"; b.setAttribute("aria-label", `${i + 1}. ${row.label}`);
      const img = el("img"); img.src = versioned(row.clips.sdmd[0].poster); img.alt = ""; img.loading = "lazy";
      b.append(img);
      b.addEventListener("click", () => render(Math.floor(i / pageSize)));
      thumbs.append(b);
    });
    promptBtn.addEventListener("click", () => {
      const open = promptBtn.getAttribute("aria-pressed") !== "true";
      promptBtn.setAttribute("aria-pressed", String(open));
      prompt.hidden = !open;
    });
    prev.addEventListener("click", () => render(page - 1));
    next.addEventListener("click", () => render(page + 1));
    root.addEventListener("keydown", e => {
      if (e.target.tagName === "BUTTON" && e.target.parentElement === thumbs) return;
      if (e.key === "ArrowLeft") render(page - 1);
      if (e.key === "ArrowRight") render(page + 1);
    });

    function cellsFor(row) {
      return ORDER.map(key => {
        const m = METHODS[key];
        const cell = el("div", `vcell${m.ours ? " ours" : ""}`);
        const frames = el("div", "frames");
        (row.clips[key] || []).slice(0, samples).forEach((clip, k) => {
          frames.append(frame(clip, `${m.label}, ${row.label}${samples > 1 ? `, seed ${k + 1}` : ""}`));
        });
        cell.append(chip(key), frames);
        return cell;
      });
    }

    function render(i) {
      page = (i + pageCount) % pageCount;
      const visible = rows.slice(page * pageSize, (page + 1) * pageSize);
      unregisterGroup(grid);
      grid.classList.remove("paused");
      if (paged) {
        const headRow = el("div", "vhead");
        ORDER.forEach(key => headRow.append(chip(key)));
        grid.replaceChildren(headRow, ...visible.map(row => {
          const r = el("div", "vrow");
          r.append(...cellsFor(row));
          return r;
        }));
      } else {
        grid.replaceChildren(...cellsFor(visible[0]));
      }
      registerGroup(grid);
      count.textContent = `${pad(page + 1)} / ${pad(pageCount)}`;
      if (paged) {
        const ol = el("ol");
        visible.forEach(row => ol.append(el("li", null, row.prompt)));
        prompt.replaceChildren(ol);
      } else {
        prompt.textContent = "\u201c" + visible[0].prompt + "\u201d";
      }
      thumbs.querySelectorAll("button").forEach((b, j) => {
        if (Math.floor(j / pageSize) === page) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
      if (userDriven) {
        const first = thumbs.children[page * pageSize];
        const left = first.offsetLeft - (thumbs.clientWidth - first.offsetWidth * Math.min(pageSize, 3)) / 2;
        thumbs.scrollTo({ left: Math.max(0, left), behavior: REDUCED ? "auto" : "smooth" });
      }
      userDriven = true;
    }
    render(0);
  }
  buildViewer(document.getElementById("viewer-qualitative"), DATA.qualitative, { samples: 1, pageSize: 3 });
  buildViewer(document.getElementById("viewer-diversity"), DATA.diversity, { samples: 2 });

  /* -------------------------------------------------------------- bibtex */
  document.querySelectorAll("[data-copy]").forEach(btn => {
    const target = document.querySelector(btn.dataset.copy);
    if (!target) return;
    const original = btn.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        btn.replaceChildren(icon(PATHS.check), document.createTextNode("Copied"));
        setTimeout(() => { btn.textContent = original; }, 1600);
      } catch { btn.textContent = "Select and copy"; }
    });
  });

  /* ---------------------------------------------------------------- math */
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
      throwOnError: false,
      trust: false,
    });
  }
})();
