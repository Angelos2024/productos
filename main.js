
let currentPreviewStream = null;

// Desactivar nombre/marca si hay código de barras en Tahor
const eanEntrada = document.getElementById('eanEntrada');
const nombreEntrada = document.getElementById('nombreEntrada');
const marcaEntrada = document.getElementById('marcaEntrada');

eanEntrada?.addEventListener('input', () => {
  const tieneCodigo = eanEntrada.value.trim() !== "";
nombreEntrada.readOnly = tieneCodigo;
marcaEntrada.readOnly = tieneCodigo;
});

function mostrarNotaBusqueda(mensaje) {
  const nota = document.getElementById('notaBusqueda');
  if (!nota) return;

  nota.textContent = mensaje;
  nota.style.display = 'block';

  // Trigger reflow for transition
  void nota.offsetWidth;
  nota.style.opacity = '1';

  // Ocultar después de 4 segundos
  clearTimeout(nota._timeout);
  nota._timeout = setTimeout(() => {
    nota.style.opacity = '0';
    setTimeout(() => {
      nota.style.display = 'none';
    }, 500);
  }, 4000);
}
function protegerCampoBloqueado(input, mensajeFuncion) {
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
      input.blur(); // quita el foco para evitar confusión
    }
  });
}



// Tahor
protegerCampoBloqueado(nombreEntrada, mostrarNotaBusqueda);
protegerCampoBloqueado(marcaEntrada, mostrarNotaBusqueda);


