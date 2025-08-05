// Desactivar nombre/marca si hay código de barras en Matzah
let productosMatzahTemporales = [];

const eanEntradaMatzah = document.getElementById('eanEntradaMatzah');
const nombreEntradaMatzah = document.getElementById('nombreEntradaMatzah');
const marcaEntradaMatzah = document.getElementById('marcaEntradaMatzah');

eanEntradaMatzah?.addEventListener('input', () => {
  const tieneCodigo = eanEntradaMatzah.value.trim() !== "";
nombreEntradaMatzah.readOnly = tieneCodigo;
marcaEntradaMatzah.readOnly = tieneCodigo;

});

function mostrarNotaBusquedaMatzah(mensaje) {
  const nota = document.getElementById('notaBusquedaMatzah');
  if (!nota) return;

  nota.textContent = mensaje;
  nota.style.display = 'block';

  void nota.offsetWidth;
  nota.style.opacity = '1';

  clearTimeout(nota._timeout);
  nota._timeout = setTimeout(() => {
    nota.style.opacity = '0';
    setTimeout(() => {
      nota.style.display = 'none';
    }, 500);
  }, 4000);
}

function protegerCampoBloqueadoMatzah(input, mensajeFuncion) {
  input.addEventListener('mousedown', (e) => {
    if (input.readOnly) {
      mensajeFuncion("⚠️ Solo puedes buscar por nombre/marca o por código. Borra uno para activar el otro.");
      e.preventDefault();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (input.readOnly) {
      mensajeFuncion("⚠️ Solo puedes buscar por nombre/marca o por código. Borra uno para activar el otro.");
      e.preventDefault();
    }
  });

  input.addEventListener('focus', (e) => {
    if (input.readOnly) {
      mensajeFuncion("⚠️ Solo puedes buscar por nombre/marca o por código. Borra uno para activar el otro.");
      input.blur();
    }
  });
}


// Matzah
protegerCampoBloqueado(nombreEntradaMatzah, mostrarNotaBusquedaMatzah);
protegerCampoBloqueado(marcaEntradaMatzah, mostrarNotaBusquedaMatzah);


marcaEntradaMatzah.addEventListener('click', (e) => {
  if (marcaEntradaMatzah.disabled) {
    mostrarNotaBusquedaMatzah("⚠️ Solo puedes buscar por nombre/marca o por código. Borra uno para activar el otro.");
    e.preventDefault();
  }
});


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






// --- Analizar una lista de ingredientes en Matzah ---
function analizarIngredientesMatzah(ingredientes) {
  let tameDetectado = false;
  let leudanteDetectado = false;

  for (const ing of ingredientes) {
    const normalizado = normalizeYsingularizar(ing);

    if (isTameMatzah(normalizado)) tameDetectado = true;
    if (isLeudante(normalizado)) leudanteDetectado = true;

    if (tameDetectado && leudanteDetectado) break; // 🚀 Salir si ambos detectados
  }

  return { tameDetectado, leudanteDetectado };
}

productosMatzahTemporales = []; // limpia resultados anteriores

// --- Elementos DOM para Matzah ---
const botonBusquedaMatzah = document.getElementById('botonBusquedaMatzah');


const botonBuscarRapidoMatzah = document.getElementById('botonBuscarRapidoMatzah');
botonBuscarRapidoMatzah?.addEventListener('click', () => {
  const ean = document.getElementById('eanEntradaMatzah').value.trim();
  if (!ean) {
    alert("⚠️ Introduce un código de barras.");
    return;
  }
  buscarSoloPorEanMatzah(ean);
});


const escanearCodigoMatzah = document.getElementById('escanearCodigoMatzah');
const resultadoMatzah = document.getElementById('resultadoMatzah');
const registroManualMatzah = document.getElementById('registroManualMatzah');
const mensajeUsuarioMatzah = document.getElementById('mensajeUsuarioMatzah');

let marcaGlobalMatzah = '';
let nombreGlobalMatzah = '';
let eanGlobalMatzah = '';

// --- Cámara y escaneo para Matzah ---
let codeReaderMatzah = new ZXing.BrowserMultiFormatReader();

if (escanearCodigoMatzah) {
  const selectCamaraMatzah = document.getElementById('selectCamaraMatzah');

escanearCodigoMatzah.addEventListener('click', async () => {
  try {
    await navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
}).then(stream => {
  videoElement.srcObject = stream;
  videoElement.play();
}).catch(err => {
  console.error("Error al acceder a la cámara: ", err);
});
  } catch (err) {
    console.error("❌ Permiso denegado para la cámara:", err);
    selectCamaraMatzah.innerHTML = '<option>❌ Permiso de cámara denegado</option>';
    return;
  }

  let devices = [];
  try {
    devices = await codeReaderMatzah.getVideoInputDevices();
    const camaraAnterior = selectCamaraMatzah.value;

    selectCamaraMatzah.innerHTML = '';
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Cámara ${index + 1}`;
      selectCamaraMatzah.appendChild(option);
    });

    if (devices.some(d => d.deviceId === camaraAnterior)) {
      selectCamaraMatzah.value = camaraAnterior;
    } else if (devices.length > 0) {
      selectCamaraMatzah.value = devices[0].deviceId;
    }
  } catch (err) {
    console.error('❌ No se pudo listar cámaras:', err);
    selectCamaraMatzah.innerHTML = '<option>No se pudo acceder a la cámara</option>';
    return;
  }

  const selectedDeviceId = selectCamaraMatzah.value;

  if (currentPreviewStream) {
    currentPreviewStream.getTracks().forEach(track => track.stop());
    currentPreviewStream = null;
  }

  // NUEVO DISEÑO DE ESCANEO
  const previewElem = document.createElement('video');
  previewElem.setAttribute('id', 'previewElemMatzah');
  previewElem.setAttribute('style', `
    width: 100%;
    max-width: 480px;
    height: 260px;
    object-fit: cover;
    margin: 0 auto;
    display: block;
    border: 3px solid white;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    position: relative;
  `);

  const overlay = document.createElement('div');
  overlay.setAttribute('style', `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 260px;
    box-sizing: border-box;
    pointer-events: none;
    z-index: 10;
  `);
  overlay.innerHTML = `
    <div style="
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 2px;
      background: white;
      opacity: 0.9;
      transform: translateY(-50%);
    "></div>
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px dashed white;
      border-radius: 12px;
      box-sizing: border-box;
    "></div>
  `;

  const contenedorEscaneo = document.createElement('div');
  contenedorEscaneo.id = 'contenedorEscaneoMatzah';
  contenedorEscaneo.style.position = 'relative';
  contenedorEscaneo.style.margin = '8rem auto 8rem';
  contenedorEscaneo.style.maxWidth = '460px';
  contenedorEscaneo.appendChild(previewElem);
  contenedorEscaneo.appendChild(overlay);

  resultadoMatzah.innerHTML = `
    <p><strong>📷 Escaneando... permite acceso a la cámara</strong></p>
    <button id="cancelarEscaneo" style="float:right; background:#e74c3c; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer; font-weight:bold;">❌ Cancelar escaneo</button>
  `;
  resultadoMatzah.appendChild(contenedorEscaneo);

  scrollAResultadosMatzah();

  document.getElementById('cancelarEscaneo').addEventListener('click', () => {
    if (currentPreviewStream) {
      currentPreviewStream.getTracks().forEach(track => track.stop());
      currentPreviewStream = null;
    }
    codeReaderMatzah.reset();
    codeReaderMatzah = new ZXing.BrowserMultiFormatReader();
    resultadoMatzah.innerHTML = '<p style="color:gray;">⛔ Escaneo cancelado por el usuario.</p>';
  });

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    previewElem.srcObject = stream;
    await previewElem.play().catch(err => console.warn("⚠️ No se pudo reproducir cámara:", err));
    currentPreviewStream = stream;

    codeReaderMatzah.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, err) => {
      if (result) {
document.getElementById('eanEntradaMatzah').value = result.text;
buscarSoloPorEanMatzah(result.text);
document.getElementById('eanEntradaMatzah').value = ''; // 🧹 Limpia tras escaneo


        codeReaderMatzah.reset();
        if (currentPreviewStream) {
          currentPreviewStream.getTracks().forEach(track => track.stop());
          currentPreviewStream = null;
        }
      }
    });

  } catch (err) {
    console.error('❌ Error escaneando:', err);
    resultadoMatzah.innerHTML = '<p style="color:red;">❌ No se pudo leer el código. Intenta nuevamente.</p>';
  }
});

}


// --- Búsqueda principal para Matzah ---
botonBusquedaMatzah.addEventListener('click', async () => {
  const marca = document.getElementById('marcaEntradaMatzah').value.trim();
  const nombre = document.getElementById('nombreEntradaMatzah').value.trim();
  const ean = document.getElementById('eanEntradaMatzah').value.trim();
  
  const bloqueMatzahVisible = document.getElementById('bloqueMatzah').style.display === 'block';
  const encabezado = document.getElementById('encabezado');

  if (encabezado) {
    if (bloqueMatzahVisible) {
      encabezado.classList.remove('tahor');
      encabezado.classList.add('pesaj');
    } else {
      encabezado.classList.remove('pesaj');
      encabezado.classList.add('tahor');
    }
  }

  // 🔵 Ajuste de color de botones
  const botonRegistrar = document.getElementById('tabRegistrar');
  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');

  if (bloqueMatzahVisible) {
    if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#895510';
    if (botonRegistrar) botonRegistrar.style.backgroundColor = '#3498db';
  } else {
    if (botonRegistrar) botonRegistrar.style.backgroundColor = '#00695c';
    if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#3498db';
  }

  // 🔵 Flujo normal de búsqueda
const paisInputs = document.querySelectorAll('.paisFiltroMatzah');
let pais = '';
paisInputs.forEach(sel => {
  const valor = sel.value.trim();
  if (valor) pais = valor; // tomar el primero que tenga valor
});


if (!ean && (!marca || !nombre)) {
  return; // sin alertar, lo gestiona el botón específico
}


if (ean && /^[0-9]{8,14}$/.test(ean)) {
  buscarSoloPorEanMatzah(ean);
  document.getElementById('eanEntradaMatzah').value = ''; // 🧹 Limpia campo manual
  return;
}


  marcaGlobalMatzah = marca;
  nombreGlobalMatzah = nombre;
  eanGlobalMatzah = ean;

  resultadoMatzah.innerHTML = '<p><strong>🔍 Buscando en base local archivo por archivo...</strong></p>';
  scrollAResultadosMatzah();
productosMatzahTemporales = []; // 🧹 Limpia resultados anteriores

  const resultadosHTML = [];
const htmlLocales = await buscarProductoEnArchivos(nombre, marca, ean, pais);
if (htmlLocales) {
  const partes = htmlLocales.split('<hr>');

  for (const htmlProducto of partes) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlProducto, 'text/html');
    const nombreProducto = doc.querySelector('strong')?.textContent || "";
    const ingredientesTexto = doc.querySelector('p')?.textContent || "";
    const ingredientes = ingredientesTexto.split(',').map(i => i.trim());

    const { tameDetectado, leudanteDetectado } = analizarIngredientesMatzah(ingredientes);

    const filtroTame = document.getElementById('filtroTame')?.checked;
const filtroLeudado = document.getElementById('filtroLeudado')?.checked;
const filtroDudoso = document.getElementById('filtroDudoso')?.checked;

if (!filtroTame && !filtroLeudado && !filtroDudoso) {
  resultadoMatzah.innerHTML = `<p style="color:red;">⚠️ Debes activar al menos un filtro para hacer la búsqueda.</p>`;
  return;
}

const htmlIngredientes = ingredientes.map(ing => {
  const normalizado = normalizeYsingularizar(ing);
  const esTame = isTameMatzah(normalizado);
  const esLeudante = isLeudante(normalizado);

  if (esTame && filtroTame) {
    return `<span style="color:red; font-weight:bold;">${ing}</span>`;
  } else if (esLeudante && filtroLeudado) {
    return `<span style="color:orange; font-weight:bold;">${ing}</span>`;
  } else if (!esTame && !esLeudante && filtroDudoso) {
    return `<span style="color:gray;">${ing}</span>`;
  } else {
    return ``; // Oculta ingredientes no deseados
  }
}).filter(Boolean).join(", ");


    let colorEstado = 'green';
    let textoEstado = '✅ Apto (Tahor)';
    if (tameDetectado) {
      colorEstado = 'red';
      textoEstado = '❌ No Apto (Tame)';
    } else if (leudanteDetectado) {
      colorEstado = 'orange';
      textoEstado = '⚠️ Contiene Leudante';
    }

    const productoObj = {
  nombre: nombreProducto,
  imagenHTML: doc.querySelector('img')?.outerHTML || '<p style="color:gray;">🖼️ Imagen no disponible</p>',
  ingredientesRaw: ingredientes
};
productosMatzahTemporales.push(productoObj);

  }
}


  if (resultadosHTML.length < 3) {
    resultadoMatzah.innerHTML = `
      <div style="text-align:center">
        <div class="spinner"></div>
        <p><strong>🔍 Buscando coincidencias locales...</strong></p>
        <p><strong>🌐 Consultando en más de 3,783,408 productos...</strong></p>
      </div>
    `;
    const resultadoOFF = await buscarEnOpenFoodFacts(nombre, marca, ean, pais);
if (resultadoOFF) {
  resultadoOFF.forEach(htmlProducto => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlProducto, 'text/html');
    const nombreProducto = doc.querySelector('strong')?.textContent || "";
    const ingredientesTexto = doc.querySelector('p')?.textContent || "";
    const ingredientes = ingredientesTexto.split(',').map(i => i.trim());

    productosMatzahTemporales.push({
      nombre: nombreProducto,
      imagenHTML: doc.querySelector('img')?.outerHTML || '<p style="color:gray;">🖼️ Imagen no disponible</p>',
      ingredientesRaw: ingredientes
    });
  });
}

  }

if (productosMatzahTemporales.length > 0) {
  renderizarResultadosMatzah();
} else {
  resultadoMatzah.innerHTML = `
    <p style="color:red;">❌ Producto no encontrado.</p>
    <p>¿Nos ayudas a registrarlo? 🙌</p>
    <button onclick="mostrarFormularioRegistroMatzah()">📝 Registrar manualmente</button>
  `;
}




  setTimeout(() => {
    scrollAResultadosMatzah();
  }, 250);
});
function abrirMatzah() {
    cerrarMenu(); // 👈 Cierra el menú apenas cambias a Matzah
  document.getElementById('bloqueMatzah').style.display = 'block';
  document.getElementById('bloqueTahor').style.display = 'none';
  


  const titulo = document.getElementById('titulo');
  const tituloPrincipal = document.getElementById('tituloPrincipal');
  if (titulo) titulo.textContent = "🥖 Escáner de Productos para Pesaj (Matzah)";
  if (tituloPrincipal) tituloPrincipal.textContent = "Escáner de Productos para Pesaj (Matzah)";

  document.title = "Escáner de Productos Pesaj";

  const encabezado = document.getElementById('encabezado');
  if (encabezado) {
    encabezado.classList.remove('tahor');
    encabezado.classList.add('pesaj');
  }

  const botonesFlotantes = document.querySelectorAll('#tabRegistrarMatzah, #tabBuscarMatzah');
  botonesFlotantes.forEach(boton => {
    if (boton) {
      boton.style.backgroundColor = '#895510';
    }
  });

  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  if (botonRegistrarMatzah) botonRegistrarMatzah.style.display = 'block';
}

// --- Cambio de pestañas en Matzah ---
document.getElementById('tabRegistrarMatzah')?.addEventListener('click', () => {
  document.getElementById('formBusquedaMatzah').style.display = 'none';
  document.getElementById('resultadoMatzah').style.display = 'none';
  document.getElementById('registroManualMatzah').style.display = 'block';
  activarTabMatzah('tabRegistrarMatzah');

  // 🔽 Scroll suave a la sección de registro
  const registroMatzah = document.getElementById('registroManualMatzah');
  if (registroMatzah) {
    setTimeout(() => {
      registroMatzah.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }

  const boton = document.getElementById('tabRegistrarMatzah');
  if (boton) boton.style.display = 'none';
});


function activarTabMatzah(idActiva) {
  ['tabBuscarMatzah', 'tabRegistrarMatzah'].forEach(id => {
    const tab = document.getElementById(id);
    if (tab) tab.classList.remove('tab-activa');
  });
  document.getElementById(idActiva)?.classList.add('tab-activa');
}

function mostrarFormularioRegistroMatzah() {
  document.getElementById('formBusquedaMatzah').style.display = 'none';
  document.getElementById('resultadoMatzah').style.display = 'none';
  document.getElementById('registroManualMatzah').style.display = 'block';
  activarTabMatzah('tabRegistrarMatzah');

  mensajeUsuarioMatzah.innerHTML = '';

  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  if (botonRegistrarMatzah) botonRegistrarMatzah.style.display = 'none';
}

// Añadir pestaña de revisión solo si no existe (modo Matzah)
function mostrarBuzonAdminMatzah() {
  if (!document.getElementById('tabBuzonMatzah')) {
    const nuevaTab = document.createElement('button');
    nuevaTab.id = 'tabBuzonMatzah';
    nuevaTab.innerText = '📬 Buzón de revisiones (Pesaj)';

    nuevaTab.style.position = 'fixed';
    nuevaTab.style.bottom = '5rem';
    nuevaTab.style.right = '1rem';
    nuevaTab.style.backgroundColor = '#895510'; // Marrón Pesaj
    nuevaTab.style.color = 'white';
    nuevaTab.style.border = 'none';
    nuevaTab.style.borderRadius = '12px';
    nuevaTab.style.padding = '0.5rem 1rem';
    nuevaTab.style.zIndex = '9999';
    nuevaTab.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    nuevaTab.style.cursor = 'pointer';

    nuevaTab.addEventListener('click', () => {
      document.getElementById('formBusquedaMatzah').style.display = 'none';
      document.getElementById('resultadoMatzah').style.display = 'none';
      document.getElementById('registroManualMatzah').style.display = 'none';
      document.getElementById('adminPanelMatzah').style.display = 'none';
      document.getElementById('buzonRevisionesMatzah').style.display = 'block';

      activarTabMatzah('tabBuzonMatzah');
      cargarPendientesMatzah();

      mostrarBotonVolverInicioMatzah();
    });

    document.body.appendChild(nuevaTab);
  }
}

function mostrarBotonVolverInicioMatzah() {
  if (!document.getElementById('botonVolverInicioMatzah')) {
    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolverInicioMatzah';
    botonVolver.innerText = '⬅️ Volver a inicio Pesaj';

    botonVolver.style.position = 'fixed';
    botonVolver.style.bottom = '9rem';
    botonVolver.style.right = '1rem';
    botonVolver.style.backgroundColor = '#e67e22'; // Naranja
    botonVolver.style.color = 'white';
    botonVolver.style.border = 'none';
    botonVolver.style.borderRadius = '12px';
    botonVolver.style.padding = '0.5rem 1rem';
    botonVolver.style.zIndex = '9999';
    botonVolver.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    botonVolver.style.cursor = 'pointer';

    botonVolver.addEventListener('click', () => {
      document.getElementById('buzonRevisionesMatzah').style.display = 'none';
      document.getElementById('adminPanelMatzah').style.display = 'none';

      document.getElementById('formBusquedaMatzah').style.display = 'block';
      document.getElementById('resultadoMatzah').style.display = 'block';

      const titulo = document.getElementById('titulo');
      const tituloPrincipal = document.getElementById('tituloPrincipal');
      if (titulo) titulo.textContent = "🥖 Escáner de Productos para Pesaj (Matzah)";
      if (tituloPrincipal) tituloPrincipal.textContent = "Escáner de Productos para Pesaj (Matzah)";
      document.title = "Escáner de Productos Pesaj";

      activarTabMatzah('tabBuscarMatzah');

      botonVolver.remove();
    });

    document.body.appendChild(botonVolver);
  }
}

let productosPendientesMatzah = [];

async function cargarPendientesMatzah() {
  const contenedor = document.getElementById('listaPendientesMatzah');
  contenedor.innerHTML = "<p>Cargando...</p>";

  try {
    const res = await fetch("https://productos-amber.vercel.app/api/verificador-api-matzah.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "listar" })
    });

    if (!res.ok) throw new Error("Error al listar productos (Pesaj)");

    const productos = await res.json();
    productosPendientesMatzah = productos;

    if (!productos.length) {
      contenedor.innerHTML = "<p>🎉 No hay productos pendientes para Pesaj.</p>";
      return;
    }

    contenedor.innerHTML = '';
    productos.forEach((producto, index) => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta-pendiente';
      tarjeta.innerHTML = `
        <strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})<br>
        <small>Ingredientes:</small><br>
      <span>${
  producto.ingredientes.map(ing => {
    const normalizado = normalizeYsingularizar(ing);
    if (isTameMatzah(normalizado)) {
      return `<span style="color:red; font-weight:bold;">${ing}</span>`;
    } else if (isLeudante(normalizado)) {
      return `<span style="color:orange; font-weight:bold;">${ing}</span>`;
    } else {
      return `<span>${ing}</span>`;
    }
  }).join(", ")
}</span><br><br>

        <button onclick="aprobarProductoMatzah(${index})">✔️ Aprobar</button>
        <button onclick="rechazarProductoMatzah(${index})" style="background-color:#e74c3c">❌ Rechazar</button>
      `;
      contenedor.appendChild(tarjeta);
    });

  } catch (err) {
    contenedor.innerHTML = "<p style='color:red;'>❌ Error al cargar pendientes de Pesaj.</p>";
    console.error(err);
  }
}

async function aprobarProductoMatzah(index) {
  const producto = productosPendientesMatzah[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api-matzah.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar', producto })
    });

    if (!res.ok) throw new Error('Error al aprobar producto Pesaj');
    cargarPendientesMatzah();
  } catch (err) {
    console.error('❌ Error al aprobar producto Pesaj:', err);
  }
}

async function rechazarProductoMatzah(index) {
  const producto = productosPendientesMatzah[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api-matzah.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'rechazar', producto })
    });

    if (!res.ok) throw new Error('Error al rechazar producto Pesaj');
    cargarPendientesMatzah();
  } catch (err) {
    console.error('❌ Error al rechazar producto Pesaj:', err);
  }
}

async function buscarEnOpenFoodFactsMatzah(nombre, marca, ean, pais = "") {
  console.log("🌐 Consultando para Pesaj con:", { nombre, marca, ean, pais });

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

    // 🔵 Filtro adicional por país
    if (pais) {
      const productosFiltrados = productos.filter(p => {
        const tags = (p.countries_tags || []).map(c => c.replace('en:', '').toLowerCase());
        const texto = (p.countries || "").toLowerCase();
        return tags.includes(pais.toLowerCase()) || texto.includes(pais.toLowerCase());
      });

      if (productosFiltrados.length > 0) {
        productos = productosFiltrados;
      }
    }

    // 🔥 Procesar productos encontrados
    for (const prod of productos) {
  if (!prod.product_name || (!prod.ingredients_text && !prod.ingredients)) continue;

  const nombreProducto = prod.product_name || "Producto sin nombre";
  const marcaProducto = prod.brands || "Marca desconocida";
  const imagenProducto = prod.image_url || "";

  const ingredientes = (prod.ingredients_text || "")
    .toLowerCase()
    .split(/,|\./)
    .map(i => i.trim())
    .filter(i => i.length > 1);

  const { tameDetectado, leudanteDetectado } = analizarIngredientesMatzah(ingredientes);

  const ingredientesHTML = ingredientes.map(ing => {
    const normalizado = normalizeYsingularizar(ing);
    if (isTameMatzah(normalizado)) {
      return `<span style="color:red; font-weight:bold;">${ing}</span>`;
    } else if (isLeudante(normalizado)) {
      return `<span style="color:orange; font-weight:bold;">${ing}</span>`;
    } else {
      return `<span>${ing}</span>`;
    }
  }).join(", ");

  let evaluacionFinal = '✅ Apto (sin levadura)';
  if (tameDetectado) {
    evaluacionFinal = '❌ No Apto (Tame)';
  } else if (leudanteDetectado) {
    evaluacionFinal = '⚠️ Contiene Leudante';
  }

  const resultadoHTML = `
    <details class="detalle-producto">
      <summary><strong>${nombreProducto}</strong> – ${marcaProducto}</summary>
      ${imagenProducto ? `<img src="${imagenProducto}" alt="Imagen del producto" style="max-width:200px;">` : '<p style="color:gray;">🖼️ Imagen no disponible</p>'}
      <p><strong>Ingredientes:</strong> ${ingredientesHTML}</p>
      <p style="font-weight:bold;">${evaluacionFinal}</p>
    </details>
  `;

  resultados.push(resultadoHTML);

  if (resultados.length >= 3) break;
}



    return resultados.length > 0 ? resultados : null;

  } catch (e) {
    console.error("❌ Error al consultar OpenFoodFacts:", e);
    return null;
  }
}

function scrollAResultadosMatzah(intentos = 0) {
  const resultados = document.getElementById('resultadoMatzah');
  if (!resultados) return;

  if (resultados.offsetHeight > 0 || intentos >= 5) {
    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  setTimeout(() => scrollAResultadosMatzah(intentos + 1), 50);
}

async function buscarSoloPorEanMatzah(ean) {
  const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";

  nombreGlobalMatzah = '';
  marcaGlobalMatzah = '';
  eanGlobalMatzah = ean;

  resultadoMatzah.innerHTML = '<p><strong>🔍 Buscando solo por Código de Barras en Pesaj...</strong></p>';
  scrollAResultadosMatzah();

  productosMatzahTemporales = []; // 🧹 limpia anteriores

  const htmlLocales = await buscarProductoEnArchivos('', '', ean, pais);
  if (htmlLocales) {
    const partes = htmlLocales.split('<hr>');

    for (const htmlProducto of partes) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlProducto, 'text/html');
      const nombreProducto = doc.querySelector('strong')?.textContent || "";
      const ingredientesTexto = doc.querySelector('p')?.textContent || "";
      const ingredientes = ingredientesTexto.split(',').map(i => i.trim());

      productosMatzahTemporales.push({
        nombre: nombreProducto,
        imagenHTML: doc.querySelector('img')?.outerHTML || '<p style="color:gray;">🖼️ Imagen no disponible</p>',
        ingredientesRaw: ingredientes
      });
    }
  }

  if (productosMatzahTemporales.length < 3) {
    resultadoMatzah.innerHTML += `<p><strong>🌐 Consultando OpenFoodFacts...</strong></p>`;
    const resultadoOFF = await buscarEnOpenFoodFactsMatzah('', '', ean, pais);
    if (resultadoOFF) {
      resultadoOFF.forEach(htmlProducto => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlProducto, 'text/html');
        const nombreProducto = doc.querySelector('strong')?.textContent || "";
        const ingredientesTexto = doc.querySelector('p')?.textContent || "";
        const ingredientes = ingredientesTexto.split(',').map(i => i.trim());

        productosMatzahTemporales.push({
          nombre: nombreProducto,
          imagenHTML: doc.querySelector('img')?.outerHTML || '<p style="color:gray;">🖼️ Imagen no disponible</p>',
          ingredientesRaw: ingredientes
        });
      });
    }
  }

  if (productosMatzahTemporales.length > 0) {
    renderizarResultadosMatzah();
  } else {
    resultadoMatzah.innerHTML = `
      <p style="color:red;">❌ Producto no encontrado por código de barras.</p>
      <p>¿Nos ayudas a registrarlo? 🙌</p>
      <button onclick="mostrarFormularioRegistroMatzah()">📝 Registrar manualmente</button>
    `;
  }

  setTimeout(() => scrollAResultadosMatzah(), 250);
}


async function inicializarListaCamarasMatzah(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const devices = await codeReaderMatzah.getVideoInputDevices();

    select.innerHTML = '';
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Cámara ${index + 1}`;
      select.appendChild(option);
    });

    if (!select.value && devices[0]) {
      select.value = devices[0].deviceId;
    }

  } catch (err) {
    console.error('❌ Error al inicializar cámaras en Matzah:', err);
    select.innerHTML = '<option>Error acceso a cámara</option>';
  }
}

