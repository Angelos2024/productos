async function contarProductosRegistrados() {
  let total = 0;

  try {
    // Cargar base principal
    const resBase = await fetch('base_tahor_tame.json');
    if (resBase.ok) {
      const basePrincipal = await resBase.json();
      total += Array.isArray(basePrincipal) ? basePrincipal.length : 0;
    }

    // Cargar archivos individuales de la carpeta /base/
    const MAX_ARCHIVOS = 15;
    for (let i = 1; i <= MAX_ARCHIVOS; i++) {
      try {
        const res = await fetch(`base/producto${i}.json`);
        if (res.ok) {
          const producto = await res.json();
          if (producto && producto.nombre) total++;
        }
      } catch (errInterno) {
        console.warn(`Archivo base/producto${i}.json no encontrado o con error.`);
      }
    }

    // Mostrar total
    const contadorUI = document.getElementById('contadorProductos');
    if (contadorUI) {
      contadorUI.textContent = `📦 Productos registrados: ${total}`;
    }

  } catch (err) {
    console.error("❌ Error general al contar productos:", err);
  }
}

// Ejecutar al cargar DOM
document.addEventListener('DOMContentLoaded', contarProductosRegistrados);