marcaEntrada.addEventListener('click', (e) => {
  if (marcaEntrada.disabled) {
    mostrarNotaBusqueda("⚠️ Solo puedes buscar por nombre/marca o por código. Borra uno para activar el otro.");
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

const botonBusqueda = document.getElementById('botonBusqueda');
const botonBusquedaCodigo = document.getElementById('botonBusquedaCodigo');
if (botonBusquedaCodigo) {
  botonBusquedaCodigo.addEventListener('click', () => {
    botonBusqueda?.click(); // simula el clic en el botón original
  });
}

const botonBuscarRapido = document.getElementById('botonBuscarRapido');
botonBuscarRapido?.addEventListener('click', () => {
  const ean = document.getElementById('eanEntrada').value.trim();
  if (!ean) {
    alert("⚠️ Introduce un código de barras.");
    return;
  }
  buscarSoloPorEan(ean); // buscar aunque sea inválido o no esté
});


const escanearCodigoBtn = document.getElementById('escanearCodigo');
const resultadoDiv = document.getElementById('analisisResultado');
const registroManualDiv = document.getElementById('registroManual');
const mensajeUsuario = document.getElementById('mensajeUsuario');

let marcaGlobal = '';
let nombreGlobal = '';
let eanGlobal = '';

// --- Cámara y escaneo
let codeReader = new ZXing.BrowserMultiFormatReader(); // detecta EAN-13 y más

 // ← sin argumentos
if (escanearCodigoBtn) {



const selectCamara = document.getElementById('selectCamara');


escanearCodigoBtn.addEventListener('click', async () => {


  // 🔄 Obtener lista de cámaras en el momento del escaneo
try {
  // 🔒 Paso 1: Solicitar permiso explícito antes de listar
  await navigator.mediaDevices.getUserMedia({ video: true });
} catch (err) {
  console.error("❌ Permiso denegado para la cámara:", err);
  selectCamara.innerHTML = '<option>❌ Permiso de cámara denegado</option>';
  return;
}

let devices = [];
try {
  // 📷 Paso 2: Obtener lista de cámaras ahora con permiso
  devices = await codeReader.getVideoInputDevices();
// 🧠 Guardar la selección actual si existe
const camaraAnterior = selectCamara.value;

selectCamara.innerHTML = '';
devices.forEach((device, index) => {
  const option = document.createElement('option');
  option.value = device.deviceId;
  option.text = device.label || `Cámara ${index + 1}`;
  selectCamara.appendChild(option);
});

// 🔁 Volver a seleccionar la misma si sigue existiendo
const existeAun = devices.some(d => d.deviceId === camaraAnterior);
if (existeAun) {
  selectCamara.value = camaraAnterior;
} else if (devices.length > 0) {
  selectCamara.value = devices[0].deviceId; // fallback
}


} catch (err) {
  console.error('❌ No se pudo listar dispositivos de cámara:', err);
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
previewElem.setAttribute('id', 'previewElem');
previewElem.setAttribute('style', `
  width: 100%;
  max-width: 480px;
  margin: 1rem auto;
  display: block;
  border: 3px dashed #3498db;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
`);

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
codeReader = new ZXing.BrowserMultiFormatReader(); // ✅ usa el mismo tipo que arriba


    resultadoDiv.innerHTML = '<p style="color:gray;">⛔ Escaneo cancelado por el usuario.</p>';
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

  codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, err) => {
  if (result) {
    document.getElementById('eanEntrada').value = result.text;

    // Lanzar búsqueda automática
    buscarSoloPorEan(result.text);

    // Detener escaneo al detectar
    codeReader.reset();
    if (currentPreviewStream) {
      currentPreviewStream.getTracks().forEach(track => track.stop());
      currentPreviewStream = null;
    }
  }
});



 

  } catch (err) {
    console.error('❌ Error escaneando:', err);
    resultadoDiv.innerHTML = '<p style="color:red;">❌ No se pudo leer el código. Intenta nuevamente.</p>';
  } finally {
 
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
  const ean = document.getElementById('eanEntrada').value.trim();
  
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

  // 🔵 AQUÍ agregas el ajuste de color de botones:
  const botonRegistrar = document.getElementById('tabRegistrar');
  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');

  if (bloqueMatzahVisible) {
    if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#895510';
    if (botonRegistrar) botonRegistrar.style.backgroundColor = '#3498db';
  } else {
    if (botonRegistrar) botonRegistrar.style.backgroundColor = '#00695c';
    if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#3498db';
  }

  // 🔵 Después sigue tu flujo normal de búsqueda:

  const pais = document.getElementById('paisFiltro')?.value.trim() || "";

if (!ean && (!marca || !nombre)) {
  return; // no alertar, dejar que botón rápido lo maneje
}


  if (ean && /^[0-9]{8,14}$/.test(ean)) {
    buscarSoloPorEan(ean);
    return;
  }

  marcaGlobal = marca;
  nombreGlobal = nombre;
  eanGlobal = ean;

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando en base local archivo por archivo...</strong></p>';
  scrollAResultados();

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

    let contieneTame = false;

    const htmlIngredientes = ingredientes.map(ing => {
      const normalizado = normalizeYsingularizar(ing);
      if (typeof isTame === "function" && isTame(normalizado)) {
        contieneTame = true;
        return `<span style="color:red; font-weight:bold;">${ing}</span>`;
      } else {
        return `<span>${ing}</span>`;
      }
    }).join(", ");

    const color = contieneTame ? "red" : "green";
    const estado = contieneTame ? "❌ No Apto (Tame)" : "✅ Apto (Tahor)";

    resultadosHTML.push(`
      <details class="detalle-producto">
        <summary><strong>${nombreProducto}</strong></summary>
        ${doc.querySelector('img')?.outerHTML || '<p style="color:gray;">🖼️ Imagen no disponible</p>'}
        <p><strong>Ingredientes:</strong> ${htmlIngredientes}</p>
        <p style="color:${color}; font-weight:bold;">${estado}</p>
      </details>
    `);
  }
}


  if (resultadosHTML.length < 3) {
   resultadoDiv.innerHTML = `
    <div style="text-align:center">
      <div class="spinner"></div>
       <p><strong>🔍 Buscando coincidencias locales...</strong></p>
      <p><strong>🌐 Consultando en más de 3,783,408 productos...</strong></p>
    </div>
  `;
    const resultadoOFF = await buscarEnOpenFoodFacts(nombre, marca, ean, pais);
    if (resultadoOFF) {
      resultadosHTML.push(...resultadoOFF);
    }
  }

  if (resultadosHTML.length > 0) {
    resultadoDiv.innerHTML = `
      <p><strong>🔎 Resultados encontrados (${resultadosHTML.length}):</strong></p>
      ${resultadosHTML.slice(0, 3).join('<hr>')}
    `;
  } else {
    resultadoDiv.innerHTML = `
      <p style="color:red;">❌ Producto no encontrado.</p>
      <p>¿Nos ayudas a registrarlo? 🙌</p>
      <button onclick="mostrarFormularioRegistro()">📝 Registrar manualmente</button>
    `;
  }

  setTimeout(() => {
    scrollAResultados();
  }, 150);
});

function cerrarMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.style.display = 'none';  // 🔥 Oblígalo a cerrar, sin preguntar
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#menu button').forEach(boton => {
    boton.addEventListener('click', () => {
      cerrarMenu(); // 🔥 Cierra sí o sí al dar clic en cualquier botón del menú
    });
  });
});


