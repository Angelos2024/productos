async function contarProductosRegistrados() {
  let total = 0;

  try {
    // Leer base principal
    const resBase = await fetch('base_tahor_tame.json');
    const baseGeneral = await resBase.json();
    total += baseGeneral.length || 0;

    // Leer archivos individuales en /base/
    const MAX_ARCHIVOS = 50; // Ajusta según tu número real de archivos
    for (let i = 1; i <= MAX_ARCHIVOS; i++) {
      try {
        const res = await fetch(`base/producto${i}.json`);
        if (!res.ok) continue;
        const producto = await res.json();
        if (producto && producto.nombre) total++;
      } catch (err) {
        // Ignorar archivos inexistentes
      }
    }

    // Mostrar el total en la interfaz
    const contadorUI = document.getElementById('contadorProductos');
    if (contadorUI) {
      contadorUI.textContent = `📦 Productos registrados: ${total}`;
    }
  } catch (err) {
    console.error("❌ Error al contar productos:", err);
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', contarProductosRegistrados);
