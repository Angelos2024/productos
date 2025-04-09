// cargandogithub.js

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
  if (localStorage.getItem("envioEnCurso")) {
    const tiempo = localStorage.getItem("envioTiempo");
    const segundosRestantes = Math.ceil((parseInt(tiempo) - Date.now()) / 1000);
    if (segundosRestantes > 0) {
      document.getElementById("mensajeUsuario").innerHTML = `
        ⏳ Otro usuario está registrando un producto.<br>
        Por favor, espera <strong>${segundosRestantes}</strong> segundos antes de intentar de nuevo.
      `;
      return true;
    }
  }
  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistroManual");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    if (verificarConflictoEnvio()) {
      e.preventDefault();
      return;
    }

    // Marca el envío como en curso
    localStorage.setItem("envioEnCurso", "true");
    localStorage.setItem("envioTiempo", Date.now() + 30000); // 30 seg

    mostrarMensajeTemporal("📡 Enviando producto al servidor...", 30);
  });
});
