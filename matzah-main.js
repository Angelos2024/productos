
(() => {
  let currentPreviewStream = null;
  
  


function normalizeYsingularizar(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isTameMatzah(i) {
  const normalizado = normalizeYsingularizar(i);
  return ingredientesTameMatzah.some(tame =>
    normalizado.includes(normalizeYsingularizar(tame))
  );
}

function isLeudante(i) {
  const normalizado = normalizeYsingularizar(i);
  return ingredientesLeudantes.some(leu =>
    normalizado.includes(normalizeYsingularizar(leu))
  );
}


const botonBusqueda = document.getElementById('botonBusquedaMatzah');
const botonBuscarRapido = document.getElementById('botonBuscarRapidoMatzah');
botonBuscarRapido?.addEventListener('click', () => {
  botonBusqueda.click();
});
// Manejar cambio de pestañas en Matzah (volver de registro a búsqueda)
document.getElementById('tabBuscarMatzah').addEventListener('click', () => {
  const formBusquedaMatzah = document.getElementById('formBusquedaMatzah');
  const resultadoMatzah = document.getElementById('resultadoMatzah');
  const registroManualMatzah = document.getElementById('registroManualMatzah');
  
  if (formBusquedaMatzah) {
    formBusquedaMatzah.style.display = 'flex'; // Solo muestra
  }

  if (resultadoMatzah) resultadoMatzah.style.display = 'block';
  if (registroManualMatzah) registroManualMatzah.style.display = 'none';

  activarTab('tabBuscarMatzah');

  const botonFlotanteMatzah = document.getElementById('tabRegistrarMatzah');
  if (botonFlotanteMatzah) {
    botonFlotanteMatzah.style.display = 'block';
  }
});




  // Tu código de matzah-main.js

  // 🔵 Aquí agregas esta función pública:
  window.mostrarFormularioRegistroMatzah = function() {
    document.getElementById('formBusquedaMatzah').style.display = 'none';
    document.getElementById('resultadoMatzah').style.display = 'none';
    document.getElementById('registroManualMatzah').style.display = 'block';
    activarTab('tabRegistrarMatzah');

    const mensajeUsuarioMatzah = document.getElementById('mensajeUsuarioMatzah');
    if (mensajeUsuarioMatzah) mensajeUsuarioMatzah.innerHTML = '';

    const botonFlotanteMatzah = document.getElementById('tabRegistrarMatzah');
    if (botonFlotanteMatzah) botonFlotanteMatzah.style.display = 'none';
  };




const escanearCodigoBtn = document.getElementById('escanearCodigoMatzah');
const resultadoDiv = document.getElementById('resultadoMatzah');
const registroManualDiv = document.getElementById('registroManualMatzah');
const mensajeUsuario = document.getElementById('mensajeUsuarioMatzah');


let marcaGlobal = '';
let nombreGlobal = '';
let eanGlobal = '';

// --- Cámara y escaneo
let codeReader = new ZXing.BrowserMultiFormatReader(); // ⬅️ fuera del evento, como en main.js

if (escanearCodigoBtn) {


  escanearCodigoBtn.addEventListener('click', async () => {
    const selectCamara = document.getElementById('selectCamaraMatzah');

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.error("❌ Permiso denegado para la cámara:", err);
      resultadoDiv.innerHTML = '<p style="color:red;">❌ Debes permitir acceso a la cámara.</p>';
      resultadoDiv.style.display = 'block';

      return;
    }

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

      if (!selectCamara.value && devices[0]) {
        selectCamara.value = devices[0].deviceId;
      }

    } catch (err) {
      console.error('❌ No se pudo listar dispositivos de cámara:', err);
      selectCamara.innerHTML = '<option>No se pudo acceder a la cámara</option>';
      return;
    }

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
    resultadoDiv.style.display = 'block';

    resultadoDiv.appendChild(previewElem);

    document.getElementById('cancelarEscaneo').addEventListener('click', () => {
      if (currentPreviewStream) {
        currentPreviewStream.getTracks().forEach(track => track.stop());
        currentPreviewStream = null;
      }
      codeReader.reset();
      resultadoDiv.innerHTML = '<p style="color:gray;">⛔ Escaneo cancelado por el usuario.</p>';
       resultadoDiv.style.display = 'block';
    });

    try {
      const selectedDeviceId = selectCamara.value;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      previewElem.srcObject = stream;
      await previewElem.play().catch(err => console.warn("⚠️ No se pudo reproducir cámara:", err));
      currentPreviewStream = stream;

    codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, err) => {
  if (result) {
    document.getElementById('eanEntradaMatzah').value = result.text;
    buscarSoloPorEanMatzah(result.text);

    codeReader.reset();
    if (currentPreviewStream) {
      currentPreviewStream.getTracks().forEach(track => track.stop());
      currentPreviewStream = null;
    }
  }
}); // <-- CIERRA AQUÍ el decodeFromVideoDevice



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

  });  // 👈 Cierre del addEventListener

}  // ✅ Cierre correcto del if (escanearCodigoBtn)


