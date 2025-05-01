async function verificarPendientesActualizado() {
  try {
    // Verificar tiempo local primero
    const localSubida = parseInt(localStorage.getItem("registroManualSubido"), 10);
    const ahora = Date.now();
    if (!isNaN(localSubida) && ahora - localSubida < 60000) {
      return true; // aún está dentro del minuto local
    }

    // Verificación remota con HEAD a pendientes.json
    const res = await fetch("https://angelos2024.github.io/productos/pendientes.json", {
      method: "HEAD",
      cache: "no-cache"
    });

    const modificado = res.headers.get("Last-Modified");
    const fecha = new Date(modificado);
    const segundos = (ahora - fecha) / 1000;

    return segundos < 60;
  } catch (err) {
    console.warn("No se pudo verificar pendientes.json:", err);
    return false; // permitir si falla
  }
}




function mostrarMensajeTemporal(mensaje, segundos = 30, idContenedor = "mensajeUsuario") {
  const contenedor = document.getElementById(idContenedor);
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

  // Restaurar botón Matzah si aplica
  if (idContenedor === "mensajeUsuarioMatzah") {
    const boton = document.getElementById("enviarboton2");
    if (boton) {
      boton.disabled = false;
      boton.textContent = "📝 Registrar producto";
    }
  }

  if (idContenedor === "mensajeUsuario") {
  const boton = document.getElementById("botonrevision1");
  if (boton) {
    boton.disabled = false;
    boton.textContent = "📝 Registrar producto";
  }
}

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

  // 1. Verificación local de bloqueo por tiempo
  if (verificarConflictoEnvio()) {
    return;
  }


  const formMatzah = document.getElementById("formRegistroManualMatzah");
if (formMatzah) {
  formMatzah.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (verificarConflictoEnvio()) return;

    const bloqueadoPorOtro = await verificarPendientesActualizado();
    if (bloqueadoPorOtro) {
      document.getElementById("mensajeUsuarioMatzah").innerHTML = `
        ⏳ Otro usuario acaba de registrar un producto.<br>
        Por favor espera 30 segundos antes de registrar otro.
      `;
      return;
    }

    const producto = {
      marca: document.getElementById("marcaManualMatzah").value.trim(),
      nombre: document.getElementById("nombreManualMatzah").value.trim(),
      pais: document.getElementById("paisManualMatzah").value.trim(),
      ean: document.getElementById("eanManualMatzah").value.trim() || "",
      imagen: document.getElementById("imagenManualMatzah").value.trim() || "imagen no disponible",
      ingredientes: document.getElementById("ingredientesManualMatzah").value
        .split(",")
        .map(i => i.trim()),
      tahor: document.querySelector('input[name="estadoMatzah"]:checked')?.value === "true",
      ingredientes_tame: []
    };

    try {
      document.getElementById("enviarboton2").disabled = true;
document.getElementById("enviarboton2").textContent = "⏳ Enviando...";

      const res = await fetch("https://productos-amber.vercel.app/api/verificador-api-matzah.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "registrar", producto })
      });

      if (!res.ok) {
        document.getElementById("mensajeUsuarioMatzah").innerHTML = "❌ Error al registrar producto.";
        return;
      }

      formMatzah.reset();

      const tiempoFuturo = Date.now() + 30000;
      localStorage.setItem("envioEnCurso", "true");
      localStorage.setItem("registroManualSubido", Date.now());
      localStorage.setItem("envioTiempo", tiempoFuturo);

      mostrarMensajeTemporal("📡 Enviando producto sin jametz...", 30, "mensajeUsuarioMatzah");

} catch (err) {
  document.getElementById("mensajeUsuarioMatzah").innerHTML = "❌ Error de conexión.";
  console.error("Error al enviar Matzah:", err);

  // Restaurar botón si hubo error
  const boton = document.getElementById("enviarboton2");
  if (boton) {
    boton.disabled = false;
    boton.textContent = "📝 Registrar producto";
  }
}

  });
}

  // 2. Verificación remota de actividad reciente
  const otroUsuarioEnProceso = await verificarPendientesActualizado();
  if (otroUsuarioEnProceso) {
    document.getElementById("mensajeUsuario").innerHTML = `
      ⏳ Otro usuario acaba de registrar un producto.<br>
      Por favor espera 30 segundos antes de registrar otro.
    `;
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
      document.getElementById("botonrevision1").disabled = true;
document.getElementById("botonrevision1").textContent = "⏳ Enviando...";

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
      localStorage.setItem("registroManualSubido", Date.now());

      localStorage.setItem("envioTiempo", tiempoFuturo);

      // Mostrar mensaje con barra de progreso
      mostrarMensajeTemporal("📡 Enviando producto al servidor...", 30);

} catch (err) {
  document.getElementById("mensajeUsuario").innerHTML = "❌ Error de conexión.";
  console.error("Error al enviar:", err);

  // Restaurar botón si hubo error
  const boton = document.getElementById("botonrevision1");
  if (boton) {
    boton.disabled = false;
    boton.textContent = "📝 Registrar producto";
  }
}

  });
});
