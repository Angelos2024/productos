let codeReaderMatzah;
let scanningMatzah = false;

// matzah-main.js – Lógica para la sección de productos sin levadura 🍞

// ✅ Mostrar la sección de Matzah
function abrirMatzah() {
  document.getElementById('menuInicial').style.display = 'none';
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'block';

  document.getElementById('formBusquedaMatzah').style.display = 'block';
  document.getElementById('resultadoMatzah').style.display = 'block';
  document.getElementById('registroManualMatzah').style.display = 'none';

  activarTabMatzah('tabBuscarMatzah');
  document.getElementById('resultadoMatzah').innerHTML = '';
  document.getElementById('mensajeUsuarioMatzah').innerHTML = '';
}

// ✅ Activación de pestañas dentro del bloque Matzah
function activarTabMatzah(idActiva) {
  ['tabBuscarMatzah', 'tabRegistrarMatzah'].forEach(id => {
    const tab = document.getElementById(id);
    if (tab) tab.classList.remove('tab-activa');
  });
  document.getElementById(idActiva)?.classList.add('tab-activa');
}

// ✅ Eventos de pestañas
document.getElementById('tabBuscarMatzah')?.addEventListener('click', () => {
  document.getElementById('formBusquedaMatzah').style.display = 'block';
  document.getElementById('resultadoMatzah').style.display = 'block';
  document.getElementById('registroManualMatzah').style.display = 'none';
  activarTabMatzah('tabBuscarMatzah');
});

document.getElementById('tabRegistrarMatzah')?.addEventListener('click', () => {
  document.getElementById('formBusquedaMatzah').style.display = 'none';
  document.getElementById('resultadoMatzah').style.display = 'none';
  document.getElementById('registroManualMatzah').style.display = 'block';
  activarTabMatzah('tabRegistrarMatzah');
});

document.getElementById('botonBusquedaMatzah')?.addEventListener('click', async () => {
  const nombre = document.getElementById('nombreEntradaMatzah').value.trim();
  const marca = document.getElementById('marcaEntradaMatzah').value.trim();
  const ean = document.getElementById('eanEntradaMatzah')?.value.trim();
  const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";

  if (!ean && (!nombre || !marca)) {
    alert("⚠️ Completa al menos Marca y Nombre, o solo Código de Barras.");
    return;
  }

  document.getElementById('resultadoMatzah').innerHTML = "<p>🔍 Buscando coincidencias...</p>";

  const html = await buscarProductoEnArchivosMatzah(nombre, marca, ean, pais);

  if (html) {
    document.getElementById('resultadoMatzah').innerHTML = html;
  } else if (ean) {
    const offHTML = await buscarEnOpenFoodFactsMatzah(ean);
    document.getElementById('resultadoMatzah').innerHTML = offHTML || `<p style="color:red;">❌ Producto no encontrado en fuentes disponibles.</p>`;
  } else {
    document.getElementById('resultadoMatzah').innerHTML = `<p style="color:red;">❌ Producto no encontrado.</p>`;
  }
});

document.getElementById('formRegistroManualMatzah')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const marca = document.getElementById('marcaManualMatzah').value.trim();
  const nombre = document.getElementById('nombreManualMatzah').value.trim();
  const ean = document.getElementById('eanManualMatzah').value.trim();
  const pais = document.getElementById('paisManualMatzah').value.trim();
  const imagen = document.getElementById('imagenManualMatzah').value.trim();
  const ingredientesTexto = document.getElementById('ingredientesManualMatzah').value.trim();
  const estado = document.querySelector('input[name="estadoMatzah"]:checked')?.value;

  if (!marca || !nombre || !pais || !ingredientesTexto || !estado) {
    document.getElementById('mensajeUsuarioMatzah').innerHTML = "<p style='color:red'>❌ Por favor, completa todos los campos obligatorios.</p>";
    return;
  }

  const producto = {
    marca,
    nombre,
    ean: ean || "sin código",
    pais,
    imagen: imagen || "imagen no disponible",
    ingredientes: ingredientesTexto.split(',').map(i => i.trim()).filter(Boolean),
    estado: estado === "true"
  };

  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: "registrar", producto })
    });

    const json = await res.json();

    if (json.success) {
      document.getElementById('mensajeUsuarioMatzah').innerHTML = "<p style='color:green'>✅ Producto enviado correctamente a revisión.</p>";
      document.getElementById('formRegistroManualMatzah').reset();
    } else {
      throw new Error(json.error || "Error desconocido");
    }
  } catch (err) {
    document.getElementById('mensajeUsuarioMatzah').innerHTML = `<p style='color:red'>❌ Error al registrar el producto: ${err.message}</p>`;
  }
});


