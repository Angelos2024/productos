let currentPreviewStreamMatzah = null;

function normalizeYsingularizar(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(w => w.endsWith("s") && !w.endsWith("es") ? w.slice(0, -1) : w)
    .join(" ");
}

function generarHTMLProductoMatzah(producto) {
  const resultado = analizarIngredientesMatzah(producto.ingredientes || []);

  const ingredientesHTML = (producto.ingredientes || []).map(i => {
    if (isTame(i)) return `<span style="color:red">${i}</span>`;
    if (isLeudante(i)) return `<span style="color:orange">⚠️ ${i}</span>`;
    return `<span>${i}</span>`;
  }).join(', ');

  let html = `<details class="detalle-producto" open>
    <summary><strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})</summary>
    ${producto.imagen && producto.imagen !== "imagen no disponible"
      ? `<img src="${producto.imagen}" alt="Imagen del producto" style="max-width:200px; border-radius:6px; margin: 0.5rem 0;">`
      : `<p style="color:gray;">🖼️ Imagen no disponible</p>`}

    <p><strong>Ingredientes:</strong> ${ingredientesHTML}</p>
  `;

  if (resultado.ingredientesTame.length > 0) {
    html += `<p style="color:red;"><strong>Ingredientes Tame:</strong>
      <ul>${resultado.ingredientesTame.map(i => `<li>${i}</li>`).join('')}</ul></p>`;
  }

  if (resultado.ingredientesLeud.length > 0) {
    html += `<p style="color:orange;"><strong>Leudantes detectados:</strong>
      <ul>${resultado.ingredientesLeud.map(i => `<li>⚠️ ${i}</li>`).join('')}</ul></p>`;
  }

  html += `<p style="color:${
    resultado.resultado === 'Tahor' ? 'green' :
    resultado.resultado === 'Leudado' ? 'orange' : 'red'
  }">
    ${
      resultado.resultado === 'Tahor'
        ? '✅ Apto para panes sin levadura'
        : resultado.resultado === 'Leudado'
          ? '⚠️ Contiene ingredientes fermentables'
          : '❌ Contiene ingredientes impuros según Levítico 11'
    }
  </p>`;

  html += `<p style="font-style: italic; color:gray;">
    Evaluación según Levítico 11 y Éxodo 12:15 (Matzah).
  </p>`;

  html += `</details>`;
  return html;
}


async function buscarEnOpenFoodFactsMatzah(ean) {
  if (!ean || !/^[0-9]{8,14}$/.test(ean)) return null;

  const url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const p = data.product;

    if (!p || !p.product_name || (!p.ingredients_text && !p.ingredients)) return null;

    const ingredientes = p.ingredients_text.toLowerCase()
      .split(/,|\./)
      .map(i => i.trim())
      .filter(i => i.length > 1);

    const producto = {
      nombre: p.product_name,
      marca: p.brands || "Marca desconocida",
      pais: p.countries || "País no especificado",
      ean: p.code,
      imagen: p.image_url || "",
      ingredientes,
      esMatzah: true
    };

    return generarHTMLProductoMatzah(producto);

  } catch (err) {
    console.error("❌ Error consultando OpenFoodFacts Matzah:", err);
    return null;
  }
}

async function buscarProductoEnArchivosMatzah(nombre, marca, ean, pais = "") {
  const archivos = ["base_tahor_tame.json"];
  try {
    const resultados = [];

    for (const archivo of archivos) {
     const respuesta = await fetch(`https://productos-amber.vercel.app/${archivo}`);
      const productos = await respuesta.json();

      for (const producto of productos) {
        if (!producto.esMatzah) continue;

        const claveNombre = normalizeYsingularizar(nombre);
        const claveMarca = normalizeYsingularizar(marca);
        const nombreProd = normalizeYsingularizar(producto.nombre || '');
        const marcaProd = normalizeYsingularizar(producto.marca || '');

        const nombreCoincide = nombreProd.includes(claveNombre);
        const marcaCoincide = !claveMarca || marcaProd.includes(claveMarca);
        const eanCoincide = ean && producto.ean && ean === producto.ean;

        if ((nombreCoincide && marcaCoincide) || eanCoincide) {
          resultados.push(generarHTMLProductoMatzah(producto));
          if (resultados.length >= 5) break;
        }
      }

      if (resultados.length >= 5) break;
    }

    return resultados.length > 0 ? resultados.join('<hr>') : null;
  } catch (err) {
    console.error("❌ Error buscando productos en archivos Matzah:", err);
    return null;
  }
}