function abrirTahor() {

  cerrarMenu(); // 👈 Cierra el menú apenas cambias a Tahor
  document.getElementById('bloqueTahor').style.display = 'block';
  document.getElementById('bloqueMatzah').style.display = 'none';


  const titulo = document.getElementById('titulo');
  const tituloPrincipal = document.getElementById('tituloPrincipal');
  if (titulo) titulo.textContent = "🧪 Escáner de Productos Tahor";
  if (tituloPrincipal) tituloPrincipal.textContent = "Escáner de Productos Tahor";

  document.title = "Escáner de Productos Tahor";

  const encabezado = document.getElementById('encabezado');
  if (encabezado) {
    encabezado.classList.remove('pesaj');
    encabezado.classList.add('tahor');
  }

  const botonesFlotantes = document.querySelectorAll('#tabRegistrar, #tabBuscar, #tabBuzon');
  botonesFlotantes.forEach(boton => {
    if (boton) {
      boton.style.backgroundColor = '#00695c';
    }
  });

  const botonRegistrar = document.getElementById('tabRegistrar');
  if (botonRegistrar) botonRegistrar.style.display = 'block';
}


document.getElementById('tabRegistrar').addEventListener('click', () => {
  document.getElementById('formBusquedaProducto').style.display = 'none';
  document.getElementById('analisisResultado').style.display = 'none';
  document.getElementById('registroManual').style.display = 'block';
  activarTab('tabRegistrar');

  // 🔽 Scroll hacia la sección de registro
  const registro = document.getElementById('registroManual');
  if (registro) {
    setTimeout(() => {
      registro.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150); // Da tiempo a que se renderice
  }

  // Oculta botón flotante si aplica
  const boton = document.getElementById('tabRegistrar');
  if (boton) boton.style.display = 'none';
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

  // ➡️ Ocultar el botón flotante
  document.getElementById('tabRegistrar').style.display = 'none';
}


// Añadir pestaña de revisión solo si no existe
function mostrarBuzonAdmin() {
  if (!document.getElementById('tabBuzon')) {
    const nuevaTab = document.createElement('button');
    nuevaTab.id = 'tabBuzon';
    nuevaTab.innerText = '📬 Buzón de revisiones';
    
    // 🔵 AÑADIRLE ESTILO FLOTANTE
    nuevaTab.style.position = 'fixed';
    nuevaTab.style.bottom = '5rem'; // 1 botón arriba de 🔐
    nuevaTab.style.right = '1rem';
    nuevaTab.style.backgroundColor = '#00796b';
    nuevaTab.style.color = 'white';
    nuevaTab.style.border = 'none';
    nuevaTab.style.borderRadius = '12px';
    nuevaTab.style.padding = '0.5rem 1rem';
    nuevaTab.style.zIndex = '9999';
    nuevaTab.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    nuevaTab.style.cursor = 'pointer';

    nuevaTab.addEventListener('click', () => {
      document.getElementById('formBusquedaProducto').style.display = 'none';
      document.getElementById('analisisResultado').style.display = 'none';
      document.getElementById('registroManual').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'none'; // ⬅️ ocultar panel admin
      document.getElementById('buzonRevisiones').style.display = 'block';

      activarTab('tabBuzon');
      cargarPendientes();

      mostrarBotonVolverInicio(); // ⬅️ Mostrar nuevo botón de volver al inicio
    });

    document.body.appendChild(nuevaTab); // No en tabs, sino flotante en body
  }
}

function mostrarBotonVolverInicio() {
  if (!document.getElementById('botonVolverInicio')) {
    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolverInicio';
    botonVolver.innerText = '⬅️ Volver al inicio';
    
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
      // 🛑 Ocultar buzón y panel admin
      document.getElementById('buzonRevisiones').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'none';
      
      // ✅ Mostrar formulario de búsqueda y resultados
      document.getElementById('formBusquedaProducto').style.display = 'block';
      document.getElementById('analisisResultado').style.display = 'block';
      
      // ✅ Restaurar encabezado
      const titulo = document.getElementById('titulo');
      const tituloPrincipal = document.getElementById('tituloPrincipal');
      if (titulo) titulo.textContent = "🧪 Escáner de Productos Tahor";
      if (tituloPrincipal) tituloPrincipal.textContent = "Escáner de Productos Lev 11 Éxodo 12";
      document.title = "Escáner de Productos Tahor";

      // ✅ Activar pestaña de búsqueda
      activarTab('tabBuscar');

      // 🧹 Opcional: eliminar el botón volver
      botonVolver.remove();
    });

    document.body.appendChild(botonVolver);
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
console.log("🌐 Consultando con:", { nombre, marca, ean, pais });

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
      if (resultados.length >= 3) break;
    }

    return resultados.length > 0 ? resultados : null;

  } catch (e) {
    console.error("❌ Error al consultar:", e);
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






function volverAlMenu() {
  document.title = "Escáner de Productos Lev 11 Éxodo 12";
  document.getElementById("tituloPrincipal").textContent = "Escáner de Productos Lev 11 Éxodo 12";
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'none';
  localStorage.removeItem('ultimaSeccionActiva');
}

// 🔁 Llenar select de cámaras desde el inicio
async function inicializarListaCamaras(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const devices = await codeReader.getVideoInputDevices();

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
    console.error('❌ Error al inicializar cámaras:', err);
    select.innerHTML = '<option>Error acceso a cámara</option>';
  }
}




