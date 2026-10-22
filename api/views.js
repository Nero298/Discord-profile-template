const crypto = require("crypto");

const BASE = parseInt(process.env.VIEWS_BASE || "0", 10);
const SALT = process.env.VIEWS_SALT || "bio-site";
const TTL_H = parseFloat(process.env.VIEWS_TTL_HOURS || "24");
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const COUNT_KEY = "bio:visitors";

async function redis(command) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  if (!r.ok) throw new Error(`redis http ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function body(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b && typeof b === "object" ? b : {};
}

function visitorId(req) {
  const vid = String(body(req).vid || "").slice(0, 100);
  if (vid) return crypto.createHash("sha256").update(SALT + vid).digest("hex").slice(0, 32);
  const h = req.headers;
  const ip = String(h["x-vercel-forwarded-for"] || h["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "").split(",")[0].trim();
  return crypto.createHash("sha256").update(SALT + ip + (h["user-agent"] || "")).digest("hex").slice(0, 32);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (!URL_ || !TOKEN) {
    return res.status(200).json({
      count: null, configured: false,
      hint: "Chưa có biến môi trường Redis. Vào Vercel > Storage > Upstash for Redis > Connect to Project, rồi Redeploy."
    });
  }

  try {
    if (req.method === "POST") {
      let counted = true;
      if (TTL_H > 0) {
        const ttl = String(Math.max(1, Math.round(TTL_H * 3600)));
        counted = (await redis(["SET", `bio:seen:${visitorId(req)}`, "1", "NX", "EX", ttl])) === "OK";
      }
      if (counted) await redis(["INCR", COUNT_KEY]);
    } else if (req.method !== "GET") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    const real = parseInt((await redis(["GET", COUNT_KEY])) || "0", 10);
    return res.status(200).json({ count: BASE + real, real, configured: true });
  } catch (e) {
    return res.status(200).json({ count: null, configured: true, error: String(e.message || e) });
  }
};
