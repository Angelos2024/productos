function mostrarMensajeTemporalYEnviar(producto, segundos = 30) {
  const contenedor = document.getElementById("mensajeUsuario");
  contenedor.innerHTML = `
    <div>
      ⏳ 📡 Enviando producto al servidor...<br>
      Espera <strong id="tiempoRestante">${segundos}</strong> segundos mientras se actualiza la base de datos...
      <div id="barraProgreso"><div id="barraProgresoInterna"></div></div>
    </div>
  `;

  let tiempoRestante = segundos;
  const progreso = document.getElementById("barraProgresoInterna");
  const tiempoTexto = document.getElementById("tiempoRestante");

  const intervalo = setInterval(() => {
    tiempoRestante--;
    tiempoTexto.textContent = tiempoRestante;

    const porcentaje = ((segundos - tiempoRestante) / segundos) * 100;
    progreso.style.width = `${porcentaje}%`;

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      enviarProductoAGitHub(producto);
    }
  }, 1000);
}

function enviarProductoAGitHub(producto) {
  fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accion: "registrar", producto })
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al registrar producto");
    document.getElementById("mensajeUsuario").innerHTML = "✅ Producto enviado para revisión. Puedes continuar.";
    localStorage.removeItem("envioEnCurso");
    localStorage.removeItem("envioTiempo");
    document.getElementById("formRegistroManual").reset();
  })
  .catch(err => {
    console.error("❌ Error al registrar producto:", err);
    document.getElementById("mensajeUsuario").innerHTML = "❌ No se pudo registrar el producto.";
    localStorage.removeItem("envioEnCurso");
    localStorage.removeItem("envioTiempo");
  });
}

function verificarConflictoEnvio() {
  const envioActivo = localStorage.getItem("envioEnCurso");
  const tiempoFinal = parseInt(localStorage.getItem("envioTiempo"), 10);
  const ahora = Date.now();

  if (envioActivo && tiempoFinal > ahora) {
    const segundosRestantes = Math.ceil((tiempoFinal - ahora) / 1000);
    document.getElementById("mensajeUsuario").innerHTML = `
      ⏳ Otro usuario está registrando un producto.<br>
      Por favor, espera <strong>${segundosRestantes}</strong> segundos antes de intentar de nuevo.
    `;
    return true;
  }
  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistroManual");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (verificarConflictoEnvio()) return;

    // Extrae el producto del formulario
    const producto = {
      marca: document.getElementById("marcaManual").value.trim(),
      nombre: document.getElementById("nombreManual").value.trim(),
      pais: document.getElementById("paisManual").value.trim(),
      ingredientes: document.getElementById("ingredientesManual").value
        .split(",")
        .map(i => i.trim()),
      tahor: false
    };

    // Marca el envío como en curso por 30 segundos
    const tiempoFuturo = Date.now() + 30000;
    localStorage.setItem("envioEnCurso", "true");
    localStorage.setItem("envioTiempo", tiempoFuturo);

    // Muestra la espera y luego hace el envío real
    mostrarMensajeTemporalYEnviar(producto, 30);
  });
});