const selectCamara = document.getElementById('selectCamara');

selectCamara.addEventListener('change', () => {
  if (currentPreviewStream) {
    currentPreviewStream.getTracks().forEach(track => track.stop());
    currentPreviewStream = null;
  }

  // Muy importante: resetear lector para evitar bugs de ZXing
   codeReader.reset();
  codeReader = new ZXing.BrowserBarcodeReader();

  // Informar al usuario
  resultadoDiv.innerHTML = `
    <p style="color:gray;">📷 Cámara reiniciada. Pulsa nuevamente "Escanear código".</p>
  `;
});

async function buscarSoloPorEan(ean) {
  const pais = document.getElementById('paisFiltro')?.value.trim() || "";

  nombreGlobal = '';
  marcaGlobal = '';
  eanGlobal = ean;

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando solo por Código de Barras...</strong></p>';
  scrollAResultados();

  const resultadosHTML = [];
  const htmlLocales = await buscarProductoEnArchivos('', '', ean, pais);
  if (htmlLocales) resultadosHTML.push(...htmlLocales.split('<hr>'));

  if (resultadosHTML.length < 3) {
    resultadoDiv.innerHTML += `<p><strong>🌐 Consultando...</strong></p>`;
    const resultadoOFF = await buscarEnOpenFoodFacts('', '', ean, pais);
    if (resultadoOFF) resultadosHTML.push(...resultadoOFF);
  }

  if (resultadosHTML.length > 0) {
    resultadoDiv.innerHTML = `
      <p><strong>🔎 Resultados encontrados (${resultadosHTML.length}):</strong></p>
      ${resultadosHTML.slice(0, 3).join('<hr>')}
    `;
  } else {
    resultadoDiv.innerHTML = `
      <p style="color:red;">❌ Producto no encontrado por código de barras.</p>
      <p>¿Nos ayudas a registrarlo? 🙌</p>
      <button onclick="mostrarFormularioRegistro()">📝 Registrar manualmente</button>
    `;
  }

  setTimeout(() => scrollAResultados(), 150);
}

document.addEventListener('DOMContentLoaded', () => {
  abrirTahor(); // 🔁 Entra directamente al verificador Tahor
});

function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    const visible = window.getComputedStyle(menu).display !== 'none';
    menu.style.display = visible ? 'none' : 'block';
  }
}


