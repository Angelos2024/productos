function mostrarMensajeTemporal(mensaje, segundos = 30) {
  const contenedor = document.getElementById("mensajeUsuario");
  contenedor.innerHTML = `
    <div>
      ⏳ ${mensaje}<br>
      Espera <strong id="tiempoRestante">${segundos}</strong> segundos mientras se actualiza la base de datos...
      <div id="barraProgreso"><div id="barraProgresoInterna"></div></div>
    </div>
  `;

  let tiempoRestante = segundos;
  const progreso = document.getElementById("barraProgresoInterna");
  const tiempoTexto = document.getElementById("tiempoRestante");

  return new Promise(resolve => {
    const intervalo = setInterval(() => {
      tiempoRestante--;
      tiempoTexto.textContent = tiempoRestante;
      progreso.style.width = `${((segundos - tiempoRestante) / segundos) * 100}%`;

      if (tiempoRestante <= 0) {
        clearInterval(intervalo);
        resolve();  // Solo ahora continúa con el fetch
      }
    }, 1000);
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (verificarConflictoEnvio()) return;

    const producto = {
      marca: document.getElementById("marcaManual").value.trim(),
      nombre: document.getElementById("nombreManual").value.trim(),
      pais: document.getElementById("paisManual").value.trim(),
      ingredientes: document.getElementById("ingredientesManual").value
        .split(",")
        .map(i => i.trim()),
      tahor: false
    };

    // Registrar bloqueo local por 30 segundos
    const tiempoFuturo = Date.now() + 30000;
    localStorage.setItem("envioEnCurso", "true");
    localStorage.setItem("envioTiempo", tiempoFuturo);

    // Esperar con animación
    await mostrarMensajeTemporal("📡 Enviando producto al servidor...", 30);

    try {
      const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "registrar", producto })
      });

      if (!res.ok) throw new Error("Error al registrar");

      document.getElementById("mensajeUsuario").innerHTML =
        "✅ Producto enviado para revisión. Puedes continuar.";
      form.reset();
    } catch (err) {
      console.error("❌ Error:", err);
      document.getElementById("mensajeUsuario").innerHTML =
        "❌ No se pudo registrar el producto. Intenta más tarde.";
    } finally {
      localStorage.removeItem("envioEnCurso");
      localStorage.removeItem("envioTiempo");
    }
  });
});
