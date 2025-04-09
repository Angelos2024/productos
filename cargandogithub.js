// archivo: envioConfirmacion.js

function mostrarMensajeTemporal(mensaje, segundos = 30) {
  const contenedor = document.getElementById("mensajeUsuario");
  contenedor.innerHTML = `
    ⏳ ${mensaje}<br>
    Espera <strong>${segundos} segundos</strong> mientras se actualiza la base de datos...
  `;

  let tiempoRestante = segundos;
  const intervalo = setInterval(() => {
    tiempoRestante--;
    contenedor.innerHTML = `
      ⏳ ${mensaje}<br>
      Espera <strong>${tiempoRestante} segundos</strong> mientras se actualiza la base de datos...
    `;
    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      contenedor.innerHTML = "✅ Producto enviado para revisión. Puedes continuar.";
      localStorage.removeItem("envioEnCurso");
      localStorage.removeItem("envioTiempo");
    }
  }, 1000);
}

// Verifica si otro envío está en curso
function verificarConflictoEnvio() {
  if (localStorage.getItem("envioEnCurso")) {
    const tiempo = localStorage.getItem("envioTiempo");
    const segundosRestantes = Math.ceil((parseInt(tiempo) - Date.now()) / 1000);
    if (segundosRestantes > 0) {
      document.getElementById("mensajeUsuario").innerHTML = 
        `⏳ Otro usuario está registrando un producto. Por favor, espera ${segundosRestantes} segundos...`;
      return true;
    }
  }
  return false;
}

// Integración con el form actual
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistroManual");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    if (verificarConflictoEnvio()) {
      e.preventDefault();
      return;
    }

    // Marcar envío en curso
    localStorage.setItem("envioEnCurso", "true");
    localStorage.setItem("envioTiempo", Date.now() + 30000); // 30 segundos

    mostrarMensajeTemporal("📡 Enviando producto al servidor...", 30);
  });
});
