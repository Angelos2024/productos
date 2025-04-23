if (accion === "proxyOpenFood") {
  const fetch = require("node-fetch");
  const { url } = body;

  if (!url || !url.startsWith("https://world.openfoodfacts.org")) {
    return res.status(400).json({ error: true, mensaje: "URL inválida para proxy" });
  }

  try {
    const offRes = await fetch(url);
    const contentType = offRes.headers.get("content-type") || "";
    const text = await offRes.text();

    if (!offRes.ok || !contentType.includes("application/json")) {
      return res.status(200).json({
        error: true,
        mensaje: "OpenFoodFacts falló o devolvió respuesta no válida",
        status: offRes.status,
        tipo: contentType,
        texto: text.slice(0, 200)
      });
    }

    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch (err) {
      return res.status(200).json({
        error: true,
        mensaje: "Respuesta de OpenFoodFacts no es JSON válido",
        texto: text.slice(0, 200)
      });
    }

  } catch (err) {
    return res.status(200).json({
      error: true,
      mensaje: "Error de red al contactar OpenFoodFacts",
      detalle: err.message
    });
  }
}


const { Octokit } = require("@octokit/rest");

const REPO_OWNER = "angelos2024";
const REPO_NAME = "productos";
const BRANCH = "main";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

module.exports = async (req, res) => {
  const ALLOWED_ORIGINS = [
    "https://productos-amber.vercel.app",
    "https://angelos2024.github.io"
  ];

  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Solo POST permitido" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "JSON inválido" });
    }
  }

  const { accion, producto } = body;

  try {
    // Leer pendientes.json
    const pendientesRes = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "pendientes.json",
      ref: BRANCH
    });

    const pendientesSha = pendientesRes.data.sha;
    const pendientes = JSON.parse(
      Buffer.from(pendientesRes.data.content, "base64").toString()
    );

    // 📥 Acción: LISTAR productos pendientes
    if (accion === "listar") {
      return res.status(200).json(pendientes);
    }

    // 📥 Acción: REGISTRAR nuevo producto
    if (accion === "registrar") {
      pendientes.push(producto);

      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "pendientes.json",
        message: `📥 Registro: ${producto.nombre}`,
        content: Buffer.from(JSON.stringify(pendientes, null, 2)).toString("base64"),
        sha: pendientesSha,
        branch: BRANCH,
      });

      return res.status(200).json({ success: true });
    }

    // 📌 Validar existencia del producto
    if (!producto) {
      return res.status(400).json({ error: "Faltan datos del producto" });
    }

    const match = pendientes.find(p => p.nombre === producto.nombre && p.marca === producto.marca);
    if (!match) return res.status(404).json({ error: "Producto no encontrado en pendientes.json" });

    // ✅ Acción: APROBAR producto
    if (accion === "aprobar") {
      const baseRes = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "base_tahor_tame.json",
        ref: BRANCH
      });

      const baseSha = baseRes.data.sha;
      const base = JSON.parse(Buffer.from(baseRes.data.content, "base64").toString());

      delete producto.estado;
      base.push(producto);

      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "base_tahor_tame.json",
        message: `✅ Aprobado: ${producto.nombre}`,
        content: Buffer.from(JSON.stringify(base, null, 2)).toString("base64"),
        sha: baseSha,
        branch: BRANCH,
      });
    }

    // ❌ Acción: RECHAZAR (o limpiar luego de aprobar)
    const nuevosPendientes = pendientes.filter(p =>
      !(p.nombre === producto.nombre && p.marca === producto.marca)
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "pendientes.json",
      message: `🗑️ ${accion === "aprobar" ? "Aprobado" : "Rechazado"}: ${producto.nombre}`,
      content: Buffer.from(JSON.stringify(nuevosPendientes, null, 2)).toString("base64"),
      sha: pendientesSha,
      branch: BRANCH,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Error API:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