// 👇 Escucha clics fuera del menú para cerrarlo
document.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const boton = document.querySelector(".menu-boton");

  if (
    menu &&
    menu.style.display === "block" &&
    !menu.contains(e.target) &&
    !boton.contains(e.target)
  ) {
    menu.style.display = "none";
  }
});


function mostrarSeccionTahor() {

  cerrarMenu(); // ⬅️ Agregar aquí
  
  document.getElementById("bloqueTahor").style.display = "block";
  document.getElementById("bloqueMatzah").style.display = "none";
  document.title = "Escáner de Productos Tame / Tahor";
  document.getElementById("tituloPrincipal").textContent = "Escáner de Productos Tahor";
  document.getElementById("titulo").textContent = "🧪 Escáner de Productos Tahor";

  const encabezado = document.getElementById("encabezado");
  if (encabezado) {
    encabezado.classList.remove('pesaj');
    encabezado.classList.add('tahor');
  }

  // 🔥 Cerrar el menú al cambiar de área
  document.getElementById("menu").style.display = "none";



  // 🔥 Cambiar color de botones grandes (tabs)
  const botonRegistrar = document.getElementById('tabRegistrar');
  const botonBuscar = document.getElementById('tabBuscar');
  const botonBuzon = document.getElementById('tabBuzon');
  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  const botonBuscarMatzah = document.getElementById('tabBuscarMatzah');

  if (botonRegistrar) botonRegistrar.style.backgroundColor = '#00695c'; // Verde oscuro Tahor
  if (botonBuscar) botonBuscar.style.backgroundColor = '#00695c';
  if (botonBuzon) botonBuzon.style.backgroundColor = '#00695c';
  if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#3498db'; // Azul normal
  if (botonBuscarMatzah) botonBuscarMatzah.style.backgroundColor = '#3498db';

  // 🔥 Cambiar color de botones pequeños (buscar, buscar rápido, escanear)
  const botonBusqueda = document.getElementById('botonBusqueda');
  const botonBuscarRapido = document.getElementById('botonBuscarRapido');
  const escanearCodigoBtn = document.getElementById('escanearCodigo');

  if (botonBusqueda) botonBusqueda.style.backgroundColor = '#00695c'; // Verde oscuro Tahor
  if (botonBuscarRapido) botonBuscarRapido.style.backgroundColor = '#00695c';
  if (escanearCodigoBtn) escanearCodigoBtn.style.backgroundColor = '#00695c';

  localStorage.setItem("ultimaSeccionActiva", "tahor");
  document.getElementById("menu").style.display = "none";
}

function mostrarSeccionMatzah() {
  cerrarMenu();
  document.getElementById("bloqueTahor").style.display = "none";
  document.getElementById("bloqueMatzah").style.display = "block";
  document.title = "Escáner de Productos para Pésaj";
  document.getElementById("tituloPrincipal").textContent = "Escáner de Productos para Pésaj";
  document.getElementById("titulo").textContent = "🍞 Escáner Pesaj (sin jametz)";

  const encabezado = document.getElementById("encabezado");
  if (encabezado) {
    encabezado.classList.remove('tahor');
    encabezado.classList.add('pesaj');
  }

  // 🔥 Cerrar el menú al cambiar de área
  document.getElementById("menu").style.display = "none";


  // 🔥 Cambiar color de botones grandes (tabs)
  const botonRegistrar = document.getElementById('tabRegistrar');
  const botonBuscar = document.getElementById('tabBuscar');
  const botonBuzon = document.getElementById('tabBuzon');
  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  const botonBuscarMatzah = document.getElementById('tabBuscarMatzah');

  if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#895510'; // Marrón Pesaj
  if (botonBuscarMatzah) botonBuscarMatzah.style.backgroundColor = '#895510';
  if (botonRegistrar) botonRegistrar.style.backgroundColor = '#3498db'; // Azul normal
  if (botonBuscar) botonBuscar.style.backgroundColor = '#3498db';
  if (botonBuzon) botonBuzon.style.backgroundColor = '#3498db';

  // 🔥 Cambiar color de botones pequeños (buscar, buscar rápido, escanear)
  const botonBusquedaMatzah = document.getElementById('botonBusquedaMatzah');
  const botonBuscarRapidoMatzah = document.getElementById('botonBuscarRapidoMatzah');
  const escanearCodigoBtnMatzah = document.getElementById('escanearCodigoMatzah');

  if (botonBusquedaMatzah) botonBusquedaMatzah.style.backgroundColor = '#895510'; // Marrón Pesaj
  if (botonBuscarRapidoMatzah) botonBuscarRapidoMatzah.style.backgroundColor = '#895510';
  if (escanearCodigoBtnMatzah) escanearCodigoBtnMatzah.style.backgroundColor = '#895510';

  localStorage.setItem("ultimaSeccionActiva", "matzah");
  document.getElementById("menu").style.display = "none";

}




