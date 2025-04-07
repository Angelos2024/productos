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

// Escaneo de código de barras desde cámara (mejorado para celular)
if (escanearCodigoBtn) {
  const codeReader = new ZXing.BrowserBarcodeReader();
  const selectCamara = document.getElementById('selectCamara');

  // Pedir permiso inicial para listar las cámaras con etiquetas visibles
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

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando en base local...</strong></p>';

  const base = await fetch("/base_tahor_tame.json").then(r => r.json());
  const clave = normalizeYsingularizar(marca + " " + nombre);
  const encontrado = base.find(p =>
    normalizeYsingularizar(p.marca + " " + p.nombre) === clave
  );

  if (encontrado) {
    const ing = encontrado.ingredientes.map(i =>
      isTame(i) ? `<span style="color:red">${i}</span>` : `<span>${i}</span>`).join(', ');
    resultadoDiv.innerHTML += `
      <p><strong>${encontrado.nombre}</strong> – ${encontrado.marca} (${encontrado.pais})</p>
      <p>Ingredientes: ${ing}</p>
      <p style="color:${encontrado.tahor ? 'green' : 'red'};">
        ${encontrado.tahor ? '✅ Apto (Tahor)' : '❌ No Apto (Tame)'}
      </p>`;
    return;
  }

  resultadoDiv.innerHTML += '<p><strong>🌐 Consultando OpenFoodFacts...</strong></p>';
  const res = await buscarEnOpenFoodFacts(nombre, ean);
  resultadoDiv.innerHTML += res || "<p>❌ No se encontró información del producto.</p>";
});

async function buscarEnOpenFoodFacts(nombre, ean) {
  try {
    let url = "";
    if (ean && /^[0-9]{8,14}$/.test(ean)) {
      url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`;
    } else {
      const nombreBusqueda = encodeURIComponent(nombre);
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombreBusqueda}&search_simple=1&action=process&json=1`;
    }

    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    const prod = data.product || (data.products && data.products[0]);
    if (!prod) return null;

    const ingredientes = prod.ingredients_text || "";
    const lista = ingredientes.toLowerCase().split(/,|\./).map(i => i.trim()).filter(i => i.length > 1);
    const htmlIng = lista.map(ing => isTame(ing) ? `<span style="color:red">${ing}</span>` : `<span>${ing}</span>`).join(', ');
    const tame = lista.some(i => isTame(i));

    return `
      ${prod.image_url ? `<img src="${prod.image_url}" alt="Imagen del producto">` : ''}
      <p><strong>${prod.product_name || 'Producto'}</strong></p>
      <p>Ingredientes: ${htmlIng}</p>
      <p style="color:${tame ? 'red' : 'green'};">
        ${tame ? '❌ No Apto (Tame)' : '✅ Apto (Tahor)'}</p>`;
  } catch (e) {
    return null;
  }
}


function abrirTahor() {
  document.getElementById('menuInicial').style.display = 'none';
  document.getElementById('bloqueTahor').style.display = 'block';
  document.getElementById('registroManual').style.display = 'block';
  resultadoDiv.innerHTML = '';
  mensajeUsuario.innerHTML = '';
}



// Tabs: Buscar vs Registrar
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
  document.getElementById('tabBuscar').classList.remove('tab-activa');
  document.getElementById('tabRegistrar').classList.remove('tab-activa');
  document.getElementById(idActiva).classList.add('tab-activa');
}



// Añadir pestaña de Buzón al iniciar sesión como administrador
function mostrarBuzonAdmin() {
  // Verifica si ya existe la pestaña
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


// Cargar productos pendientes desde pendientes.json en GitHub
async function cargarPendientes() {
  const contenedor = document.getElementById('listaPendientes');
  contenedor.innerHTML = "<p>Cargando...</p>";

  try {
    const res = await fetch('https://raw.githubusercontent.com/angelos2024/verificador/main/pendientes.json');
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


let productosPendientes = [];

async function aprobarProducto(index) {
  const producto = productosPendientes[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar', producto })
    });

    if (!res.ok) throw new Error('Error al aprobar');
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

    if (!res.ok) throw new Error('Error al rechazar');
    cargarPendientes();
  } catch (err) {
    console.error('❌ Error al rechazar producto:', err);
  }
}
