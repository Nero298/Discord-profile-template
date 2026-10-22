(() => {
  const CFG = window.CFG;
  const $ = id => document.getElementById(id);
  const cdn = "https://cdn.discordapp.com";
  const ext = h => h.startsWith("a_") ? "gif" : "png";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  $("pfp").src = `${cdn}/avatars/${CFG.id}/${CFG.avatar}.${ext(CFG.avatar)}?size=256`;
  $("banner").style.backgroundImage = `url(${cdn}/banners/${CFG.id}/${CFG.banner}.${ext(CFG.banner)}?size=600)`;
  if (CFG.decoration) $("deco").src = `${cdn}/avatar-decoration-presets/${CFG.decoration}.png?size=128&passthrough=true`;
  else $("deco").remove();

  $("dname").textContent = CFG.displayName;
  $("uid").textContent = CFG.pronouns;
  $("bio").textContent = CFG.bio;
  document.title = CFG.displayName;

  if (CFG.bgImage) { $("bg").classList.add("img"); $("bg").style.backgroundImage = `url(${CFG.bgImage})`; }

  if (CFG.clan) {
    const t = $("tag");
    t.innerHTML = `<img alt="" src="${cdn}/clan-badges/${CFG.clan.guild}/${CFG.clan.badge}.png?size=32"><span></span>`;
    t.lastChild.textContent = CFG.clan.tag;
    t.hidden = false;
  }

  $("links").innerHTML = CFG.links.map(l =>
    `<div><b>${esc(l.label)}</b><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url.replace(/^https?:\/\//, ""))}</a></div>`).join("");

  $("langs").innerHTML = CFG.languages.map(l =>
    `<img src="${esc(l.icon)}" alt="${esc(l.name)}" title="${esc(l.name)}">`).join("");

  const ICONS = {
    github: `<svg viewBox="0 0 24 24"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.43 2.9l-.23.46a18.3 18.3 0 0 0-6.4 0l-.23-.46a19.8 19.8 0 0 0-4.89 1.47C.54 9.05-.3 13.6.12 18.09a19.9 19.9 0 0 0 6 3.03l.77-1.2a12.9 12.9 0 0 1-2.03-.97l.5-.38a14.2 14.2 0 0 0 12.28 0l.5.38c-.65.38-1.33.7-2.03.97l.77 1.2a19.9 19.9 0 0 0 6-3.03c.5-5.2-.84-9.71-3.56-13.72zM8.35 15.33c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4 2.17 1.08 2.15 2.4c0 1.32-.95 2.4-2.15 2.4zm7.3 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4 2.17 1.08 2.15 2.4c0 1.32-.95 2.4-2.15 2.4z"/></svg>`
  };
  $("icons").innerHTML = CFG.socials.map(s =>
    `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.type)}">${ICONS[s.type] || ""}</a>`).join("");

  if (CFG.lanyard) {
    fetch(`https://api.lanyard.rest/v1/users/${CFG.id}`)
      .then(r => r.json())
      .then(j => {
        if (!j.success) return;
        const s = j.data.discord_status || "offline";
        $("dot").className = "dot " + s; $("dot").title = s;
      }).catch(() => {});
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const P = CFG.phrases || [], gTop = $("ghostTop"), gBot = $("ghostBot");
  if (P.length) {
    gTop.textContent = P[0]; gBot.textContent = P[1 % P.length];
    if (P.length > 1 && !reduced) {
      const swap = (el, t) => { el.classList.add("out"); setTimeout(() => { el.textContent = t; el.classList.remove("out"); }, 550); };
      let i = 0;
      setInterval(() => {
        i = (i + 1) % P.length;
        swap(gTop, P[i]);
        setTimeout(() => swap(gBot, P[(i + 1) % P.length]), 700);
      }, CFG.phraseInterval || 4000);
    }
  }

  const bv = $("bgvid");
  const vids = [].concat(CFG.bgVideo || []);
  if (vids.length && !reduced) {
    bv.muted = true;
    vids.forEach((u, i) => {
      const s = document.createElement("source");
      s.src = u; s.type = "video/mp4";
      if (i === vids.length - 1) s.addEventListener("error", () => bv.remove());
      bv.appendChild(s);
    });
    bv.load();
    bv.addEventListener("canplay", () => { bv.classList.add("on"); bv.play().catch(() => {}); }, { once: true });
  } else bv.remove();

  document.addEventListener("contextmenu", e => { if (e.target.closest && e.target.closest("img")) e.preventDefault(); });

  const fmt = n => n.toLocaleString("de-DE");
  const countEl = $("viewCount"), viewsEl = $("views");
  let vid = "";
  try {
    vid = localStorage.getItem("vid") || "";
    if (!vid) {
      vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem("vid", vid);
    }
  } catch (e) {}
  fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vid }) })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(j => {
      if (typeof j.count === "number") countEl.textContent = fmt(j.count);
      else viewsEl.title = j.configured === false ? "Chưa nối Redis (xem README)" : "Backend lỗi";
    })
    .catch(() => { viewsEl.title = "Không gọi được /api/views"; });
})();
