// Assina os envios de imagem para o ImageKit. Só admins recebem assinatura.
// Variáveis (no painel do Worker): IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY (secreta),
// FIREBASE_PROJECT, ADMIN_EMAIL, ALLOWED_ORIGIN (opcional).
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization",
    };
    const out = (o, s = 200) =>
      new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "GET") return out({ error: "metodo" }, 405);

    // Proxy público e somente leitura do MangaDex (busca, capítulos e páginas).
    const u = new URL(req.url);
    if (u.pathname.startsWith("/md/")) {
      const p = u.pathname.slice(3);
      if (!/^\/(manga|at-home\/server)(\/|$)/.test(p)) return out({ error: "rota" }, 404);
      const r = await fetch("https://api.mangadex.org" + p + u.search, {
        headers: { "User-Agent": "ManhwaToons/1.0" },
        cf: p.startsWith("/at-home") ? {} : { cacheTtl: 120, cacheEverything: true },
      });
      return new Response(r.body, { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Quem é? O Firestore valida o token ao ler users/{uid}.
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer /, "");
    let c;
    try { c = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); }
    catch { return out({ error: "token_invalido" }, 401); }
    const uid = c.user_id || c.sub;
    if (!uid || c.aud !== env.FIREBASE_PROJECT) return out({ error: "token_invalido" }, 401);

    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/users/${uid}`,
      { headers: { Authorization: "Bearer " + token } }
    );
    if (!r.ok) return out({ error: "nao_autorizado" }, 401);
    const d = await r.json();
    const role = d.fields?.role?.stringValue;
    const dono = (c.email || "").toLowerCase() === env.ADMIN_EMAIL && c.email_verified === true;
    if (new URL(req.url).searchParams.get("scope") === "avatar") {
      // Foto de perfil: qualquer usuário logado, 1 assinatura a cada 20 s
      const last = +(d.fields?.avSignAt?.integerValue || 0);
      if (Date.now() - last < 20000) return out({ error: "muito_rapido" }, 429);
      await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=avSignAt`,
        { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { avSignAt: { integerValue: String(Date.now()) } } }) });
    } else if (role !== "admin" && !dono) return out({ error: "somente_admin" }, 403);

    // Assinatura do ImageKit: HMAC-SHA1(chave privada, token + expire)
    const t = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 600;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.IMAGEKIT_PRIVATE_KEY),
      { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
    const sig = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(t + expire)));
    return out({ token: t, expire, signature: sig, publicKey: env.IMAGEKIT_PUBLIC_KEY });
  },
};
