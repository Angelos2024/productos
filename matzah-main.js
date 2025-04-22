let currentPreviewStreamMatzah = null;

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