const botonBusquedaMatzah = document.getElementById('botonBusquedaMatzah');
const botonBuscarRapidoMatzah = document.getElementById('botonBuscarRapidoMatzah');
const escanearCodigoBtnMatzah = document.getElementById('escanearCodigoMatzah');
const resultadoDivMatzah = document.getElementById('resultadoMatzah');
const registroManualDivMatzah = document.getElementById('registroManualMatzah');
const mensajeUsuarioMatzah = document.getElementById('mensajeUsuarioMatzah');

botonBuscarRapidoMatzah?.addEventListener('click', () => {
  botonBusquedaMatzah.click();
});

// --- Cámara y escaneo
if (escanearCodigoBtnMatzah) {
  const codeReader = new ZXing.BrowserBarcodeReader();
  const selectCamara = document.getElementById('selectCamaraMatzah');

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

  escanearCodigoBtnMatzah.addEventListener('click', async () => {
    const selectedDeviceId = selectCamara.value;

    if (currentPreviewStreamMatzah) {
      currentPreviewStreamMatzah.getTracks().forEach(track => track.stop());
      currentPreviewStreamMatzah = null;
    }

    const previewElem = document.createElement('video');
    previewElem.setAttribute('style', 'width:100%; max-width:300px; margin-bottom:1rem;');
    resultadoDivMatzah.innerHTML = `
      <p><strong>📷 Escaneando... permite acceso a la cámara</strong></p>
      <button id="cancelarEscaneoMatzah" style="float:right; background:#e74c3c; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer; font-weight:bold;">❌ Cancelar escaneo</button>
    `;
    resultadoDivMatzah.appendChild(previewElem);

    document.getElementById('cancelarEscaneoMatzah').addEventListener('click', () => {
      if (currentPreviewStreamMatzah) {
        currentPreviewStreamMatzah.getTracks().forEach(track => track.stop());
        currentPreviewStreamMatzah = null;
      }
      codeReader.reset();
      resultadoDivMatzah.innerHTML = '<p style="color:gray;">⛔ Escaneo cancelado por el usuario.</p>';
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
      currentPreviewStreamMatzah = stream;

      const result = await codeReader.decodeOnceFromStream(stream, previewElem);
      document.getElementById('eanEntradaMatzah').value = result.text;
      resultadoDivMatzah.innerHTML = `<p><strong>✅ Código detectado:</strong> ${result.text}</p>`;
      botonBusquedaMatzah.click();

    } catch (err) {
      console.error('Error escaneando:', err);
      resultadoDivMatzah.innerHTML = '<p style="color:red;">❌ No se pudo leer el código. Intenta nuevamente.</p>';
    } finally {
      codeReader.reset();
      if (currentPreviewStreamMatzah) {
        currentPreviewStreamMatzah.getTracks().forEach(track => track.stop());
        currentPreviewStreamMatzah = null;
      }
    }
  });
}

// --- Búsqueda principal
botonBusquedaMatzah?.addEventListener('click', async () => {
  const marca = document.getElementById('marcaEntradaMatzah').value.trim();
  const nombre = document.getElementById('nombreEntradaMatzah').value.trim();
  const ean = document.getElementById('eanEntradaMatzah')?.value.trim();
  const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";

  if (!ean && (!marca || !nombre)) {
    alert("⚠️ Completa al menos Marca y Nombre, o solo Código de Barras.");
    return;
  }

  resultadoDivMatzah.innerHTML = '<p><strong>🔍 Buscando coincidencias...</strong></p>';

  const html = await buscarProductoEnArchivosMatzah(nombre, marca, ean, pais);
  if (html) {
    resultadoDivMatzah.innerHTML = html;
  } else {
    const htmlOFF = await buscarEnOpenFoodFactsMatzah(ean);
    resultadoDivMatzah.innerHTML = htmlOFF || `<p style="color:red;">❌ Producto no encontrado.</p>`;
  }
});

// --- Mostrar sección Matzah
document.getElementById('btnAbrirMatzah')?.addEventListener('click', () => {
  document.getElementById('menuInicial').style.display = 'none';
  document.getElementById('bloqueTahor').style.display = 'none';
  document.getElementById('bloqueMatzah').style.display = 'block';

  document.getElementById('formBusquedaMatzah').style.display = 'block';
  document.getElementById('resultadoMatzah').style.display = 'block';
  document.getElementById('registroManualMatzah').style.display = 'none';

  activarTabMatzah('tabBuscarMatzah');
  resultadoDivMatzah.innerHTML = '';
  mensajeUsuarioMatzah.innerHTML = '';
});

// --- Tabs
function activarTabMatzah(idActiva) {
  ['tabBuscarMatzah', 'tabRegistrarMatzah'].forEach(id => {
    const tab = document.getElementById(id);
    if (tab) tab.classList.remove('tab-activa');
  });
  document.getElementById(idActiva)?.classList.add('tab-activa');
}

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
