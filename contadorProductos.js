document.addEventListener('DOMContentLoaded', async () => {
  const rutasArchivos = [
    'base_tahor_tame.json',
    ...Array.from({ length: 15 }, (_, i) => `base/producto${i + 1}.json`)
  ];

  let totalProductos = 0;

  for (const ruta of rutasArchivos) {
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta}`);
      const datos = await respuesta.json();
      totalProductos += Array.isArray(datos) ? datos.length : 1;
    } catch (error) {
      console.error(`Error al procesar ${ruta}:`, error);
    }
  }

  const contadorElement = document.getElementById('contadorProductos');
  if (contadorElement) {
    contadorElement.textContent = `Total de productos registrados: ${totalProductos}`;
  }
});