document.addEventListener("DOMContentLoaded", () => {
  const seccionGuardada = localStorage.getItem("ultimaSeccionActiva");
  if (seccionGuardada === "matzah") {
    mostrarSeccionMatzah();
  } else {
    mostrarSeccionTahor(); // por defecto
  }
});


function entrarSeccion(tipo) {
  document.getElementById("pantallaInicial").style.display = "none";

  // Mostrar el encabezado y el título
  const titulo = document.getElementById("titulo");
  titulo.style.display = "block";

  // Mostrar botones flotantes
  document.getElementById("tabRegistrar").style.visibility = "visible";
  document.getElementById("adminAccess").style.visibility = "visible";
  document.getElementById("contadorFlotante").style.visibility = "visible";
  document.getElementById("encabezado").style.display = "flex";


  if (tipo === "tahor") {
    titulo.textContent = "🧪 Escáner de Productos Tahor";
    abrirTahor();
    document.getElementById("formBusquedaProducto").style.display = "block";
    document.getElementById("analisisResultado").style.display = "block";
    document.getElementById("registroManual").style.display = "none";
  } else {
    titulo.textContent = "🍞 Escáner de Productos para Pesaj";
    abrirMatzah();
    document.getElementById("formBusquedaMatzah").style.display = "block";
    document.getElementById("resultadoMatzah").style.display = "block";
    document.getElementById("registroManualMatzah").style.display = "none";
  }
}

function irASeccion(tipo) {
  // Ocultar pantalla inicial si aún visible
const pantallaInicial = document.getElementById("pantallaInicial");
if (pantallaInicial) pantallaInicial.style.display = "none";



  // Mostrar título
  const titulo = document.getElementById("titulo");
  titulo.style.display = "block";

  // Mostrar botones flotantes
  document.getElementById("tabRegistrar").style.visibility = "visible";
  document.getElementById("adminAccess").style.visibility = "visible";
  document.getElementById("contadorFlotante").style.visibility = "visible";

  // Cambiar vista según tipo
  if (tipo === "tahor") {
    titulo.textContent = "🧪 Escáner de Productos Tahor";
    abrirTahor();
    document.getElementById("formBusquedaProducto").style.display = "block";
    document.getElementById("analisisResultado").style.display = "block";
    document.getElementById("registroManual").style.display = "none";

    // Ocultar sección Pesaj si estaba activa
    document.getElementById("formBusquedaMatzah").style.display = "none";
    document.getElementById("resultadoMatzah").style.display = "none";
    document.getElementById("registroManualMatzah").style.display = "none";
  } else {
    titulo.textContent = "🍞 Escáner de Productos para Pesaj";
    abrirMatzah();
    document.getElementById("formBusquedaMatzah").style.display = "block";
    document.getElementById("resultadoMatzah").style.display = "block";
    document.getElementById("registroManualMatzah").style.display = "none";

    // Ocultar sección Tahor si estaba activa
    document.getElementById("formBusquedaProducto").style.display = "none";
    document.getElementById("analisisResultado").style.display = "none";
    document.getElementById("registroManual").style.display = "none";
  }
}


async function solicitarPermisoCamara() {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("✅ Permiso de cámara concedido");
  } catch (error) {
    console.warn("❌ Permiso de cámara denegado:", error);
    alert("🚫 Acceso a cámara denegado. Activa permisos manualmente desde la configuración del navegador.");
  }
}

