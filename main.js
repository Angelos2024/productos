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
const escanearCodigoBtn = document.getElementById('escanearCodigo');
const resultadoDiv = document.getElementById('analisisResultado');
const registroManualDiv = document.getElementById('registroManual');
const mensajeUsuario = document.getElementById('mensajeUsuario');

let marcaGlobal = '';
let nombreGlobal = '';
let eanGlobal = '';

// --- Cámara y escaneo
if (escanearCodigoBtn) {
  const codeReader = new ZXing.BrowserBarcodeReader();
  const selectCamara = document.getElementById('selectCamara');

  navigator.mediaDevices.getUserMedia({ video: true }).then(async () => {
    const devices = await codeReader.getVideoInputDevices();
    selectCamara.innerHTML = '';
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Cámara ${index + 1}`;
      selectCamara.appendChild(option);
    });
  }).catch(err => {
    console.error('No se pudo acceder a la cámara para listar dispositivos:', err);
    selectCamara.innerHTML = '<option>No se pudo acceder a la cámara</option>';
  });

  escanearCodigoBtn.addEventListener('click', async () => {
    const selectedDeviceId = selectCamara.value;
    const previewElem = document.createElement('video');
    previewElem.setAttribute('style', 'width:100%; max-width:300px; margin-bottom:1rem;');
    resultadoDiv.innerHTML = '<p><strong>📷 Escaneando... permite acceso a la cámara</strong></p>';
    resultadoDiv.appendChild(previewElem);

    try {
      const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, previewElem);
      document.getElementById('eanEntrada').value = result.text;
      resultadoDiv.innerHTML = `<p><strong>✅ Código detectado:</strong> ${result.text}</p>`;
    } catch (err) {
      console.error('Error escaneando:', err);
      resultadoDiv.innerHTML = '<p style="color:red;">❌ No se pudo leer el código. Intenta nuevamente.</p>';
    } finally {
      codeReader.reset();
    }
  });
}

// --- Búsqueda principal
botonBusqueda.addEventListener('click', async () => {
  const marca = document.getElementById('marcaEntrada').value.trim();
  const nombre = document.getElementById('nombreEntrada').value.trim();
  const ean = document.getElementById('eanEntrada')?.value.trim();

  if (!ean && (!marca || !nombre)) {
    alert("⚠️ Completa al menos Marca y Nombre, o solo Código de Barras.");
    return;
  }

  marcaGlobal = marca;
  nombreGlobal = nombre;
  eanGlobal = ean;

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando en base local archivo por archivo...</strong></p>';

  const encontrado = await buscarProductoEnArchivos(nombre, marca, ean);
  if (encontrado) return;

  resultadoDiv.innerHTML += '<p><strong>🌐 Consultando OpenFoodFacts...</strong></p>';
  const res = await buscarEnOpenFoodFacts(nombre, ean);
  resultadoDiv.innerHTML += res || "<p>❌ No se encontró información del producto.</p>";
});

function abrirTahor() {
  document.getElementById('menuInicial').style.display = 'none';
  document.getElementById('bloqueTahor').style.display = 'block';
  document.getElementById('registroManual').style.display = 'block';
  resultadoDiv.innerHTML = '';
  mensajeUsuario.innerHTML = '';
}

// Tabs de navegación
document.getElementById('tabBuscar').addEventListener('click', () => {
  document.getElementById('formBusquedaProducto').style.display = 'block';
  document.getElementById('analisisResultado').style.display = 'block';
  document.getElementById('registroManual').style.display = 'none';
  activarTab('tabBuscar');
});

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

// --- Envío manual de productos
document.getElementById("formRegistroManual").addEventListener("submit", async (e) => {
  e.preventDefault();

  const producto = {
    marca: document.getElementById("marcaManual").value.trim(),
    nombre: document.getElementById("nombreManual").value.trim(),
    pais: document.getElementById("paisManual").value.trim(),
    ingredientes: document.getElementById("ingredientesManual").value
      .split(",")
      .map(i => i.trim()),
    tahor: false
  };

  try {
    const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "registrar", producto })
    });

    if (!res.ok) throw new Error("Error al registrar producto");

    mensajeUsuario.innerHTML = "✅ Producto enviado para revisión.";
    e.target.reset();
  } catch (err) {
    console.error("❌ Error al registrar producto:", err);
    mensajeUsuario.innerHTML = "❌ No se pudo registrar el producto.";
  }
});
