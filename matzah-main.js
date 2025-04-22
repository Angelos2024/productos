(() => {
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

function isTameMatzah(i) {
  const normalizado = normalizeYsingularizar(i);
  return ingredientesTameMatzah.some(tame =>
    normalizado.includes(normalizeYsingularizar(tame))
  );
}

function isLeudante(i) {
  const normalizado = normalizeYsingularizar(i);
  return ingredientesLeudantes.some(l =>
    normalizado.includes(normalizeYsingularizar(l))
  );
}


const botonBusqueda = document.getElementById('botonBusquedaMatzah');
const botonBuscarRapido = document.getElementById('botonBuscarRapidoMatzah');
botonBuscarRapido?.addEventListener('click', () => {
  botonBusqueda.click();
});

const escanearCodigoBtn = document.getElementById('escanearCodigoMatzah');
const resultadoDiv = document.getElementById('resultadoMatzah');
const registroManualDiv = document.getElementById('registroManualMatzah');
const mensajeUsuario = document.getElementById('mensajeUsuarioMatzah');


let marcaGlobal = '';
let nombreGlobal = '';
let eanGlobal = '';

// --- Cámara y escaneo
if (escanearCodigoBtn) {
const codeReader = new ZXing.BrowserBarcodeReader(); // ← sin argumentos




escanearCodigoBtn.addEventListener('click', async () => {
  const selectCamara = document.getElementById('selectCamaraMatzah');

 
 // ✅ Paso 1: Pedir permisos antes
try {
  await navigator.mediaDevices.getUserMedia({ video: true });
} catch (err) {
  console.error("❌ Permiso denegado para la cámara:", err);
  resultadoDiv.innerHTML = '<p style="color:red;">❌ Debes permitir acceso a la cámara.</p>';
  return;
}

// ✅ Paso 2: Obtener cámaras ahora que hay permiso
let devices = [];
try {
  devices = await codeReader.getVideoInputDevices();
  selectCamara.innerHTML = '';
  devices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label || `Cámara ${index + 1}`;
    selectCamara.appendChild(option);
  });

  // Auto-seleccionar la primera si no hay selección previa
  if (!selectCamara.value && devices[0]) {
    selectCamara.value = devices[0].deviceId;
  }

} catch (err) {
  console.error('❌ No se pudo listar dispositivos de cámara:', err);
  selectCamara.innerHTML = '<option>No se pudo acceder a la cámara</option>';
  return;
}


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
const selectedDeviceId = selectCamara.value;

const constraints = {
  video: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

if (selectedDeviceId) {
  constraints.video.deviceId = { exact: selectedDeviceId };
}

const stream = await navigator.mediaDevices.getUserMedia(constraints);

    previewElem.srcObject = stream;
    await previewElem.play().catch(err => console.warn("⚠️ No se pudo reproducir cámara:", err));
    currentPreviewStream = stream;

    const result = await codeReader.decodeOnceFromStream(stream, previewElem);
    document.getElementById('eanEntradaMatzah').value = result.text;
    resultadoDiv.innerHTML = `<p><strong>✅ Código detectado:</strong> ${result.text}</p>`;
    scrollAResultados();

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
  const marca = document.getElementById('marcaEntradaMatzah').value.trim();
const nombre = document.getElementById('nombreEntradaMatzah').value.trim();
const ean = document.getElementById('eanEntradaMatzah')?.value.trim();
const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";


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
const htmlLocales = await buscarProductoEnArchivos(nombre, marca, ean, pais);

if (htmlLocales) {
  resultadosHTML.push(...htmlLocales.split('<hr>')); // separar productos individuales
}

// Si aún hay menos de 5 coincidencias, buscar en OpenFoodFacts
if (resultadosHTML.length < 5) {
  resultadoDiv.innerHTML = `
    <p><strong>🔍 Buscando coincidencias... (${resultadosHTML.length} encontradas hasta ahora)</strong></p>
    <p><strong>🌐🕵️‍♂️ Revisión avanzada (Nivel 2) en progreso...</strong></p>
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
      const proxyRes = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ accion: "proxyOpenFood", url })
});
  const respuestaEAN = await proxyRes.json(); // ✅ nuevo nombre

  if (respuestaEAN.product) productos.push(respuestaEAN.product);

      const data = await res.json();
      if (data.product) productos.push(data.product);
    } else {
const nombreBusqueda = encodeURIComponent(nombre);
const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombreBusqueda}&search_simple=1&action=process&json=1&page_size=5`;
     const proxyRes = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ accion: "proxyOpenFood", url })
});
const respuestaNombre = await proxyRes.json(); // ✅ nuevo nombre


     productos = respuestaNombre.products || [];

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

     const ingredientesTame = [];
const ingredientesLeud = [];

for (const ing of ingredientes) {
  const norm = normalizeYsingularizar(ing);
  if (ingredientesTameMatzah.includes(norm)) {
    ingredientesTame.push(ing);
  } else if (ingredientesLeudantes.includes(norm)) {
    ingredientesLeud.push(ing);
  }
}

const resultado = ingredientesTame.length > 0 ? 'Tame'
                : ingredientesLeud.length > 0 ? 'Leudado'
                : 'Tahor';

const htmlIng = ingredientes.map(ing => {
  if (isTameMatzah(ing)) return `<span style="color:red">${ing}</span>`;
  if (isLeudante(ing)) return `<span style="color:orange">${ing}</span>`;
  return `<span>${ing}</span>`;
}).join(', ');


      let html = `
        <details class="detalle-producto">
          <summary><strong>${prod.product_name}</strong> – ${prod.brands || "Marca desconocida"}</summary>
          ${prod.image_url ? `<img src="${prod.image_url}" alt="Imagen del producto" style="max-width:200px;">` : '<p style="color:gray;">🖼️ Imagen no disponible</p>'}
          <p><strong>Ingredientes:</strong> ${htmlIng}</p>
      `;

     if (ingredientesTame.length > 0) {
  html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
  html += `<ul style="color:red;">${ingredientesTame.map(i => `<li><b>${i}</b></li>`).join('')}</ul></p>`;
}
if (ingredientesLeud.length > 0) {
  html += `<p><strong style="color:orange;">Ingredientes leudantes detectados:</strong><br>`;
  html += `<ul style="color:orange;">${ingredientesLeud.map(i => `<li><b>${i}</b></li>`).join('')}</ul></p>`;
}


html += `<p style="color:${resultado === 'Tame' ? 'red' : resultado === 'Leudado' ? 'orange' : 'green'};">
  ${resultado === 'Tame' ? '❌ No Apto (Tame)'
  : resultado === 'Leudado' ? '⚠️ Contiene Leudante'
  : '✅ Apto (sin levadura)'}</p>
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
  // Detectar cuál div de resultados está visible (tahor o matzah)
  const resultadoTahor = document.getElementById('analisisResultado');
  const resultadoMatzah = document.getElementById('resultadoMatzah');

  const resultados = resultadoMatzah?.offsetParent !== null
    ? resultadoMatzah
    : resultadoTahor;

  if (!resultados) return;

  if (resultados.offsetHeight > 0 || intentos >= 5) {
    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  setTimeout(() => scrollAResultados(intentos + 1), 50);
}



document.getElementById('btnAbrirTahor')?.addEventListener('click', abrirTahor);

function volverAlMenu() {
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'none';
  document.getElementById('menuInicial').style.display = 'block';
  localStorage.removeItem('ultimaSeccionActiva');
}

// --- Registro manual Matzah
document.getElementById('formRegistroManualMatzah')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const marca = document.getElementById('marcaManualMatzah').value.trim();
  const nombre = document.getElementById('nombreManualMatzah').value.trim();
  const ean = document.getElementById('eanManualMatzah').value.trim();
  const pais = document.getElementById('paisManualMatzah').value.trim();
  const ingredientesTexto = document.getElementById('ingredientesManualMatzah').value.trim();
  const imagen = document.getElementById('imagenManualMatzah').value.trim();
  const estado = document.querySelector('input[name="estadoMatzah"]:checked')?.value;

  if (!marca || !nombre || !pais || !ingredientesTexto || !estado) {
    mensajeUsuario.innerHTML = `<p style="color:red;">⚠️ Por favor, completa todos los campos requeridos.</p>`;
    return;
  }

  const producto = {
    marca,
    nombre,
    ean,
    pais,
    imagen,
    ingredientes: ingredientesTexto.split(',').map(i => i.trim()).filter(i => i.length > 1),
    estado: estado === 'true',
    esMatzah: true
  };
 
  try {
    const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "registrar", producto })
    });

    if (!res.ok) throw new Error("Error al registrar el producto");

    mensajeUsuario.innerHTML = `<p style="color:green;">✅ Producto enviado para revisión.</p>`;
    document.getElementById("formRegistroManualMatzah").reset();
  } catch (err) {
    mensajeUsuario.innerHTML = `<p style="color:red;">❌ Error al registrar el producto. Intenta más tarde.</p>`;
    console.error("Error al registrar producto Matzah:", err);
  }
});

document.getElementById('formRegistroManualMatzah')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const marca = document.getElementById('marcaManualMatzah').value.trim();
  const nombre = document.getElementById('nombreManualMatzah').value.trim();
  const ean = document.getElementById('eanManualMatzah').value.trim();
  const pais = document.getElementById('paisManualMatzah').value.trim();
  const ingredientesTexto = document.getElementById('ingredientesManualMatzah').value.trim();
  const imagen = document.getElementById('imagenManualMatzah').value.trim();
  const estado = document.querySelector('input[name="estadoMatzah"]:checked')?.value;

  const btnEnviar = e.submitter || e.target.querySelector('button[type="submit"]');
  if (!marca || !nombre || !pais || !ingredientesTexto || !estado) {
    mensajeUsuario.innerHTML = `<p style="color:red;">⚠️ Por favor, completa todos los campos requeridos.</p>`;
    return;
  }

  const producto = {
    marca,
    nombre,
    ean,
    pais,
    imagen,
    ingredientes: ingredientesTexto.split(',').map(i => i.trim()).filter(i => i.length > 1),
    estado: estado === 'true',
    esMatzah: true
  };

  // Desactivar botón y mostrar mensaje
  mensajeUsuario.innerHTML = `<p style="color:gray;">⏳ Enviando producto para revisión. Esto puede tardar unos segundos...</p>`;
  btnEnviar.disabled = true;

  try {
    const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "registrar", producto })
    });

    if (!res.ok) throw new Error("Error al registrar el producto");

    mensajeUsuario.innerHTML = `<p style="color:green;">✅ Producto enviado correctamente. Gracias por tu aporte.</p>`;
    document.getElementById("formRegistroManualMatzah").reset();
  } catch (err) {
    mensajeUsuario.innerHTML = `<p style="color:red;">❌ Error al registrar el producto. Intenta nuevamente en unos segundos.</p>`;
    console.error("Error al registrar producto Matzah:", err);
  } finally {
    btnEnviar.disabled = false;
  }
});

  
 })();
