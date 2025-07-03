/// Desactivar nombre/marca si hay código de barras en Personal
const eanEntradaPersonal = document.getElementById('eanEntradaPersonal');
const nombreEntradaPersonal = document.getElementById('nombreEntradaPersonal');
const marcaEntradaPersonal = document.getElementById('marcaEntradaPersonal');

eanEntradaPersonal?.addEventListener('input', () => {
  const tieneCodigo = eanEntradaPersonal.value.trim() !== "";
  nombreEntradaPersonal.readOnly = tieneCodigo;
  marcaEntradaPersonal.readOnly = tieneCodigo;
});

// ⚠️ Mostrar advertencia si campo está bloqueado
function mostrarNotaBusquedaPersonal(mensaje) {
  let nota = document.getElementById('notaBusquedaPersonal');
  if (!nota) {
    nota = document.createElement('div');
    nota.id = 'notaBusquedaPersonal';
    nota.style = `
      display: none;
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
      padding: 0.8rem 1rem;
      border-radius: 6px;
      margin: 1rem 0;
      font-size: 0.95rem;
      font-weight: bold;
      transition: opacity 0.4s ease;
      opacity: 0;
    `;
    const bloque = document.querySelector('#busquedaPersonal1');
    if (bloque) bloque.appendChild(nota);
  }

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

function protegerCampoBloqueadoPersonal(input, mensajeFuncion) {
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

// Activar protección para los campos personales
protegerCampoBloqueadoPersonal(nombreEntradaPersonal, mostrarNotaBusquedaPersonal);
protegerCampoBloqueadoPersonal(marcaEntradaPersonal, mostrarNotaBusquedaPersonal);

marcaEntradaPersonal?.addEventListener('click', (e) => {
  if (marcaEntradaPersonal.disabled) {
    mostrarNotaBusquedaPersonal("⚠️ Solo puedes buscar por nombre/marca o por código. Borra uno para activar el otro.");
    e.preventDefault();
  }
});

// 🔤 Normalizar y singularizar texto (reutilizable)
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

// 🧴 Detección de ingredientes Tame para uso personal
function isTamePersonal(ingrediente) {
  const palabras = normalizeYsingularizar(ingrediente).split(' ');
  return palabras.some(palabra =>
    window.ingredientesTame?.some(tame =>
      palabra === normalizeYsingularizar(tame)
    )
  );
}





// --- Analizar una lista de ingredientes en Personal ---
function analizarIngredientesPersonal(ingredientes) {
  let tameDetectado = false;

  for (const ing of ingredientes) {
    const normalizado = normalizeYsingularizar(ing);

    if (isTamePersonal(normalizado)) {
      tameDetectado = true;
      break;
    }
  }

  return { tameDetectado };
}

async function buscarProductoPersonalConLocalYRemoto(nombre, marca, ean, pais) {
  const resultadosHTML = [];

  // 1️⃣ Intentar con base local
  const htmlLocal = await buscarProductoEnArchivosSoloBase(nombre, marca, ean, pais);
if (htmlLocal?.length) {
  resultadosHTML.push(...htmlLocal);
}



  // 2️⃣ Si no hay resultados, buscar en OpenBeautyFacts
// 🔧 CAMBIO AQUÍ:
if (resultadosHTML.length < 3) {
  resultadoPersonal.innerHTML += `<p><strong>🌐 Consultando OpenBeautyFacts...</strong></p>`;
  const externos = await buscarEnOpenBeautyFactsPersonal(nombre, marca, ean, pais);
  if (externos) resultadosHTML.push(...externos);
}



 // Devolver todos los resultados si hay locales
if (htmlLocal) return resultadosHTML;

// Si solo hay externos, limitar a 3
return resultadosHTML.length > 0 ? resultadosHTML.slice(0, 3) : null;

}

// --- Elementos DOM para Matzah ---
const botonBusquedaPersonal = document.getElementById('botonBusquedaPersonal');
const botonBuscarRapidoPersonal = document.getElementById('botonBuscarRapidoPersonal');
const escanearCodigoPersonal = document.getElementById('escanearCodigoPersonal');

const resultadoPersonal = document.getElementById('resultadoPersonal');
const registroManualPersonal = document.getElementById('registroManualPersonal');
const mensajeUsuarioPersonal = document.getElementById('mensajeUsuarioPersonal');

let marcaGlobalPersonal = '';
let nombreGlobalPersonal = '';
let eanGlobalPersonal = '';
  

// --- Cámara y escaneo para Matzah ---
let codeReaderPersonal = new ZXing.BrowserMultiFormatReader();

if (escanearCodigoPersonal) {
  const selectCamaraPersonal = document.getElementById('selectCamaraPersonal');

  escanearCodigoPersonal.addEventListener('click', async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.error("❌ Permiso denegado para la cámara:", err);
      selectCamaraPersonal.innerHTML = '<option>❌ Permiso de cámara denegado</option>';
      return;
    }

    let devices = [];
    try {
      devices = await codeReaderPersonal.getVideoInputDevices();
      const camaraAnterior = selectCamaraPersonal.value;

      selectCamaraPersonal.innerHTML = '';
      devices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Cámara ${index + 1}`;
        selectCamaraPersonal.appendChild(option);
      });

      const existeAun = devices.some(d => d.deviceId === camaraAnterior);
      if (existeAun) {
        selectCamaraPersonal.value = camaraAnterior;
      } else if (devices.length > 0) {
        selectCamaraPersonal.value = devices[0].deviceId;
      }
    } catch (err) {
      console.error('❌ No se pudo listar dispositivos de cámara:', err);
      selectCamaraPersonal.innerHTML = '<option>No se pudo acceder a la cámara</option>';
      return;
    }

    const selectedDeviceId = selectCamaraPersonal.value;

    if (currentPreviewStream) {
      currentPreviewStream.getTracks().forEach(track => track.stop());
      currentPreviewStream = null;
    }

  // Crear elementos de escaneo
const previewElem = document.createElement('video');
previewElem.setAttribute('id', 'previewElemPersonal');
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
  <!-- Línea horizontal centrada -->
<div style="
  position: absolute;
  top: 60%;
  left: 0;
  width: 100%;
  height: 2px;
  background: white;
  opacity: 0.9;
  transform: translateY(-1px);
"></div>


  <!-- Marco general -->
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
contenedorEscaneo.style.position = 'relative';
contenedorEscaneo.style.margin = '1rem auto';
contenedorEscaneo.style.maxWidth = '480px';
contenedorEscaneo.appendChild(previewElem);
contenedorEscaneo.appendChild(overlay);

// Mostrar en pantalla
resultadoPersonal.innerHTML = `
  <p><strong>📷 Escaneando... permite acceso a la cámara</strong></p>
  <button id="cancelarEscaneo" style="float:right; background:#e74c3c; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer; font-weight:bold;">❌ Cancelar escaneo</button>
`;
resultadoPersonal.appendChild(contenedorEscaneo);


    document.getElementById('cancelarEscaneo').addEventListener('click', () => {
      if (currentPreviewStream) {
        currentPreviewStream.getTracks().forEach(track => track.stop());
        currentPreviewStream = null;
      }
      codeReaderPersonal.reset();
      codeReaderPersonal = new ZXing.BrowserMultiFormatReader();
      resultadoPersonal.innerHTML = '<p style="color:gray;">⛔ Escaneo cancelado por el usuario.</p>';
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

      codeReaderPersonal.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, err) => {
        if (result) {
          document.getElementById('eanEntradaPersonal').value = result.text;
          buscarSoloPorEanPersonal(result.text);

          codeReaderPersonal.reset();
          if (currentPreviewStream) {
            currentPreviewStream.getTracks().forEach(track => track.stop());
            currentPreviewStream = null;
          }
        }
      });

    } catch (err) {
      console.error('❌ Error escaneando:', err);
      resultadoPersonal.innerHTML = '<p style="color:red;">❌ No se pudo leer el código. Intenta nuevamente.</p>';
    }
  });
}


botonBusquedaPersonal.addEventListener('click', async () => {
  const marca = document.getElementById('marcaEntradaPersonal').value.trim();
  const nombre = document.getElementById('nombreEntradaPersonal').value.trim();
  const ean = document.getElementById('eanEntradaPersonal').value.trim();

  const bloquePersonalVisible = document.getElementById('bloquePersonal').style.display === 'block';
  const encabezado = document.getElementById('encabezado');

  if (encabezado && bloquePersonalVisible) {
    encabezado.classList.remove('tahor', 'pesaj');
    encabezado.classList.add('personal');
  }

  const botonRegistrarPersonal = document.getElementById('tabRegistrarPersonal');
  if (bloquePersonalVisible && botonRegistrarPersonal) {
    botonRegistrarPersonal.style.backgroundColor = '#5c4080';
  }

  // Obtener país seleccionado
  const paisInputs = document.querySelectorAll('#paisFiltroPersonal, #paisFiltroPersonal2');
  let pais = '';
  paisInputs.forEach(sel => {
    const valor = sel.value.trim();
    if (valor) pais = valor;
  });

  // Validar campos requeridos
  if (!ean && (!marca || !nombre)) {
    return;
  }

  if (ean && /^[0-9]{8,14}$/.test(ean)) {
    buscarSoloPorEanPersonal(ean);
    return;
  }

  marcaGlobalPersonal = marca;
  nombreGlobalPersonal = nombre;
  eanGlobalPersonal = ean;

  resultadoPersonal.innerHTML = '<p><strong>🔍 Buscando en base local...</strong></p>';
  scrollAResultadosPersonal();

  const resultadosHTML = await buscarProductoPersonalConLocalYRemoto(nombre, marca, ean, pais);

  if (!resultadosHTML || resultadosHTML.length === 0) {
    resultadoPersonal.innerHTML = `
      <p style="color:red;">❌ Producto no encontrado ni en la base ni en OpenBeautyFacts.</p>
      <p>¿Nos ayudas a registrarlo? 🙌</p>
      <button onclick="mostrarFormularioRegistroPersonal()">📝 Registrar manualmente</button>
    `;
  } else {
    resultadoPersonal.innerHTML = `
      <p><strong>🔎 Resultados encontrados (${resultadosHTML.length}):</strong></p>
      ${resultadosHTML.join('<hr>')}
    `;
  }

  setTimeout(() => scrollAResultadosPersonal(), 250);
});




// --- Cambio de pestañas en Matzah ---
document.getElementById('tabRegistrarPersonal')?.addEventListener('click', () => {
  document.getElementById('formBusquedaPersonal').style.display = 'none';
  document.getElementById('resultadoPersonal').style.display = 'none';
  document.getElementById('registroManualPersonal').style.display = 'block';
  activarTabPersonal('tabRegistrarPersonal');

  // 🔽 Scroll suave a la sección de registro
  const registroPersonal = document.getElementById('registroManualPersonal');
  if (registroPersonal) {
    setTimeout(() => {
      registroPersonal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }

  const boton = document.getElementById('tabRegistrarPersonal');
  if (boton) boton.style.display = 'none';
});



function activarTabPersonal(idActiva) {
  ['tabBuscarPersonal', 'tabRegistrarPersonal'].forEach(id => {
    const tab = document.getElementById(id);
    if (tab) tab.classList.remove('tab-activa');
  });
  document.getElementById(idActiva)?.classList.add('tab-activa');
}


function mostrarFormularioRegistroPersonal() {
  document.getElementById('formBusquedaPersonal').style.display = 'none';
  document.getElementById('resultadoPersonal').style.display = 'none';
  document.getElementById('registroManualPersonal').style.display = 'block';
  activarTabPersonal('tabRegistrarPersonal');

  const mensaje = document.getElementById('mensajeUsuarioPersonal');
  if (mensaje) mensaje.innerHTML = '';

  const botonRegistrarPersonal = document.getElementById('tabRegistrarPersonal');
  if (botonRegistrarPersonal) botonRegistrarPersonal.style.display = 'none';
}

// Añadir pestaña de revisión solo si no existe (modo personal)
function mostrarBuzonAdminPersonal() {
  if (!document.getElementById('tabBuzonPersonal')) {
    const nuevaTab = document.createElement('button');
    nuevaTab.id = 'tabBuzonPersonal';
    nuevaTab.innerText = '📬 Buzón de revisiones (Personal)';

    nuevaTab.style.position = 'fixed';
    nuevaTab.style.bottom = '5rem';
    nuevaTab.style.right = '1rem';
    nuevaTab.style.backgroundColor = '#5c4080'; // Morado Personal
    nuevaTab.style.color = 'white';
    nuevaTab.style.border = 'none';
    nuevaTab.style.borderRadius = '12px';
    nuevaTab.style.padding = '0.5rem 1rem';
    nuevaTab.style.zIndex = '9999';
    nuevaTab.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    nuevaTab.style.cursor = 'pointer';

    nuevaTab.addEventListener('click', () => {
      document.getElementById('formBusquedaPersonal').style.display = 'none';
      document.getElementById('resultadoPersonal').style.display = 'none';
      document.getElementById('registroManualPersonal').style.display = 'none';
     const adminPanel = document.getElementById('adminPanelPersonal');
if (adminPanel) adminPanel.style.display = 'none';
      document.getElementById('buzonRevisionesPersonal').style.display = 'block';

      activarTabPersonal('tabBuzonPersonal');
      cargarPendientesPersonal(); // esta función debes definirla

      mostrarBotonVolverInicioPersonal();
    });

    document.body.appendChild(nuevaTab);
  }
}


function mostrarBotonVolverInicioPersonal() {
  if (!document.getElementById('botonVolverInicioPersonal')) {
    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolverInicioPersonal';
    botonVolver.innerText = '⬅️ Volver a inicio Personal';

    botonVolver.style.position = 'fixed';
    botonVolver.style.bottom = '9rem';
    botonVolver.style.right = '1rem';
    botonVolver.style.backgroundColor = '#9b59b6'; // Lila claro
    botonVolver.style.color = 'white';
    botonVolver.style.border = 'none';
    botonVolver.style.borderRadius = '12px';
    botonVolver.style.padding = '0.5rem 1rem';
    botonVolver.style.zIndex = '9999';
    botonVolver.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    botonVolver.style.cursor = 'pointer';

    botonVolver.addEventListener('click', () => {
      document.getElementById('buzonRevisionesPersonal').style.display = 'none';
      const panelAdmin = document.getElementById('adminPanelPersonal');
if (panelAdmin) panelAdmin.style.display = 'none';
      document.getElementById('formBusquedaPersonal').style.display = 'block';
      document.getElementById('resultadoPersonal').style.display = 'block';

      const titulo = document.getElementById('titulo');
      const tituloPrincipal = document.getElementById('tituloPrincipal');
      if (titulo) titulo.textContent = "🧴 Escáner de Productos de Higiene Personal";
      if (tituloPrincipal) tituloPrincipal.textContent = "Escáner de Productos de Higiene Personal";
      document.title = "Escáner de Productos Personales";

      activarTabPersonal('tabBuscarPersonal');

      botonVolver.remove();
    });

    document.body.appendChild(botonVolver);
  }
}

let productosPendientesPersonal = [];

async function cargarPendientesPersonal() {
  const contenedor = document.getElementById('listaPendientesPersonal');
  contenedor.innerHTML = "<p>Cargando...</p>";

  try {
    const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "listar" })
    });

    if (!res.ok) throw new Error("Error al listar productos (Personal)");

    const productos = await res.json();
    productosPendientesPersonal = productos;

    if (!productos.length) {
      contenedor.innerHTML = "<p>🎉 No hay productos pendientes para uso personal.</p>";
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
            if (isTamePersonal(normalizado)) {
              return `<span style="color:red; font-weight:bold;">${ing}</span>`;
            } else {
              return `<span>${ing}</span>`;
            }
          }).join(", ")
        }</span><br><br>

        <button onclick="aprobarProductoPersonal(${index})">✔️ Aprobar</button>
        <button onclick="rechazarProductoPersonal(${index})" style="background-color:#e74c3c">❌ Rechazar</button>
      `;
      contenedor.appendChild(tarjeta);
    });

  } catch (err) {
    contenedor.innerHTML = "<p style='color:red;'>❌ Error al cargar pendientes de uso personal.</p>";
    console.error(err);
  }
}