// --- Búsqueda principal
botonBusqueda.addEventListener('click', async () => {
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

  // 🔥 🔥 🔥 🔥 Aquí pones el nuevo código 🔥 🔥 🔥 🔥
  const botonRegistrar = document.getElementById('tabRegistrar');
  const botonBuscar = document.getElementById('tabBuscar');
  const botonBuzon = document.getElementById('tabBuzon');
  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  const botonBuscarMatzah = document.getElementById('tabBuscarMatzah');

  if (bloqueMatzahVisible) {
    if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#895510'; // Marrón Pesaj
    if (botonBuscarMatzah) botonBuscarMatzah.style.backgroundColor = '#895510';
    if (botonRegistrar) botonRegistrar.style.backgroundColor = '#3498db'; // Azul neutro
    if (botonBuscar) botonBuscar.style.backgroundColor = '#3498db';
    if (botonBuzon) botonBuzon.style.backgroundColor = '#3498db';
  } else {
    if (botonRegistrar) botonRegistrar.style.backgroundColor = '#00695c'; // Verde Tahor
    if (botonBuscar) botonBuscar.style.backgroundColor = '#00695c';
    if (botonBuzon) botonBuzon.style.backgroundColor = '#00695c';
    if (botonRegistrarMatzah) botonRegistrarMatzah.style.backgroundColor = '#3498db'; // Azul neutro
    if (botonBuscarMatzah) botonBuscarMatzah.style.backgroundColor = '#3498db';
  }
  // 🔥 🔥 🔥 🔥 Termina el nuevo código 🔥 🔥 🔥 🔥

  // 🔵 Y después sigues normal con tu flujo de validaciones
  const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";

  if (!ean && (!marca || !nombre)) {
    alert("⚠️ Completa al menos Marca y Nombre, o el Código de Barras.");
    return;
  }

  if (ean && /^[0-9]{8,14}$/.test(ean)) {
    buscarSoloPorEanMatzah(ean);
    return;
  }

  marcaGlobal = marca;
  nombreGlobal = nombre;
  eanGlobal = ean;

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando en base local archivo por archivo...</strong></p>';
  resultadoDiv.style.display = 'block';
  scrollAResultados();

  const resultadosHTML = [];
  const htmlLocales = await buscarProductoEnArchivos(nombre, marca, ean, pais);
  if (htmlLocales) {
    resultadosHTML.push(...htmlLocales.split('<hr>'));
  }

  if (resultadosHTML.length < 5) {
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
      ${resultadosHTML.slice(0, 5).join('<hr>')}
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


function abrirTahor() {

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

window.abrirMatzah = function() {
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'block';

  const titulo = document.getElementById('titulo');
  const tituloPrincipal = document.getElementById('tituloPrincipal');
  if (titulo) titulo.textContent = "🍞 Escáner de Productos para Matzá";
  if (tituloPrincipal) tituloPrincipal.textContent = "Escáner de Productos para Matzá / Sin Levadura";

  document.title = "Escáner de Productos para Matzá / Sin Levadura";

  const encabezado = document.getElementById('encabezado');
  if (encabezado) {
    encabezado.classList.remove('tahor'); // 🔥 Quitar color de Tahor
    encabezado.classList.add('pesaj');     // 🔥 Activar color de Pesaj
  }

  const botonesFlotantes = document.querySelectorAll('#tabRegistrarMatzah, #tabBuscarMatzah');
  botonesFlotantes.forEach(boton => {
    if (boton) {
      boton.style.backgroundColor = '#895510'; // Marrón para Matzah
    }
  });

  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  if (botonRegistrarMatzah) botonRegistrarMatzah.style.display = 'block';
};




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

  resultadoDiv.innerHTML = '';
  mensajeUsuario.innerHTML = '';

  // ➡️ Ocultar el botón flotante de Tahor
  const botonRegistrar = document.getElementById('tabRegistrar');
  if (botonRegistrar) botonRegistrar.style.display = 'none';

  // ➡️ Ocultar también el de Matzah si existe
  const botonRegistrarMatzah = document.getElementById('tabRegistrarMatzah');
  if (botonRegistrarMatzah) botonRegistrarMatzah.style.display = 'none';
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
function restaurarFlexBusquedaMatzah() {
  const formBusquedaMatzah = document.getElementById('formBusquedaMatzah');
  if (formBusquedaMatzah) {
    formBusquedaMatzah.style.display = 'flex';
    if (window.innerWidth >= 768) {
      formBusquedaMatzah.style.flexDirection = 'row';
      formBusquedaMatzah.style.justifyContent = 'center';
      formBusquedaMatzah.style.alignItems = 'flex-start';
    } else {
      formBusquedaMatzah.style.flexDirection = 'column';
    }
    formBusquedaMatzah.style.flexWrap = 'wrap';
    formBusquedaMatzah.style.gap = '1rem';
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


    const etiquetasIgnoradas = ['sans gluten', 'gluten free', 'no gluten', 'sin gluten'];

const ingredientes = prod.ingredients_text.toLowerCase()
  .split(/,|\./)
  .map(i => i.trim())
  .filter(i => i.length > 1 && !etiquetasIgnoradas.includes(i));

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
    console.error("❌ Error al consultar:", e);
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


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistroManualMatzah");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (verificarConflictoEnvioMatzah()) return;

    const producto = {
      marca: document.getElementById("marcaManualMatzah").value.trim(),
      nombre: document.getElementById("nombreManualMatzah").value.trim(),
      pais: document.getElementById("paisManualMatzah").value.trim(),
      ean: document.getElementById("eanManualMatzah").value.trim() || "",
      imagen: document.getElementById("imagenManualMatzah").value.trim() || "imagen no disponible",
      ingredientes: document.getElementById("ingredientesManualMatzah").value
        .split(",")
        .map(i => i.trim()),
      estado: document.querySelector('input[name="estadoMatzah"]:checked')?.value === "true",
      esMatzah: true
    };

    try {
      const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "registrar", producto })
      });

      if (!res.ok) {
        document.getElementById("mensajeUsuarioMatzah").innerHTML = "❌ Error al registrar producto.";
        console.error("Error HTTP:", res.status);
        return;
      }

      form.reset();

      const tiempoFuturo = Date.now() + 30000;
      localStorage.setItem("envioEnCursoMatzah", "true");
      localStorage.setItem("envioTiempoMatzah", tiempoFuturo);

      mostrarMensajeTemporalMatzah("📡 Enviando producto al servidor...", 30);

    } catch (err) {
      document.getElementById("mensajeUsuarioMatzah").innerHTML = "❌ Error al conectar con el servidor.";
      console.error(err);
    }
  });
});

  
function verificarConflictoEnvioMatzah() {
  const envioActivo = localStorage.getItem("envioEnCursoMatzah");
  const tiempoFinal = parseInt(localStorage.getItem("envioTiempoMatzah"), 10);
  const ahora = Date.now();

  if (envioActivo && tiempoFinal > ahora) {
    const segundosRestantes = Math.ceil((tiempoFinal - ahora) / 1000);
    document.getElementById("mensajeUsuarioMatzah").innerHTML = `
      ⏳ Otro usuario está registrando un producto.<br>
      Por favor, espera <strong>${segundosRestantes}</strong> segundos antes de intentar de nuevo.
    `;
    return true;
  }
  return false;
}
function mostrarMensajeTemporalMatzah(mensaje, segundos = 30) {
  const contenedor = document.getElementById("mensajeUsuarioMatzah");
  contenedor.innerHTML = `
    <div>
      ⏳ ${mensaje}<br>
      Espera <strong id="tiempoRestanteMatzah">${segundos}</strong> segundos mientras se actualiza la base de datos...
      <div id="barraProgreso"><div id="barraProgresoInterna" style="width:0%; background:orange; height:8px;"></div></div>
    </div>
  `;

  let tiempoRestante = segundos;
  const progreso = document.getElementById("barraProgresoInterna");
  const tiempoTexto = document.getElementById("tiempoRestanteMatzah");

  const intervalo = setInterval(() => {
    tiempoRestante--;
    tiempoTexto.textContent = tiempoRestante;
    const porcentaje = ((segundos - tiempoRestante) / segundos) * 100;
    progreso.style.width = `${porcentaje}%`;

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      contenedor.innerHTML = "✅ Producto enviado para revisión. Puedes continuar.";
      localStorage.removeItem("envioEnCursoMatzah");
      localStorage.removeItem("envioTiempoMatzah");
    }
  }, 1000);
}

  // 🔁 Llenar select de cámaras desde el inicio
