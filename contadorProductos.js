async function contarProductosRegistrados() {
  let total = 0;

  try {
    // Contar base principal
    const resBase = await fetch('base_tahor_tame.json');
    if (resBase.ok) {
      const baseGeneral = await resBase.json();
      if (Array.isArray(baseGeneral)) total += baseGeneral.length;
    } else {
      console.warn('⚠️ No se pudo cargar base_tahor_tame.json');
    }

    // Contar archivos en /base/
    const MAX_ARCHIVOS = 15;
    for (let i = 1; i <= MAX_ARCHIVOS; i++) {
      try {
        const res = await fetch(`base/producto${i}.json`);
        if (res.ok) {
          const producto = await res.json();
          if (producto?.nombre) total++;
        }
      } catch (e) {
        console.warn(`⚠️ base/producto${i}.json no cargó`);
      }
    }

    // Mostrar resultado
    const contador = document.getElementById('contadorProductos');
    if (contador) {
      contador.textContent = `📦 Productos registrados: ${total}`;
    }

  } catch (error) {
    console.error("❌ Error al contar productos:", error);
    const contador = document.getElementById('contadorProductos');
    if (contador) {
      contador.textContent = "❌ Error al contar productos.";
    }
  }
}

document.addEventListener('DOMContentLoaded', contarProductosRegistrados);
