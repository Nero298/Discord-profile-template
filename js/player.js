(() => {
  const CFG = window.CFG;
  const tracks = CFG.tracks;
  const $ = id => document.getElementById(id);
  const audio = $("audio"), player = $("player"), musicBtn = $("musicBtn"), seek = $("seek");
  if (!tracks || !tracks.length) { musicBtn.hidden = true; return; }

  audio.volume = CFG.volume ?? 0.6;

  let current = -1;       // bài đang phát
  let upcoming = [];      // hàng đợi: luôn có >= 2 bài phía trước
  let userPaused = false; // người dùng chủ động tạm dừng
  let seeking = false;

  /* ---- thứ tự ngẫu nhiên: mỗi vòng xáo cả 3 bài, hết vòng thì xáo lại ---- */
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const makeRound = avoid => {
    const r = shuffle(tracks.map((_, i) => i));
    if (avoid != null && r.length > 1 && r[0] === avoid) [r[0], r[1]] = [r[1], r[0]]; // không lặp bài ngay sau bài vừa phát
    return r;
  };
  const refill = () => {
    while (upcoming.length < Math.min(2, tracks.length)) {
      const last = upcoming.length ? upcoming[upcoming.length - 1] : current;
      upcoming.push(...makeRound(last));
    }
  };

  /* ---- UI ---- */
  const fmt = s => { if (!isFinite(s)) return "0:00"; s = Math.floor(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const setPlaying = on => {
    $("bPlay").classList.toggle("on", on);
    musicBtn.classList.toggle("playing", on);
  };
  const renderTrack = () => {
    const t = tracks[current];
    $("pCover").src = t.cover; $("pCover").alt = t.title;
    $("pTitle").textContent = t.title;
    $("pArtist").textContent = t.artist || "";
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title, artist: t.artist || CFG.displayName,
        artwork: [{ src: new URL(t.cover, location.href).href, sizes: "256x256", type: "image/jpeg" }]
      });
    }
  };
  const tick = () => {
    const d = audio.duration, c = audio.currentTime;
    $("tCur").textContent = fmt(c);
    $("tDur").textContent = fmt(d);
    if (!seeking) { const v = d ? (c / d) * 1000 : 0; seek.value = v; seek.style.setProperty("--p", (v / 10) + "%"); }
  };

  /* ---- phát ---- */
  /* Trình duyệt chặn tự phát CÓ TIẾNG khi chưa chạm vào trang. Cách làm:
     1) thử phát có tiếng ngay (được nếu trình duyệt cho phép);
     2) bị chặn -> phát im lặng (luôn được phép), rồi bật tiếng ở lần chạm/bấm phím đầu tiên. */
  let silentStart = false;
  const tryPlay = () => audio.play().then(() => setPlaying(true)).catch(() => {
    if (!audio.muted) {
      audio.muted = true; silentStart = true;
      return audio.play().then(() => setPlaying(true)).catch(() => { audio.muted = false; silentStart = false; setPlaying(false); });
    }
    setPlaying(false);
  });
  const load = () => { audio.src = tracks[current].src; renderTrack(); tick(); };
  const next = () => { current = upcoming.shift(); refill(); load(); if (!userPaused) tryPlay(); };

  // khởi tạo: bốc ngẫu nhiên bài đầu, 2 bài còn lại xếp hàng đợi
  const first = makeRound(null);
  current = first[0]; upcoming = first.slice(1); refill();
  load();
  tryPlay();

  // lần tương tác đầu tiên: bật tiếng (hoặc bắt đầu phát nếu bị chặn hẳn)
  const GESTURES = ["pointerup", "touchend", "click", "keydown"];
  const detach = () => GESTURES.forEach(ev => document.removeEventListener(ev, kick));
  function kick() {
    if (silentStart) { audio.muted = false; silentStart = false; detach(); }
    if (!userPaused && audio.paused) tryPlay();
  }
  GESTURES.forEach(ev => document.addEventListener(ev, kick, { passive: true }));
  audio.addEventListener("playing", () => { setPlaying(true); if (!audio.muted) detach(); });

  audio.addEventListener("ended", next);
  audio.addEventListener("error", () => { if (tracks.length > 1) setTimeout(next, 800); });
  audio.addEventListener("timeupdate", tick);
  audio.addEventListener("loadedmetadata", tick);
  audio.addEventListener("pause", () => setPlaying(false));

  /* ---- điều khiển ---- */
  const toggle = () => {
    if (audio.paused) { userPaused = false; tryPlay(); }
    else { userPaused = true; audio.pause(); }
  };
  $("bPlay").addEventListener("click", toggle);
  $("bNext").addEventListener("click", () => { userPaused = false; next(); });
  $("bBack").addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
  $("bFwd").addEventListener("click", () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });

  seek.addEventListener("pointerdown", () => { seeking = true; });
  seek.addEventListener("input", () => {
    seek.style.setProperty("--p", (seek.value / 10) + "%");
    if (audio.duration) $("tCur").textContent = fmt((seek.value / 1000) * audio.duration);
  });
  seek.addEventListener("change", () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    seeking = false;
  });

  const setOpen = open => {
    player.classList.toggle("open", open);
    musicBtn.setAttribute("aria-expanded", open);
    if (open && audio.paused && !userPaused) tryPlay();
  };
  musicBtn.addEventListener("click", () => setOpen(!player.classList.contains("open")));
  $("pClose").addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });

  if ("mediaSession" in navigator) {
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", () => { userPaused = false; tryPlay(); });
    ms.setActionHandler("pause", () => { userPaused = true; audio.pause(); });
    ms.setActionHandler("nexttrack", () => { userPaused = false; next(); });
    ms.setActionHandler("seekbackward", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    ms.setActionHandler("seekforward", () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
  }
})();
