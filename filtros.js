// filtros.js

function filtrarPorCoincidencia(nombre, marca, pais, producto) {
  const normalizar = str =>
    typeof str === "string"
      ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
      : "";

  const nombreNorm = normalizar(nombre);
  const marcaNorm = normalizar(marca);
  const paisNorm = pais ? normalizar(pais) : null;

  const nombreProd = normalizar(producto.nombre);
  const marcaProd = normalizar(producto.marca);
  const paisProd = producto.pais ? normalizar(producto.pais) : null;

  const coincideNombre = nombreProd.includes(nombreNorm) || nombreNorm.includes(nombreProd);
  const coincideMarca = marcaProd.includes(marcaNorm) || marcaNorm.includes(marcaProd);
  const coincidePais = !paisNorm || paisNorm === paisProd;

  return coincideNombre && coincideMarca && coincidePais;
}


function renderizarResultadosMultiples(productos) {
  if (!productos.length) {
    return '<p style="color:red">❌ No se encontró información del producto.</p>';
  }

  return productos.map((prod, i) => {
    const ingredientes = prod.ingredientes || prod.ingredientes_text || "";
    const lista = typeof ingredientes === "string"
      ? ingredientes.toLowerCase().split(/,|\./).map(i => i.trim()).filter(i => i.length > 1)
      : ingredientes;

    const htmlIng = lista.map(ing => isTame(ing) ? `<span style="color:red">${ing}</span>` : `<span>${ing}</span>`).join(', ');
    const tame = lista.some(i => isTame(i));

    return `
    <div class="resultado-expandible">
      <button class="toggle" onclick="this.nextElementSibling.classList.toggle('visible')">➕ ${prod.product_name || prod.nombre} – ${prod.marca || 'Marca desconocida'}</button>
      <div class="contenido-expandible">
        ${prod.image_url || prod.imagen ? `<img src="${prod.image_url || prod.imagen}" alt="Imagen del producto">` : ''}
        <p><strong>Ingredientes:</strong> ${htmlIng}</p>
        <p style="color:${tame ? 'red' : 'green'};">
          ${tame ? '❌ No Apto (Tame)' : '✅ Apto (Tahor)'}</p>
      </div>
    </div>
    `;
  }).join('');
}

// Para usar esto en main.js o lectorBase.js:
// 1. Usa `filtrarPorCoincidencia(nombre, marca, pais, producto)` dentro del loop
// 2. Si hay varios, guarda los coincidencias y usa `renderizarResultadosMultiples(lista)` para mostrarlos
// 3. Añade CSS para .contenido-expandible.visible { display: block } y por defecto display: none