async function buscarEnOpenFoodFactsMatzah(ean) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.status !== 1) return null;

    const producto = data.product;
    const ingredientesTexto = producto.ingredients_text || producto.ingredients_tags?.join(', ') || "";
    const ingredientes = ingredientesTexto.split(/[,؛;·•、]/).map(i => i.trim()).filter(Boolean);

    const resultado = analizarIngredientesMatzah(ingredientes);

    let html = `<details class="detalle-producto" open>
      <summary><strong>${producto.product_name || "Producto sin nombre"}</strong> – ${producto.brands || "Marca desconocida"}</summary>
      ${producto.image_url
        ? `<img src="${producto.image_url}" alt="Imagen del producto" style="max-width:200px;">`
        : `<p style="color:gray;">🖼️ Imagen no disponible</p>`}
      <p><strong>Ingredientes:</strong> ${ingredientes.map(i => {
        if (isTame(i)) return `<span style="color:red">${i}</span>`;
        if (isLeudante(i)) return `<span style="color:orange">⚠️ ${i}</span>`;
        return `<span>${i}</span>`;
      }).join(', ')}</p>
    `;

    if (resultado.ingredientesTame.length > 0) {
      html += `<p style="color:red;"><strong>Ingredientes Tame:</strong><br>
        <ul>${resultado.ingredientesTame.map(i => `<li>${i}</li>`).join('')}</ul></p>`;
    }

    if (resultado.ingredientesLeud.length > 0) {
      html += `<p style="color:orange;"><strong>Leudantes detectados:</strong><br>
        <ul>${resultado.ingredientesLeud.map(i => `<li>⚠️ ${i}</li>`).join('')}</ul></p>`;
    }

    html += `<p style="color:${resultado.resultado === 'Tahor' ? 'green' : (resultado.resultado === 'Leudado' ? 'orange' : 'red')}">
      ${resultado.resultado === 'Tahor' ? '✅ Apto para panes sin levadura'
        : resultado.resultado === 'Leudado' ? '⚠️ Contiene ingredientes fermentables'
        : '❌ Contiene ingredientes impuros'}
    </p></details>`;

    return html;
  } catch (err) {
    console.error("❌ Error en OpenFoodFacts:", err);
    return null;
  }
}


// ✅ Búsqueda por código de barras: botón rápido
document.getElementById('botonBuscarRapidoMatzah')?.addEventListener('click', () => {
  document.getElementById('botonBusquedaMatzah').click();
});

document.getElementById('escanearCodigoMatzah')?.addEventListener('click', async () => {
  const videoId = "videoMatzah";
  const selectCamara = document.getElementById("selectCamaraMatzah");
  const inputEAN = document.getElementById("eanEntradaMatzah");

  // Crea el lector
  if (!codeReaderMatzah) {
    codeReaderMatzah = new ZXing.BrowserMultiFormatReader();
    const devices = await ZXing.BrowserCodeReader.listVideoInputDevices();
    selectCamara.innerHTML = devices.map(d => `<option value="${d.deviceId}">${d.label || 'Cámara'}</option>`).join('');
  }

  const selectedDeviceId = selectCamara.value;
  if (!selectedDeviceId) {
    alert("Selecciona una cámara disponible.");
    return;
  }

  // Evitar escaneos duplicados
  if (scanningMatzah) return;
  scanningMatzah = true;

  // Crear o reutilizar <video>
  let video = document.getElementById(videoId);
  if (!video) {
    video = document.createElement("video");
    video.id = videoId;
    video.style = "width:100%;margin-top:1rem;border:2px solid #ccc;border-radius:6px;";
    document.getElementById("resultadoMatzah").appendChild(video);
  }

  try {
    const result = await codeReaderMatzah.decodeOnceFromVideoDevice(selectedDeviceId, video);
    inputEAN.value = result.text;
    scanningMatzah = false;
    codeReaderMatzah.reset();
    video.remove();
    document.getElementById('botonBusquedaMatzah').click();
  } catch (err) {
    alert("No se pudo escanear el código.");
    scanningMatzah = false;
    video.remove();
  }
});


// ✅ Cargar evento principal
document.getElementById('btnAbrirMatzah')?.addEventListener('click', abrirMatzah);
