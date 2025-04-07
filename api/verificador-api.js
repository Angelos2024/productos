import { Octokit } from "@octokit/rest";

const REPO_OWNER = "angelos2024";
const REPO_NAME = "verificador";
const BRANCH = "main";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export default async function handler(req, res) {
  const allowedOrigins = [
    "https://verificador-sigma.vercel.app",
    "https://angelos2024.github.io"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "JSON inválido" });
    }
  }

  const { accion, producto } = body;
  if (!accion || !producto) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const pendientesRes = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "pendientes.json",
      ref: BRANCH,
    });

    const pendientesSha = pendientesRes.data.sha;
    const pendientes = JSON.parse(Buffer.from(pendientesRes.data.content, "base64").toString());

    if (accion === "registrar") {
      pendientes.push(producto);
      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "pendientes.json",
        message: `📥 Nuevo producto: ${producto.nombre}`,
        content: Buffer.from(JSON.stringify(pendientes, null, 2)).toString("base64"),
        sha: pendientesSha,
        branch: BRANCH,
      });
      return res.status(200).json({ success: true });
    }

    const match = pendientes.find(p => p.nombre === producto.nombre && p.marca === producto.marca);
    if (!match) return res.status(404).json({ error: "No encontrado" });

    if (accion === "aprobar") {
      const baseRes = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "base_tahor_tame.json",
        ref: BRANCH,
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

    const nuevosPendientes = pendientes.filter(p => !(p.nombre === producto.nombre && p.marca === producto.marca));
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
    console.error("❌ Error:", err);
    return res.status(500).json({ error: "Error en servidor" });
  }
}
