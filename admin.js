let productosPendientes = [];

// ✅ Función: Mostrar productos pendientes al administrador
async function mostrarBuzonAdmin() {
  try {
    const res = await fetch('https://productos-amber.vercel.app/api/verificador-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: "listar" })
    });

    const productos = await res.json();
    productosPendientes = [...productos]; // importante para aprobar/rechazar
    const lista = document.getElementById("listaPendientes");
    lista.innerHTML = "";

    const matzah = [];
    const normales = [];

    productos.forEach(p => {
      const contieneLeudante = p.ingredientes?.some(isLeudante);
      if (p.esMatzah || contieneLeudante) matzah.push(p); // detecta si es Matzah
      else normales.push(p);
    });

    if (matzah.length > 0) {
      const h = document.createElement("h3");
      h.textContent = "🍞 Pendientes sección Matzah";
      lista.appendChild(h);
      matzah.forEach((p, i) => lista.appendChild(generarTarjetaProducto(p, i)));
    }

    if (normales.length > 0) {
      const h2 = document.createElement("h3");
      h2.textContent = "🧪 Pendientes sección Tahor";
      lista.appendChild(h2);
      normales.forEach((p, i) => lista.appendChild(generarTarjetaProducto(p, i)));
    }

    if (matzah.length === 0 && normales.length === 0) {
      lista.innerHTML = "<p>✅ No hay productos pendientes en este momento.</p>";
    }

  } catch (err) {
    console.error("❌ Error cargando pendientes:", err);
    document.getElementById("listaPendientes").innerHTML = "<p style='color:red;'>❌ Error al cargar productos pendientes.</p>";
  }
}

// ✅ Función: Crear tarjeta HTML de producto pendiente
function generarTarjetaProducto(producto, index) {
  const div = document.createElement("div");
  div.className = "tarjeta-producto";
  div.style = "border:1px solid #ccc; padding:1rem; margin-bottom:1rem; border-radius:8px; background:#f9f9f9;";
  div.innerHTML = `
    <strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})<br>
    <small><strong>Ingredientes:</strong></small> ${producto.ingredientes?.join(', ') || 'N/A'}<br><br>
    <button onclick="aprobarProducto(${index})">✅ Aprobar</button>
    <button onclick="rechazarProducto(${index})">❌ Rechazar</button>
  `;
  return div;
}

// ✅ Función: Aprobar producto
async function aprobarProducto(index) {
  const producto = productosPendientes[index];
  if (!producto) return;

  try {
    const res = await fetch('/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aprobar', producto })
    });

    if (!res.ok) throw new Error('Error al aprobar');
    mostrarBuzonAdmin();
  } catch (err) {
    console.error('❌ Error al aprobar producto:', err);
  }
}

// ✅ Función: Rechazar producto
async function rechazarProducto(index) {
  const producto = productosPendientes[index];
  if (!producto) return;

  try {
    const res = await fetch('/api/verificador-api.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'rechazar', producto })
    });

    if (!res.ok) throw new Error('Error al rechazar');
    mostrarBuzonAdmin();
  } catch (err) {
    console.error('❌ Error al rechazar producto:', err);
  }
}

// ✅ Exportar funciones al scope global (por seguridad)
window.aprobarProducto = aprobarProducto;
window.rechazarProducto = rechazarProducto;
window.mostrarBuzonAdmin = mostrarBuzonAdmin;
