const MAX_ARCHIVOS = 15;
const RUTA_BASE = 'https://raw.githubusercontent.com/angelos2024/productos/main/';
const ARCHIVO_BASE_PRINCIPAL = 'base_tahor_tame.json';
const PATRON_ARCHIVO = i => `base/producto${i}.json`;

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

// Nueva función que genera la tarjeta desplegable por producto
function generarHTMLProducto(producto) {
  const ing = producto.ingredientes.map(i =>
    isTame(i) ? `<span style="color:red">${i}</span>` : `<span>${i}</span>`).join(', ');

  let html = `
    <details class="detalle-producto">
      <summary><strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})</summary>
      ${producto.imagen && producto.imagen !== "imagen no disponible"
        ? `<img src="${producto.imagen}" alt="Imagen del producto" style="max-width:200px;">`
        : `<p style="color:gray;">🖼️ Imagen no disponible</p>`}
      <p><strong>Ingredientes:</strong> ${ing}</p>
  `;

  if (producto.ingredientes_tame && producto.ingredientes_tame.length > 0) {
    html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
    html += `<ul style="color:red;">${producto.ingredientes_tame.map(obj =>
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
       console.log(`🔍 Buscando en: ${url}`); // ← Aquí muestra el archivo que está leyendo
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
          if (coincidencias.length >= 5) break; // solo los primeros 5
        }
      }

      if (coincidencias.length >= 5) break;
    } catch (err) {
      console.warn("❌ Error cargando:", url, err);
      continue;
    }
  }

  quitarCarga();

  if (coincidencias.length === 0) return null;

  return coincidencias.map(generarHTMLProducto).join('<hr>');
}
