let currentPreviewStream = null;


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

const botonBusqueda = document.getElementById('botonBusqueda');
const botonBuscarRapido = document.getElementById('botonBuscarRapido');
botonBuscarRapido?.addEventListener('click', () => {
  botonBusqueda.click();
});

const escanearCodigoBtn = document.getElementById('escanearCodigo');
const resultadoDiv = document.getElementById('analisisResultado');
const registroManualDiv = document.getElementById('registroManual');
const mensajeUsuario = document.getElementById('mensajeUsuario');

let marcaGlobal = '';
let nombreGlobal = '';
let eanGlobal = '';

// --- Cámara y escaneo
if (escanearCodigoBtn) {
const codeReader = new ZXing.BrowserBarcodeReader(); // ← sin argumentos


const selectCamara = document.getElementById('selectCamara');


escanearCodigoBtn.addEventListener('click', async () => {
  const selectCamara = document.getElementById('selectCamara');

  // 🔄 Obtener lista de cámaras en el momento del escaneo
  try {
    const devices = await codeReader.getVideoInputDevices();
    selectCamara.innerHTML = '';
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Cámara ${index + 1}`;
      selectCamara.appendChild(option);
    });
  } catch (err) {
    console.error('❌ No se pudo acceder a la cámara para listar dispositivos:', err);
    selectCamara.innerHTML = '<option>No se pudo acceder a la cámara</option>';
    return;
  }

  const selectedDeviceId = selectCamara.value;

  // 🛑 Detener cualquier stream previo
  if (currentPreviewStream) {
    currentPreviewStream.getTracks().forEach(track => track.stop());
    currentPreviewStream = null;
  }

  const previewElem = document.createElement('video');
  previewElem.setAttribute('style', 'width:100%; max-width:300px; margin-bottom:1rem;');
  resultadoDiv.innerHTML = `
    <p><strong>📷 Escaneando... permite acceso a la cámara</strong></p>
    <button id="cancelarEscaneo" style="float:right; background:#e74c3c; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer; font-weight:bold;">❌ Cancelar escaneo</button>
  `;
  resultadoDiv.appendChild(previewElem);

  document.getElementById('cancelarEscaneo').addEventListener('click', () => {
    if (currentPreviewStream) {
      currentPreviewStream.getTracks().forEach(track => track.stop());
      currentPreviewStream = null;
    }
    codeReader.reset();
    resultadoDiv.innerHTML = '<p style="color:gray;">⛔ Escaneo cancelado por el usuario.</p>';
  });

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    previewElem.srcObject = stream;
    await previewElem.play().catch(err => console.warn("⚠️ No se pudo reproducir cámara:", err));

    currentPreviewStream = stream;

    const result = await codeReader.decodeOnceFromStream(stream, previewElem);
    document.getElementById('eanEntrada').value = result.text;

    resultadoDiv.innerHTML = `<p><strong>✅ Código detectado:</strong> ${result.text}</p>`;
    scrollAResultados();

    // 🧠 Ejecutar búsqueda automáticamente
    botonBusqueda.click();

  } catch (err) {
    console.error('❌ Error escaneando:', err);
    resultadoDiv.innerHTML = '<p style="color:red;">❌ No se pudo leer el código. Intenta nuevamente.</p>';
  } finally {
    codeReader.reset();
    if (currentPreviewStream) {
      currentPreviewStream.getTracks().forEach(track => track.stop());
      currentPreviewStream = null;
    }
  }
});
 }

// --- Búsqueda principal
botonBusqueda.addEventListener('click', async () => {
  const marca = document.getElementById('marcaEntrada').value.trim();
  const nombre = document.getElementById('nombreEntrada').value.trim();
  const ean = document.getElementById('eanEntrada')?.value.trim();
  const pais = document.getElementById('paisFiltro')?.value.trim() || "";

  if (!ean && (!marca || !nombre)) {
    alert("⚠️ Completa al menos Marca y Nombre, o solo Código de Barras.");
    return;
  }


  marcaGlobal = marca;
  nombreGlobal = nombre;
  eanGlobal = ean;

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando en base local archivo por archivo...</strong></p>';
scrollAResultados(); // <- NUEVO: desplazar a resultados incluso si aún no cargan


const resultadosHTML = [];
//const htmlLocales = await buscarProductoEnArchivos(nombre, marca, ean, pais);
const htmlLocales = null;
if (htmlLocales) {
  resultadosHTML.push(...htmlLocales.split('<hr>')); // separar productos individuales
}

// Si aún hay menos de 5 coincidencias, buscar en OpenFoodFacts
if (resultadosHTML.length < 5) {
  resultadoDiv.innerHTML = `
    <p><strong>🔍 Buscando coincidencias... (${resultadosHTML.length} encontradas hasta ahora)</strong></p>
    <p><strong>🌐 Consultando OpenFoodFacts...</strong></p>
  `;

const resultadoOFF = await buscarEnOpenFoodFacts(nombre, marca, ean, pais);


  if (resultadoOFF) {
    resultadosHTML.push(...resultadoOFF); // resultadoOFF será un array de HTMLs
  }
}

// Si al final hay coincidencias, mostrarlas
if (resultadosHTML.length > 0) {
  resultadoDiv.innerHTML = `
    <p><strong>🔎 Resultados encontrados (${resultadosHTML.length}):</strong></p>
    ${resultadosHTML.slice(0, 5).join('<hr>')}
  `;
} else {
  // Si no se encontró nada en ningún lado
  resultadoDiv.innerHTML = `
    <p style="color:red;">❌ Producto no encontrado.</p>
    <p>¿Nos ayudas a registrarlo? 🙌</p>
    <button onclick="mostrarFormularioRegistro()">📝 Registrar manualmente</button>
  `;
}
setTimeout(() => {
  scrollAResultados();
}, 150); // 150 ms da tiempo a que el DOM se actualice


});

function abrirTahor() {
  document.getElementById('menuInicial').style.display = 'none';
  document.getElementById('bloqueTahor').style.display = 'block';
document.getElementById('botonVolverMenu').style.display = 'block';
document.title = "Escáner de Productos Tame / Tahor";
document.getElementById("tituloPrincipal").textContent = "Escáner de Productos Tame / Tahor";

  // Mostrar solo la pestaña de búsqueda al iniciar
  document.getElementById('formBusquedaProducto').style.display = 'block';
  document.getElementById('analisisResultado').style.display = 'block';
  document.getElementById('registroManual').style.display = 'none';
  document.getElementById('buzonRevisiones').style.display = 'none';
  activarTab('tabBuscar');

  resultadoDiv.innerHTML = '';
  mensajeUsuario.innerHTML = '';
}


document.getElementById('tabRegistrar').addEventListener('click', () => {
  document.getElementById('formBusquedaProducto').style.display = 'none';
  document.getElementById('analisisResultado').style.display = 'none';
  document.getElementById('registroManual').style.display = 'block';
  activarTab('tabRegistrar');
});

function activarTab(idActiva) {
  ['tabBuscar', 'tabRegistrar', 'tabBuzon'].forEach(id => {
    const tab = document.getElementById(id);
    if (tab) tab.classList.remove('tab-activa');
  });
  document.getElementById(idActiva)?.classList.add('tab-activa');
}
function mostrarFormularioRegistro() {
  document.getElementById('formBusquedaProducto').style.display = 'none';
  document.getElementById('analisisResultado').style.display = 'none';
  document.getElementById('registroManual').style.display = 'block';
  activarTab('tabRegistrar');
  mensajeUsuario.innerHTML = '';
}

// Añadir pestaña de revisión solo si no existe
function mostrarBuzonAdmin() {
  if (!document.getElementById('tabBuzon')) {
    const nuevaTab = document.createElement('button');
    nuevaTab.id = 'tabBuzon';
    nuevaTab.innerText = '📬 Buzón de revisiones';
    nuevaTab.addEventListener('click', () => {
      document.getElementById('formBusquedaProducto').style.display = 'none';
      document.getElementById('analisisResultado').style.display = 'none';
      document.getElementById('registroManual').style.display = 'none';
      document.getElementById('buzonRevisiones').style.display = 'block';
      activarTab('tabBuzon');
      cargarPendientes();
    });

    document.getElementById('tabs').firstElementChild.appendChild(nuevaTab);
  }
}

let productosPendientes = [];

async function cargarPendientes() {
  const contenedor = document.getElementById('listaPendientes');
  contenedor.innerHTML = "<p>Cargando...</p>";

  try {
    const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "listar" })
    });

    if (!res.ok) throw new Error("Error al listar productos");

    const productos = await res.json();
    productosPendientes = productos;

    if (!productos.length) {
      contenedor.innerHTML = "<p>🎉 No hay productos pendientes.</p>";
      return;
    }

    contenedor.innerHTML = '';
    productos.forEach((producto, index) => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta-pendiente';
      tarjeta.innerHTML = `
        <strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})<br>
        <small>Ingredientes:</small><br>
        <span>${producto.ingredientes.join(', ')}</span><br><br>
        <button onclick="aprobarProducto(${index})">✔️ Aprobar</button>
        <button onclick="rechazarProducto(${index})" style="background-color:#e74c3c">❌ Rechazar</button>
      `;
      contenedor.appendChild(tarjeta);
    });

  } catch (err) {
    contenedor.innerHTML = "<p style='color:red;'>❌ Error al cargar pendientes.</p>";
    console.error(err);
  }
}

async function aprobarProducto(index) {
  const producto = productosPendientes[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar', producto })
    });

    if (!res.ok) throw new Error('Error al aprobar producto');
    cargarPendientes();
  } catch (err) {
    console.error('❌ Error al aprobar producto:', err);
  }
}

async function rechazarProducto(index) {
  const producto = productosPendientes[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'rechazar', producto })
    });

    if (!res.ok) throw new Error('Error al rechazar producto');
    cargarPendientes();
  } catch (err) {
    console.error('❌ Error al rechazar producto:', err);
  }
}


async function buscarEnOpenFoodFacts(nombre, marca, ean, pais = "") {
console.log("🌐 Consultando OpenFoodFacts con:", { nombre, marca, ean, pais });

  try {
    let resultados = [];
    let productos = [];

    if (ean && /^[0-9]{8,14}$/.test(ean)) {
      const url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.product) productos.push(data.product);
    } else {
const nombreBusqueda = encodeURIComponent(nombre);
const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombreBusqueda}&search_simple=1&action=process&json=1&page_size=5`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      productos = data.products || [];
      // 🔎 Filtrado por coincidencia parcial en nombre + marca
const claveNombre = normalizeYsingularizar(nombre);
const claveMarca = normalizeYsingularizar(marca);

productos = productos.filter(p => {
  const nombreProd = normalizeYsingularizar(p.product_name || '');
  const marcaProd = normalizeYsingularizar(p.brands || '');

  const nombreCoincide = nombreProd.includes(claveNombre);
  const marcaCoincide = !claveMarca || marcaProd.includes(claveMarca);

  return nombreCoincide || marcaCoincide;
});



    }

    // Filtrar por país si se indica
if (pais) {
  const productosFiltrados = productos.filter(p => {
    const tags = (p.countries_tags || []).map(c => c.replace('en:', '').toLowerCase());
    const texto = (p.countries || "").toLowerCase();
    return tags.includes(pais.toLowerCase()) || texto.includes(pais.toLowerCase());
  });

  // Solo si hay productos filtrados por país, usamos ese filtro
  if (productosFiltrados.length > 0) {
    productos = productosFiltrados;
  }
}

    for (const prod of productos) {
    if (!prod.product_name || (!prod.ingredients_text && !prod.ingredients)) continue;


      const ingredientes = prod.ingredients_text.toLowerCase()
        .split(/,|\./)
        .map(i => i.trim())
        .filter(i => i.length > 1);

      const htmlIng = ingredientes.map(ing =>
        isTame(ing) ? `<span style="color:red">${ing}</span>` : `<span>${ing}</span>`
      ).join(', ');

      const ingredientesTame = ingredientes.filter(isTame);
      const tame = ingredientesTame.length > 0;

      let html = `
        <details class="detalle-producto">
          <summary><strong>${prod.product_name}</strong> – ${prod.brands || "Marca desconocida"}</summary>
          ${prod.image_url ? `<img src="${prod.image_url}" alt="Imagen del producto" style="max-width:200px;">` : '<p style="color:gray;">🖼️ Imagen no disponible</p>'}
          <p><strong>Ingredientes:</strong> ${htmlIng}</p>
      `;

      if (tame) {
        html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
        html += `<ul style="color:red;">${ingredientesTame.map(i => `<li><b>${i}</b></li>`).join('')}</ul></p>`;
      }

      html += `<p style="color:${tame ? 'red' : 'green'};">
        ${tame ? '❌ No Apto (Tame)' : '✅ Apto (Tahor)'}</p>
        </details>
      `;

      resultados.push(html);
      if (resultados.length >= 5) break;
    }

    return resultados.length > 0 ? resultados : null;

  } catch (e) {
    console.error("❌ Error al consultar OpenFoodFacts:", e);
    return null;
  }
}
function scrollAResultados(intentos = 0) {
  const resultados = document.getElementById('analisisResultado');
  if (!resultados) return;

  // Si ya hay contenido y altura suficiente
  if (resultados.offsetHeight > 0 || intentos >= 5) {
    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // Si aún no tiene altura visible, espera y vuelve a intentar
setTimeout(() => scrollAResultados(intentos + 1), 50);

}



document.getElementById('btnAbrirTahor')?.addEventListener('click', abrirTahor);
document.addEventListener("DOMContentLoaded", () => {
  const btnVolver = document.getElementById('botonVolverMenu');
  if (btnVolver) {
    btnVolver.addEventListener('click', volverAlMenu);
  }
});


function volverAlMenu() {
  document.title = "Escáner de Productos Lev 11";
document.getElementById("tituloPrincipal").textContent = "Escáner de Productos Lev 11";
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'none';
  document.getElementById('menuInicial').style.display = 'block';
  document.getElementById('botonVolverMenu').style.display = 'none';
  localStorage.removeItem('ultimaSeccionActiva');
}