async function aprobarProductoPersonal(index) {
  const producto = productosPendientesPersonal[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar', producto })
    });

    if (!res.ok) throw new Error('Error al aprobar producto Personal');
    cargarPendientesPersonal();
  } catch (err) {
    console.error('❌ Error al aprobar producto Personal:', err);
  }
}



async function rechazarProductoPersonal(index) {
  const producto = productosPendientesPersonal[index];
  if (!producto) return;

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'rechazar', producto })
    });

    if (!res.ok) throw new Error('Error al rechazar producto Personal');
    cargarPendientesPersonal();
  } catch (err) {
    console.error('❌ Error al rechazar producto Personal:', err);
  }
}

async function buscarEnOpenBeautyFactsPersonal(nombre, marca, ean, pais = "") {
  console.log("🌐 Consultando para Personal con:", { nombre, marca, ean, pais });

  try {
    let resultados = [];
    let productos = [];

    // Buscar por EAN si está presente
    if (ean && /^[0-9]{8,14}$/.test(ean)) {
      const url = `https://world.openbeautyfacts.org/api/v0/product/${ean}.json`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.product) productos.push(data.product);
    } else {
      const nombreBusqueda = encodeURIComponent(nombre);
      const url = `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${nombreBusqueda}&search_simple=1&action=process&json=1&page_size=20`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      productos = data.products || [];

      // 🔍 Filtrar por nombre y marca
      const claveNombre = normalizeYsingularizar(nombre);
      const claveMarca = normalizeYsingularizar(marca);

const palabrasClaveNombre = claveNombre.split(" ");
const palabrasClaveMarca = claveMarca.split(" ");

productos = productos.filter(p => {
  const nombreProd = normalizeYsingularizar(p.product_name || '');
  const marcaProd = normalizeYsingularizar(p.brands || '');

  const coincideNombre = palabrasClaveNombre.some(palabra => nombreProd.includes(palabra));
  const coincideMarca = claveMarca && palabrasClaveMarca.some(palabra => marcaProd.includes(palabra));

  return coincideMarca && coincideNombre;
});


    }

    // 🌍 Filtro adicional por país
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

    // 🔬 Procesar resultados
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

      const { tameDetectado } = analizarIngredientesPersonal(ingredientes);

      const ingredientesHTML = ingredientes.map(ing => {
        const normalizado = normalizeYsingularizar(ing);
        if (isTamePersonal(normalizado)) {
          return `<span style="color:red; font-weight:bold;">${ing}</span>`;
        } else {
          return `<span>${ing}</span>`;
        }
      }).join(", ");

      const evaluacionFinal = tameDetectado
        ? '❌ No Apto para uso personal'
        : '✅ Apto para uso personal';

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
    console.error("❌ Error al consultar OpenBeautyFacts para Personal:", e);
    return null;
  }
}


