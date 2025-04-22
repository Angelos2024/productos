(() => {
function normalizeYsingularizar(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(w => w.endsWith("s") && !w.endsWith("es") ? w.slice(0, -1) : w)
    .join(" ");
}

const ingredientesTame = [
  "glicerina", "glicerol", "monoestearato de sorbitán",
  "gelatina", "grasa de cerdo", "monoestearato", "e471", "e472", "cochinilla",
  "cerdo", "puerco", "surimi", "ostra", "calamar", "anguila",
  "laca de cochinilla", "e120", "carmin", "gelatina de cerdo",
  "cuajo animal", "enzima animal", "colágeno animal", "animal fat",
  "pork gelatin", "blood", "sangre", "morcilla", "animal glycerin"
];

function isTame(i) {
  const normalizado = normalizeYsingularizar(i);
  return ingredientesTame.includes(normalizado);
}

const MAX_ARCHIVOS = 15;
const RUTA_BASE = 'https://raw.githubusercontent.com/angelos2024/productos/main/';
const ARCHIVO_BASE_PRINCIPAL = 'base_tahor_tame.json';
const PATRON_ARCHIVO = i => `base/producto${i}.json`;

function mostrarCarga() {
  const div = document.getElementById('analisisResultado');
  div.innerHTML = `
    <div class="cargando">
      <div class="spinner"></div>
      <p>🔄 Revisando base local archivo por archivo...</p>
    </div>
  `;
}

function quitarCarga() {
  const div = document.getElementById('analisisResultado');
  const anim = div.querySelector('.cargando');
  if (anim) anim.remove();
}

function generarHTMLProducto(producto) {
  let ingredientesTameDetectados = [];

  // 1️⃣ Si ya vienen desde el JSON
  if (producto.ingredientes_tame && producto.ingredientes_tame.length > 0) {
    ingredientesTameDetectados = producto.ingredientes_tame;
  } else {
    // 2️⃣ Si no vienen, los detectamos dinámicamente
    ingredientesTameDetectados = producto.ingredientes
      .filter(i => isTame(i))
      .map(i => ({ ingrediente: i, razon: "Detectado en lista Tame" }));
  }

  // Resaltado visual de ingredientes
  const ing = producto.ingredientes.map(i => {
    return ingredientesTameDetectados.find(obj => normalizeYsingularizar(obj.ingrediente) === normalizeYsingularizar(i))
      ? `<span style="color:red">${i}</span>`
      : `<span>${i}</span>`;
  }).join(', ');

  let html = `
    <details class="detalle-producto">
      <summary><strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})</summary>
      ${producto.imagen && producto.imagen !== "imagen no disponible"
        ? `<img src="${producto.imagen}" alt="Imagen del producto" style="max-width:200px;">`
        : `<p style="color:gray;">🖼️ Imagen no disponible</p>`}
      <p><strong>Ingredientes:</strong> ${ing}</p>
  `;

  if (ingredientesTameDetectados.length > 0) {
    html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
    html += `<ul style="color:red;">${ingredientesTameDetectados.map(obj =>
      `<li><b>${obj.ingrediente}</b>: ${obj.razon}</li>`).join("")}</ul></p>`;
  }

  html += `<p style="color:${producto.tahor ? 'green' : 'red'};">
    ${producto.tahor ? '✅ Apto (Tahor)' : '❌ No Apto (Tame)'}</p>
    </details>
  `;

  return html;
}

async function buscarProductoEnArchivos(nombre, marca, ean, pais = "") {
  mostrarCarga();
  const claveBusqueda = normalizeYsingularizar(`${marca} ${nombre}`);
  const urls = [
    `${RUTA_BASE}${ARCHIVO_BASE_PRINCIPAL}`,
    ...Array.from({ length: MAX_ARCHIVOS }, (_, i) => `${RUTA_BASE}${PATRON_ARCHIVO(i + 1)}`)
  ];

  const coincidencias = [];

  for (const url of urls) {
    try {
      console.log(`🔍 Buscando en: ${url}`);
      const res = await fetch(url);
      if (!res.ok) continue;

      const productos = await res.json();

      for (const producto of productos) {
        const claveProd = normalizeYsingularizar(`${producto.marca} ${producto.nombre}`);
        const eanCoincide = producto.ean && producto.ean === ean;
        const paisCoincide = !pais || (producto.pais && producto.pais.toLowerCase() === pais.toLowerCase());

        const esCoincidente = (
          claveProd.includes(claveBusqueda) || claveBusqueda.includes(claveProd) ||
          (ean && eanCoincide)
        );

        if (esCoincidente && paisCoincide) {
          coincidencias.push(producto);
          if (coincidencias.length >= 5) break;
        }
      }

      if (coincidencias.length >= 5) break;
    } catch (err) {
      console.warn("❌ Error cargando:", url, err);
    }
  }

  quitarCarga();

  if (coincidencias.length === 0) return null;

  return coincidencias.map(generarHTMLProducto).join('<hr>');
}

  window.buscarProductoEnArchivos = buscarProductoEnArchivos;

})();