async function inicializarListaCamaras(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const codeReader = new ZXing.BrowserBarcodeReader();
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


 document.getElementById('selectCamaraMatzah')?.addEventListener('change', async () => {
  if (currentPreviewStream) {
    currentPreviewStream.getTracks().forEach(track => track.stop());
    currentPreviewStream = null;
  }

  // Reiniciar escaneo con nueva cámara seleccionada
  const selectedDeviceId = document.getElementById('selectCamaraMatzah').value;
  const previewElem = document.querySelector('#resultadoMatzah video');
  if (!previewElem) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: selectedDeviceId },
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    previewElem.srcObject = stream;
    await previewElem.play().catch(err => console.warn("⚠️ No se pudo reproducir cámara:", err));
    currentPreviewStream = stream;

    codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, err) => {
      if (result) {
        document.getElementById('eanEntradaMatzah').value = result.text;
        buscarSoloPorEanMatzah(result.text);

        codeReader.reset();
        if (currentPreviewStream) {
          currentPreviewStream.getTracks().forEach(track => track.stop());
          currentPreviewStream = null;
        }
      }
    });

  } catch (err) {
    console.error('❌ Error al reiniciar escaneo con nueva cámara:', err);
  }
});

async function buscarSoloPorEanMatzah(ean) {
  const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";

  nombreGlobal = '';
  marcaGlobal = '';
  eanGlobal = ean;

  resultadoDiv.innerHTML = '<p><strong>🔍 Buscando solo por Código de Barras...</strong></p>';
  resultadoDiv.style.display = 'block';

  scrollAResultados();

  const resultadosHTML = [];
  const htmlLocales = await buscarProductoEnArchivos('', '', ean, pais);
  if (htmlLocales) resultadosHTML.push(...htmlLocales.split('<hr>'));

  if (resultadosHTML.length < 5) {
    resultadoDiv.innerHTML += `<p><strong>🌐 Consultando en más de 3,783,408 productos...</strong></p>`;
    const resultadoOFF = await buscarEnOpenFoodFacts('', '', ean, pais);
    if (resultadoOFF) resultadosHTML.push(...resultadoOFF);
  }

  if (resultadosHTML.length > 0) {
    resultadoDiv.innerHTML = `
      <p><strong>🔎 Resultados encontrados (${resultadosHTML.length}):</strong></p>
      ${resultadosHTML.slice(0, 5).join('<hr>')}
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

 })();