function scrollAResultadosPersonal(intentos = 0) {
  const resultados = document.getElementById('resultadoPersonal');
  if (!resultados) return;

  if (resultados.offsetHeight > 0 || intentos >= 5) {
    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  setTimeout(() => scrollAResultadosPersonal(intentos + 1), 50);
}

async function buscarSoloPorEanPersonal(ean) {
  const pais = document.getElementById('paisFiltroPersonal')?.value.trim() || "";

  nombreGlobalPersonal = '';
  marcaGlobalPersonal = '';
  eanGlobalPersonal = ean;

  resultadoPersonal.innerHTML = '<p><strong>🔍 Buscando solo por Código de Barras...</strong></p>';
  scrollAResultadosPersonal();

  const resultadosHTML = [];

  // 1️⃣ Buscar en base local primero
  const local = await buscarProductoEnArchivosSoloBase('', '', ean, pais);
 if (local?.length) resultadosHTML.push(...local);


  // 2️⃣ Buscar en OpenBeautyFacts si no hubo resultados locales
  if (resultadosHTML.length === 0) {
    resultadoPersonal.innerHTML += `<p><strong>🌐 Consultando OpenBeautyFacts...</strong></p>`;
    const externos = await buscarEnOpenBeautyFactsPersonal('', '', ean, pais);
    if (externos) resultadosHTML.push(...externos);
  }

  // 3️⃣ Mostrar resultados
  if (resultadosHTML.length === 0) {
    resultadoPersonal.innerHTML = `
      <p style="color:red;">❌ Producto no encontrado ni en la base ni en OpenBeautyFacts.</p>
      <p>¿Nos ayudas a registrarlo? 🙌</p>
      <button onclick="mostrarFormularioRegistroPersonal()">📝 Registrar manualmente</button>
    `;
  } else {
    resultadoPersonal.innerHTML = `
      <p><strong>🔎 Resultados encontrados (${resultadosHTML.length}):</strong></p>
      ${resultadosHTML.slice(0, 3).join('<hr>')}
    `;
  }

  setTimeout(() => scrollAResultadosPersonal(), 200);
}


async function inicializarListaCamarasPersonal(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const devices = await codeReaderPersonal.getVideoInputDevices();

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
    console.error('❌ Error al inicializar cámaras en Personal:', err);
    select.innerHTML = '<option>Error acceso a cámara</option>';
  }
}


