// Configuración
const MAX_ARCHIVOS = 15;  // Puedes ajustar según tu cantidad real
const RUTA_BASE = 'https://raw.githubusercontent.com/angelos2024/productos/main/base/';
const ARCHIVO_BASE_PRINCIPAL = 'base_tahor_tame.json';
const PATRON_ARCHIVO = i => `producto${i}.json`;

// Normalización
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

// Animación de carga
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

// Función de búsqueda
async function buscarProductoEnArchivos(nombre, marca, ean, pais = "") {
  mostrarCarga();
  const clave = normalizeYsingularizar(marca + " " + nombre);
  const urls = [
    `${RUTA_BASE}${ARCHIVO_BASE_PRINCIPAL}`,
    ...Array.from({ length: MAX_ARCHIVOS }, (_, i) => `${RUTA_BASE}${PATRON_ARCHIVO(i + 1)}`)
  ];

  let encontrados = [];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const productos = await res.json();

      const filtrados = productos.filter(producto =>
        filtrarPorCoincidencia(producto, clave, ean, pais)
      );

      encontrados.push(...filtrados);
    } catch (err) {
      console.warn("❌ Error cargando:", url, err);
      continue;
    }
  }

  quitarCarga();

  if (encontrados.length === 0) return null;
  return renderizarResultadosMultiples(encontrados);
}


  quitarCarga();
  return null;
}
