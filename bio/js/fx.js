/* Hiệu ứng nền. Chỉ trang trí: không chặn thao tác, không đụng tới UI. */
(() => {
  const CFG = window.CFG, FX = CFG.fx || {};
  const $ = id => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layer = $("fxLayer");
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---- 1. chấm mờ nhấp nháy ---- */
  for (let i = 0; i < (FX.dots ?? 28); i++) {
    const d = document.createElement("span");
    d.className = "amb-dot";
    d.textContent = "•";
    d.style.left = rnd(0, 98) + "%";
    d.style.top = rnd(0, 96) + "%";
    d.style.animationDuration = rnd(2.5, 4.5) + "s";
    d.style.animationDelay = "-" + rnd(0, 4) + "s";
    layer.appendChild(d);
  }
  if (reduced) return; // các hiệu ứng chuyển động bên dưới tắt khi máy bật "giảm chuyển động"

  /* ---- 2. lông vũ rơi (80% bên trái) ---- */
  const MAX_FEATHERS = 10;
  let feathers = 0;
  function spawnFeather() {
    if (document.hidden || feathers >= MAX_FEATHERS || !FX.featherImg) return;
    const f = new Image();
    f.src = FX.featherImg; f.alt = ""; f.draggable = false; f.className = "floating-feather";
    const w = window.innerWidth;
    f.style.left = (Math.random() < 0.8 ? rnd(0, w * 0.45) : rnd(0, w * 0.65)) + "px";
    f.style.top = "-50px";
    f.style.setProperty("--fall", (window.innerHeight + 80) + "px");
    f.style.animationDuration = rnd(8, 12) + "s";
    let gone = false;
    const done = () => { if (gone) return; gone = true; feathers--; f.remove(); };
    f.addEventListener("animationend", done);
    f.addEventListener("error", done);
    setTimeout(done, 13000);
    feathers++;
    layer.appendChild(f);
  }
  if (FX.feathers !== false) {
    for (let i = 0; i < 4; i++) setTimeout(spawnFeather, i * 900);
    setInterval(spawnFeather, 2500);
  }

  /* ---- 3. chữ ngẫu nhiên hiện rồi mờ ---- */
  const words = FX.popupWords && FX.popupWords.length ? FX.popupWords : ["huh?"];
  const dvd = $("dvd-text");
  function spawnText() {
    dvd.textContent = words[Math.floor(Math.random() * words.length)];
    dvd.style.left = Math.random() * Math.max(0, window.innerWidth - 100) + "px";
    dvd.style.top = Math.random() * Math.max(0, window.innerHeight - 100) + "px";
    dvd.style.opacity = "0.75";
    setTimeout(() => {
      dvd.style.opacity = "0";
      setTimeout(spawnText, 2500);
    }, 1200);
  }
  if (FX.popups !== false) setTimeout(spawnText, 2000);

  /* ---- 4. con trỏ tuỳ chỉnh + 5. sáng khi bấm ---- */
  const cur = $("custom-cursor");
  const hasMouse = matchMedia("(pointer: fine)").matches;
  if (FX.cursor !== false && hasMouse && FX.cursorImg) {
    // chỉ ẩn con trỏ thật SAU KHI ảnh con trỏ mới tải xong (tránh mất con trỏ nếu ảnh lỗi)
    const probe = new Image();
    probe.onload = () => {
      cur.src = FX.cursorImg;
      document.documentElement.classList.add("has-cursor");
      document.addEventListener("mousedown", () => cur.classList.add("clicking"));
      document.addEventListener("mouseup", () => cur.classList.remove("clicking"));
      document.documentElement.addEventListener("mouseleave", () => { cur.hidden = true; });
    };
    probe.src = FX.cursorImg;
  }
  let raf = 0, cx = 0, cy = 0;
  const moveCursor = (x, y) => {
    if (!document.documentElement.classList.contains("has-cursor")) return;
    cx = x; cy = y;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      cur.hidden = false;
      cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    });
  };

  /* ---- 6. vệt lông vũ sau con trỏ / ngón tay ---- */
  const MAX_TRAIL = 40;
  let trail = 0, lx = null, ly = 0, lt = 0, lastSpawn = 0;
  function trailAt(x, y) {
    if (!FX.featherImg) return;
    const now = performance.now();
    if (lx === null) { lx = x; ly = y; lt = now; return; }
    const dx = x - lx, dy = y - ly, dist = Math.hypot(dx, dy);
    if (dist < 2) return;                                   // bỏ rung nhẹ
    const speed = dist / Math.max(now - lt, 8) * 16;        // px mỗi ~16ms
    lx = x; ly = y; lt = now;
    const gap = Math.min(120, Math.max(30, 120 - speed * 3)); // nhanh -> nhiều lông hơn
    if (now - lastSpawn < gap || trail >= MAX_TRAIL) return;
    lastSpawn = now;

    const angle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 1.2; // ngược hướng di chuyển
    const d = Math.min(20 + speed * 1.2, 70);
    const f = new Image();
    f.src = FX.featherImg; f.alt = ""; f.draggable = false; f.className = "cursor-feather";
    const start = Math.atan2(dy, dx) * 180 / Math.PI + rnd(-25, 25);
    f.style.left = (x - 6) + "px"; f.style.top = (y - 6) + "px";
    f.style.setProperty("--fx", Math.round(Math.cos(angle) * d) + "px");
    f.style.setProperty("--fy", Math.round(Math.sin(angle) * d) + "px");
    f.style.setProperty("--fstart", Math.round(start) + "deg");
    f.style.setProperty("--fend", Math.round(start + rnd(-60, 60)) + "deg");
    f.style.setProperty("--fd", Math.max(0.5, 1.1 - speed * 0.012) + "s");
    let gone = false;
    const done = () => { if (gone) return; gone = true; trail--; f.remove(); };
    f.addEventListener("animationend", done);
    f.addEventListener("error", done);
    setTimeout(done, 1600);
    trail++;
    document.body.appendChild(f);
  }

  document.addEventListener("mousemove", e => { moveCursor(e.clientX, e.clientY); trailAt(e.clientX, e.clientY); }, { passive: true });
  document.addEventListener("touchmove", e => { const t = e.touches[0]; if (t) trailAt(t.clientX, t.clientY); }, { passive: true });
  document.addEventListener("touchend", () => { lx = null; }, { passive: true });
})();