// Seleccionar cámara para matzah
const selectCamaraMatzah = document.getElementById('selectCamaraMatzah');

selectCamaraMatzah?.addEventListener('change', () => {
  if (currentPreviewStream) {
    currentPreviewStream.getTracks().forEach(track => track.stop());
    currentPreviewStream = null;
  }

  codeReaderMatzah.reset();
codeReaderMatzah = new ZXing.BrowserBarcodeReader();


  resultadoMatzah.innerHTML = `
    <p style="color:gray;">📷 Cámara reiniciada. Pulsa nuevamente "Escanear código".</p>
  `;
});

function volverAlMenuMatzah() {
  document.title = "Escáner de Productos Lev 11 Éxodo 12";
  document.getElementById("tituloPrincipal").textContent = "Escáner de Productos Lev 11 Éxodo 12";
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'none';
  localStorage.removeItem('ultimaSeccionActiva');
}

document.addEventListener('DOMContentLoaded', () => {
  const seccionGuardada = localStorage.getItem("ultimaSeccionActiva");
  if (seccionGuardada === "matzah") {
    mostrarSeccionMatzah();
  } else {
    mostrarSeccionTahor(); // por defecto
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const botonBusquedaCodigoMatzah = document.getElementById('botonBusquedaCodigoMatzah');

  if (botonBusquedaCodigoMatzah) {
    botonBusquedaCodigoMatzah.addEventListener('click', () => {
      const ean = document.getElementById('eanEntradaMatzah').value.trim();
      if (!ean || !/^[0-9]{8,14}$/.test(ean)) {
        resultadoMatzah.innerHTML = `<p style="color:red;">⚠️ Debes ingresar un código válido (8 a 14 dígitos).</p>`;
        return;
      }

      buscarSoloPorEanMatzah(ean); // ya existe y está bien implementada
    });
  }
});

const bloqueEscanerMatzah = document.getElementById("codigoManualDetalleMatzah");
if (bloqueEscanerMatzah) {
  bloqueEscanerMatzah.addEventListener("toggle", (e) => {
    if (e.target.open) {
      solicitarPermisoCamara();
    }
  });
}


function resaltarPalabrasDudosas(textoOriginal, palabrasDudosas, activo) {
  if (!activo) return textoOriginal;

  let texto = textoOriginal;
  palabrasDudosas.forEach(palabra => {
    const regex = new RegExp(`\\b(${palabra})\\b`, 'gi');
    texto = texto.replace(regex, `<span style="color:#7B61FF; font-weight:bold;">$1</span>`);
  });
  return texto;
}

function renderizarResultadosMatzah() {
  const contenedor = document.getElementById("resultadoMatzah");
  contenedor.innerHTML = `<p><strong>🔎 Resultados encontrados (${productosMatzahTemporales.length}):</strong></p>`;

  const filtroTame = document.getElementById('filtroTame')?.checked;
  const filtroLeudado = document.getElementById('filtroLeudado')?.checked;
  const filtroDudoso = document.getElementById('filtroDudoso')?.checked;

  if (!filtroTame && !filtroLeudado && !filtroDudoso) {
    contenedor.innerHTML = `<p style="color:red;">⚠️ Debes activar al menos un filtro para mostrar los resultados.</p>`;
    return;
  }

  productosMatzahTemporales.forEach(prod => {
const htmlIngredientes = prod.ingredientesRaw.map(ing => {
  const normal = normalizeYsingularizar(ing);
  const esTame = isTameMatzah(normal);
  const esLeudante = isLeudante(normal);
  const esDudoso = isDudoso(normal);

  if (esTame && filtroTame) {
    return `<span style="color:red; font-weight:bold;">${ing}</span>`;
  } else if (esLeudante && filtroLeudado) {
    return `<span style="color:orange; font-weight:bold;">${ing}</span>`;
  } else if (esDudoso && filtroDudoso) {
    return resaltarPalabrasDudosas(ing, listaDudosos, true);
  } else {
    return `<span>${ing}</span>`;
  }
}).join(", ");




const ingredientesTameDetectados = prod.ingredientesRaw.filter(i =>
  isTameMatzah(normalizeYsingularizar(i))
);

const ingredientesLeudDetectados = prod.ingredientesRaw.filter(i =>
  !isTameMatzah(normalizeYsingularizar(i)) &&
  isLeudante(normalizeYsingularizar(i))
);

const ingredientesDudososDetectados = prod.ingredientesRaw.filter(i =>
  !isTameMatzah(normalizeYsingularizar(i)) &&
  !isLeudante(normalizeYsingularizar(i)) &&
  isDudoso(normalizeYsingularizar(i))
);


let mensajeFinal = '✅ Apto (Tahor)';
let colorFinal = 'green';

const hayTame = ingredientesTameDetectados.length > 0;
const hayLeud = ingredientesLeudDetectados.length > 0;

// ✅ Regla 1: Si hay Tame y el filtro Tame está activo
if (filtroTame && hayTame) {
  if (filtroLeudado && hayLeud) {
    mensajeFinal = '❌ No Apto (Tame y Leudado)';
    colorFinal = 'darkred';
  } else {
    mensajeFinal = '❌ No Apto (Tame)';
    colorFinal = 'red';
  }
}
// ✅ Regla 2: Si no hay Tame y está activado filtro de levadura → advertencia + color verde
else if (!hayTame && filtroLeudado && hayLeud) {
  mensajeFinal = '✅ Apto (Tahor)<br><span style="color:orange;">⚠️ Contiene leudante</span>';
  colorFinal = 'green'; // 👈 ¡IMPORTANTE! Se mantiene color verde
}
// ✅ Regla 3: Si todo está bien → sigue Apto Tahor con verde


contenedor.innerHTML += `
  <details class="detalle-producto">
    <summary><strong>${prod.nombre}</strong></summary>
    <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
      <div style="flex: 0 0 auto;">
        ${prod.imagenHTML}
      </div>
<div style="flex: 1 1 220px; max-width: 520px;">
  <p><strong>Ingredientes:</strong><br>${htmlIngredientes}</p>

${filtroTame && ingredientesTameDetectados.length > 0 ? `
  <p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>
  <ul style="color:red;">${ingredientesTameDetectados.map(i => `<li><b>${i}</b></li>`).join("")}</ul></p>` : ""
}
${filtroDudoso && ingredientesDudososDetectados.length > 0 ? `
  <p><strong style="color:#7B61FF;">Ingredientes Dudosos detectados:</strong><br>
  <ul style="color:#7B61FF;">${ingredientesDudososDetectados.map(i => `<li><b>${i}</b></li>`).join("")}</ul></p>` : ""
}

${filtroLeudado && ingredientesLeudDetectados.length > 0 ? `
  <p><strong style="color:orange;">Ingredientes Leudantes detectados:</strong><br>
  <ul style="color:orange;">${ingredientesLeudDetectados.map(i => `<li><b>${i}</b></li>`).join("")}</ul></p>` : ""
}


  <p style="color:${colorFinal}; font-weight:bold;">${mensajeFinal}</p>
</div>

    </div>
  </details>
  <hr>
`;

  });
}


document.getElementById('filtroTame')?.addEventListener('change', renderizarResultadosMatzah);
document.getElementById('filtroLeudado')?.addEventListener('change', renderizarResultadosMatzah);
document.getElementById('filtroDudoso')?.addEventListener('change', renderizarResultadosMatzah);
