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

// ✅ Escaneo simulado por nombre y marca
document.getElementById('botonBusquedaMatzah')?.addEventListener('click', () => {
  const nombre = document.getElementById('nombreEntradaMatzah').value.trim();
  const marca = document.getElementById('marcaEntradaMatzah').value.trim();
  const pais = document.getElementById('paisFiltroMatzah')?.value.trim() || "";

  if (!nombre || !marca) {
    alert("⚠️ Completa Nombre y Marca para buscar.");
    return;
  }

  // 📌 Simulación básica de ingredientes (reemplazar luego con búsqueda real)
  const ingredientes = ["agua", "harina", "levadura", "sal"]; // simulado

  const resultado = analizarIngredientesMatzah(ingredientes);

  let html = `<p><strong>Resultado:</strong> ${resultado.resultado}</p>`;

  if (resultado.ingredientesTame.length > 0) {
    html += `<p style="color:red;">❌ Ingredientes Tame: ${resultado.ingredientesTame.join(', ')}</p>`;
  }
  if (resultado.ingredientesLeud.length > 0) {
    html += `<p style="color:orange;">⚠️ Leudantes: ${resultado.ingredientesLeud.join(', ')}</p>`;
  }
  if (resultado.resultado === "Tahor") {
    html += `<p style="color:green;">✅ Producto apto para panes sin levadura</p>`;
  }

  document.getElementById('resultadoMatzah').innerHTML = html;
});

// ✅ Búsqueda por código de barras: botón rápido
document.getElementById('botonBuscarRapidoMatzah')?.addEventListener('click', () => {
  document.getElementById('botonBusquedaMatzah').click();
});

// ✅ Activar escáner de cámara (en fase futura)
document.getElementById('escanearCodigoMatzah')?.addEventListener('click', () => {
  alert("⚠️ Función de escáner aún no implementada para esta sección.");
});

// ✅ Cargar evento principal
document.getElementById('btnAbrirMatzah')?.addEventListener('click', abrirMatzah);