// Seleccionar cámara para matzah
const selectCamaraPersonal = document.getElementById('selectCamaraPersonal');

selectCamaraPersonal?.addEventListener('change', () => {
  if (currentPreviewStream) {
    currentPreviewStream.getTracks().forEach(track => track.stop());
    currentPreviewStream = null;
  }

  codeReaderPersonal.reset();
  codeReaderPersonal = new ZXing.BrowserBarcodeReader();

  resultadoPersonal.innerHTML = `
    <p style="color:gray;">📷 Cámara reiniciada. Pulsa nuevamente "Escanear código".</p>
  `;
});

function volverAlMenuPersonal() {
  document.title = "Escáner de Productos Lev 11 Éxodo 12";
  document.getElementById("tituloPrincipal").textContent = "Escáner de Productos Lev 11 Éxodo 12";
  document.getElementById('bloquePersonal').style.display = 'none';
  localStorage.removeItem('ultimaSeccionActiva');
}


document.addEventListener('DOMContentLoaded', () => {
  const seccionGuardada = localStorage.getItem("ultimaSeccionActiva");

  if (seccionGuardada === "personal") {
    abrirPersonal();
  } else if (seccionGuardada === "matzah") {
    mostrarSeccionMatzah();
  } else {
    mostrarSeccionTahor(); // por defecto
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const botonBusquedaCodigoPersonal = document.getElementById('botonBusquedaCodigoPersonal');

  if (botonBusquedaCodigoPersonal) {
    botonBusquedaCodigoPersonal.addEventListener('click', () => {
      const ean = document.getElementById('eanEntradaPersonal').value.trim();
      if (!ean || !/^[0-9]{8,14}$/.test(ean)) {
        resultadoPersonal.innerHTML = `<p style="color:red;">⚠️ Debes ingresar un código válido (8 a 14 dígitos).</p>`;
        return;
      }

      buscarSoloPorEanPersonal(ean);
    });
  }
});

const bloqueEscanerPersonal = document.getElementById("codigoManualDetallePersonal");
if (bloqueEscanerPersonal) {
bloqueEscanerPersonal.addEventListener("toggle", (e) => {
  if (e.target.open) {
    solicitarPermisoCamara();

    // Esperar un momento y hacer scroll al preview
    setTimeout(() => {
      const video = document.getElementById("previewElemPersonal");
      if (video) video.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
  }
});

}


async function buscarProductoEnArchivosSoloBase(nombre, marca, ean, pais) {
  const urls = [
    "https://raw.githubusercontent.com/angelos2024/productos/main/base_tahor_tame.json"
  ];

  for (const url of urls) {
    try {
      console.log("🔍 Buscando en:", url);  // 👈 añade esta línea
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) continue;
      const productos = await res.json();

      const resultados = productos.filter(p => {
        const coincideNombre = nombre && p.nombre?.toLowerCase().includes(nombre.toLowerCase());
        const coincideMarca = marca && p.marca?.toLowerCase().includes(marca.toLowerCase());
        const coincideEan = ean && p.ean?.includes(ean);
        const coincidePais = pais && p.pais?.toLowerCase().includes(pais.toLowerCase());

        return (
          (ean && coincideEan) ||
          (nombre && marca && coincideNombre && coincideMarca) ||
          (nombre && coincideNombre) ||
          (marca && coincideMarca)
        ) && (!pais || coincidePais);
      });

     const htmls = resultados.map(p => {
  const ingredientes = p.ingredientes || [];
  const { tameDetectado } = analizarIngredientesPersonal(ingredientes);

  const ingredientesHTML = ingredientes.map(ing => {
    const normalizado = normalizeYsingularizar(ing);
    if (isTamePersonal(normalizado)) {
      return `<span style="color:red; font-weight:bold;">${ing}</span>`;
    } else {
      return `<span>${ing}</span>`;
    }
  }).join(", ");

  const imgHTML = p.imagen ? `<img src="${p.imagen}" style="max-width:200px;">` : "";
  const veredicto = tameDetectado ? '❌ No Apto para uso personal' : '✅ Apto para uso personal';

  return `
    <details class="detalle-producto">
      <summary><strong>${p.nombre}</strong> – ${p.marca} (${p.pais})</summary>
      ${imgHTML}
      <p><strong>Ingredientes:</strong> ${ingredientesHTML}</p>
      <p style="font-weight:bold; color:${tameDetectado ? 'red' : 'green'};">${veredicto}</p>
    </details>
  `;
});


     return htmls; // devuelves array de resultados


    } catch (err) {
      console.warn("❌ Error al buscar en:", url, err);
    }
  }

  return null;
}
