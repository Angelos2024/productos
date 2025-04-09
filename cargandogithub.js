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

  const intervalo = setInterval(() => {
    tiempoRestante--;
    tiempoTexto.textContent = tiempoRestante;

    const porcentaje = ((segundos - tiempoRestante) / segundos) * 100;
    progreso.style.width = `${porcentaje}%`;

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      contenedor.innerHTML = "✅ Producto enviado para revisión. Puedes continuar.";
      localStorage.removeItem("envioEnCurso");
      localStorage.removeItem("envioTiempo");
    }
  }, 1000);
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

    if (verificarConflictoEnvio()) {
      return;
    }

    // Crear objeto producto completo
    const producto = {
      marca: document.getElementById("marcaManual").value.trim(),
      nombre: document.getElementById("nombreManual").value.trim(),
      pais: document.getElementById("paisManual").value.trim(),
      ean: document.getElementById("eanManual").value.trim() || "",
      imagen: document.getElementById("imagenManual").value.trim() || "imagen no disponible",
      ingredientes: document.getElementById("ingredientesManual").value
        .split(",")
        .map(i => i.trim()),
      tahor: document.querySelector('input[name="estadoTahor"]:checked')?.value === "true",
      ingredientes_tame: []  // Se llena luego en revisión
    };

    try {
      // Enviar inmediatamente
      const res = await fetch("https://productos-amber.vercel.app/api/verificador-api.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "registrar", producto })
      });

      if (!res.ok) {
        document.getElementById("mensajeUsuario").innerHTML = "❌ Error al registrar producto.";
        console.error("Error HTTP:", res.status);
        return;
      }

      form.reset(); // Limpiar campos

      // Iniciar bloqueo de nuevos registros por 30 segundos
      const tiempoFuturo = Date.now() + 30000;
      localStorage.setItem("envioEnCurso", "true");
      localStorage.setItem("envioTiempo", tiempoFuturo);

      // Mostrar mensaje con barra de progreso
      mostrarMensajeTemporal("📡 Enviando producto al servidor...", 30);

    } catch (err) {
      document.getElementById("mensajeUsuario").innerHTML = "❌ Error de conexión.";
      console.error("Error al enviar:", err);
    }
  });
});
