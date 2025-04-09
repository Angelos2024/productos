// Configuración
const MAX_ARCHIVOS = 1;  // Número total de archivos
const RUTA_BASE = 'https://raw.githubusercontent.com/angelos2024/productos/main/base/';
const PATRON_ARCHIVO = i => `producto${i}.json`;

// Normalización como en main.js
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

// Agrega animación de carga
function mostrarCarga() {
  const div = document.getElementById('analisisResultado');
  div.innerHTML = `
    <div class="cargando">
      <div class="spinner"></div>
      <p>🔄 Revisando base local archivo por archivo...</p>
    </div>
  `;
}

// Elimina la animación
function quitarCarga() {
  const div = document.getElementById('analisisResultado');
  const anim = div.querySelector('.cargando');
  if (anim) anim.remove();
}

// Busca archivo por archivo
async function buscarProductoEnArchivos(nombre, marca, ean) {
  mostrarCarga();
  const resultadoDiv = document.getElementById('analisisResultado');

  const clave = normalizeYsingularizar(marca + " " + nombre);

  for (let i = 1; i <= MAX_ARCHIVOS; i++) {
    const url = `${RUTA_BASE}${PATRON_ARCHIVO(i)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const producto = await res.json();

      const claveProd = normalizeYsingularizar(producto.marca + " " + producto.nombre);
      const eanCoincide = producto.ean && producto.ean === ean;

      if (clave === claveProd || (ean && eanCoincide)) {
        quitarCarga();

        const ing = producto.ingredientes.map(i =>
          isTame(i) ? `<span style="color:red">${i}</span>` : `<span>${i}</span>`).join(', ');

        let html = `
          <p><strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})</p>
          ${producto.imagen && producto.imagen !== "imagen no disponible" ? 
            `<img src="${producto.imagen}" alt="Imagen del producto" style="max-width:200px; display:block; margin-bottom:10px;">` :
            `<p style="color:gray;">🖼️ Imagen no disponible</p>`}
          <p><strong>Ingredientes:</strong> ${ing}</p>
        `;

        if (producto.ingredientes_tame && producto.ingredientes_tame.length > 0) {
          html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
          html += `<ul style="color:red;">${producto.ingredientes_tame.map(obj =>
            `<li><b>${obj.ingrediente}</b>: ${obj.razon}</li>`).join("")}</ul></p>`;
        }

        html += `<p style="color:${producto.tahor ? 'green' : 'red'};">
          ${producto.tahor ? '✅ Apto (Tahor)' : '❌ No Apto (Tame)'}</p>`;

        resultadoDiv.innerHTML = html;
        return true;
      }
    } catch (err) {
      // Archivo inexistente o error de red, continúa con el siguiente
      continue;
    }
  }

  quitarCarga();
  return false; // No encontrado
}
