(() => {
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

const ingredientesTame = [
  "carmín", "cochinilla", "carminico",
"goma laca", "laca armin", "laca de cochinilla", "crimson lake",
"natural red 4", "natural rojo 4", "CI 75470", "E120","e904",
"carminic", "natural red", "carmesi natural", "ci natural red 4",

  // Carnes impuras
  "cerdo", "chancho", "puerco",
  "amarillo ocaso", "amarillo ocaso FCF", "e110",
  "caballo", "burro", "mulo",
  "camello", "liebre", "conejo",
  "perro", "gato", "zorro", "zorrillo",

  // Animales marinos sin escamas ni aletas
  "marisco", "camarón", "langosta", "surimi",
  "ostra", "almeja", "mejillón", "calamar", "pulpo",
  "anguila", "tiburón", "ballena", "mantarraya",
 "carmine", "cochineal",
"lac", "carmine lac", "cochineal lac", "crimson lake",
"natural red 4", "natural red 4", "CI 75470", "E120", "natural red", "natural carmine", "CI natural red 4",

"pork", "pig", "swine",
"horse", "donkey", "mule",
"camel", "hare", "rabbit",
"dog", "cat", "fox", "skunk",

"shellfish", "shrimp", "lobster", "surimi",
"oyster", "clam", "mussel", "squid", "octopus",
"eel", "shark", "whale", "stingray",


  // Insectos y derivados
  "cochinilla", "carmín", "e120", "insecto", "larva", "gusano",
  "escarabajo", "mosca", "abeja", "avispa", "hormiga",
  "escorpión", "saltamontes", "grillo", // solo algunos son permitidos, pero se eliminan por seguridad

  // Reptiles, anfibios y otros
  "rana", "sapo", "tortuga", "serpiente", "cocodrilo", "lagarto",

  // Aves impuras
  "águila", "buitre", "halcón", "búho", "cuervo",
  "gaviota", "murciélago", "avestruz", "pelícano",

  // Productos derivados de animales impuros
  "gelatina", "gelatina de cerdo", "grasa de cerdo", "grasa animal",
  "cuajo animal", "cuajo de cerdo", "enzima animal","laca", "mermelada", "jam",

  // Sangre
  "sangre", "morcilla", "negra de cerdo",
 "cochineal", "carmine", "e120", "insect", "larva", "worm",
"beetle", "fly", "bee", "wasp", "ant",
"scorpion", "locust", "cricket",

"frog", "toad", "turtle", "snake", "crocodile", "lizard",

"eagle", "vulture", "falcon", "owl", "raven",
"seagull", "bat", "ostrich", "pelican",

"gelatin", "pork gelatin", "pork fat", "animal fat",
"animal rennet", "pork rennet", "animal enzyme", "jam", "jam",

"blood", "blood sausage", "black pudding",


  // Otros
  "colágeno animal", "extracto animal", "caldo de cerdo", "cuajo animal", "enzima animal", "pepsina porcina",
  "colágeno porcino", "glicerina animal", "ácido esteárico animal",
  "estearato de magnesio animal", "extracto de carne de cerdo",
   "e471", "e472", "e470a", "e470b", "e473", "e474", "e475",
  "monoestearato", "monoglicéridos", "diglicéridos", "monoglicéridos y diglicéridos de ácidos grasos",
  "monoestearato de glicerilo", "glicerol monoestearato", "acetilgliceridos",
  "mono y diglicéridos", "ésteres de glicerol", "monoestearato de sorbitán",

  // Glicerina y Glicerol
  "glicerina", "glicerol", "e422", "glicerina animal","grenetina", "glicerol animal",
 "animal collagen", "animal extract", "pork broth", "animal rennet", "animal enzyme", "porcine pepsin",
"porcine collagen", "animal glycerin", "animal stearic acid",
"animal magnesium stearate", "pork meat extract",
"e471", "e472", "e470a", "e470b", "e473", "e474", "e475",
"monostearate", "monoglycerides", "diglycerides", "mono- and diglycerides of fatty acids",
"glyceryl monostearate", "glycerol monostearate", "acetylglycerides",
"mono- and diglycerides", "glycerol esters", "sorbitan monostearate",

"glycerin", "glycerol", "e422", "animal glycerin", "gelatin", "animal glycerol"

];

function isTame(i) {
  const normalizado = normalizeYsingularizar(i);
  return ingredientesTame.some(tame =>
    normalizado.includes(normalizeYsingularizar(tame))
  );
}


const MAX_ARCHIVOS = 7;
const RUTA_BASE = 'https://raw.githubusercontent.com/angelos2024/productos/main/';
const ARCHIVO_BASE_PRINCIPAL = 'base_tahor_tame.json';
const PATRON_ARCHIVO = i => `base/producto${i}.json`;

function mostrarCarga() {
  const div = document.getElementById('analisisResultado');
  div.innerHTML = `
    <div class="cargando">
      <div class="spinner"></div>
      <p>🔄 Revisando base local archivo por archivo...</p>
    </div>
  `;
}

function quitarCarga() {
  const div = document.getElementById('analisisResultado');
  const anim = div.querySelector('.cargando');
  if (anim) anim.remove();
}

function generarHTMLProducto(producto) {
  // 📝 Toma la lista manual si existe
  const manuales = producto.ingredientes_tame || [];

  // 🧠 Detecta dinámicamente ingredientes Tame que no estén ya en la lista manual
  const detectados = producto.ingredientes
    .filter(i => !manuales.find(m => normalizeYsingularizar(m.ingrediente) === normalizeYsingularizar(i)))
    .filter(i => isTame(i))
    .map(i => ({ ingrediente: i, razon: "Detectado en lista Tame" }));

  // 🔁 Combina los dos conjuntos
  const ingredientesTameDetectados = [...manuales, ...detectados];

  // 🎨 Resalta visualmente los ingredientes
  const ing = producto.ingredientes.map(i => {
    return ingredientesTameDetectados.find(obj =>
      normalizeYsingularizar(obj.ingrediente) === normalizeYsingularizar(i))
      ? `<span style="color:red">${i}</span>`
      : `<span>${i}</span>`;
  }).join(', ');

  // 🧾 Construye HTML del producto
  let html = `
    <details class="detalle-producto">
      <summary><strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})</summary>
      ${producto.imagen && producto.imagen !== "imagen no disponible"
        ? `<img src="${producto.imagen}" alt="Imagen del producto" style="max-width:200px;">`
        : `<p style="color:gray;">🖼️ Imagen no disponible</p>`}
      <p><strong>Ingredientes:</strong> ${ing}</p>
  `;

  // 🔴 Lista de ingredientes Tame detectados
  if (ingredientesTameDetectados.length > 0) {
    html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
    html += `<ul style="color:red;">${ingredientesTameDetectados.map(obj =>
      `<li><b>${obj.ingrediente}</b>: ${obj.razon}</li>`).join("")}</ul></p>`;
  }

  // ✅ Veredicto final basado solo en ingredientes
  const esTame = ingredientesTameDetectados.length > 0;
  html += `<p style="color:${esTame ? 'red' : 'green'};">
    ${esTame ? '❌ No Apto (Tame)' : '✅ Apto (Tahor)'}</p>
    </details>
  `;

  return html;
}


async function buscarProductoEnArchivos(nombre, marca, ean, pais = "") {
  mostrarCarga();
  const claveBusqueda = normalizeYsingularizar(`${marca} ${nombre}`);
  const urls = [
    `${RUTA_BASE}${ARCHIVO_BASE_PRINCIPAL}`
  ];

  const coincidencias = [];

  for (const url of urls) {
    try {
      console.log(`🔍 Buscando en: ${url}`);
      const res = await fetch(url);
      if (!res.ok) continue;

      const productos = await res.json();

      for (const producto of productos) {
        const claveProd = normalizeYsingularizar(`${producto.marca} ${producto.nombre}`);
     const eanCoincide = producto.ean && String(producto.ean) === String(ean);

        const paisCoincide = !pais || (producto.pais && producto.pais.toLowerCase() === pais.toLowerCase());

        
      let esCoincidente = false;

if (ean) {
  esCoincidente = producto.ean === ean;
} else {
  esCoincidente =
    claveProd.includes(claveBusqueda) || claveBusqueda.includes(claveProd);
}


        if (esCoincidente && paisCoincide) {
          coincidencias.push(producto);
          if (coincidencias.length >= 5) break;
        }
      }

      if (coincidencias.length >= 5) break;
    } catch (err) {
      console.warn("❌ Error cargando:", url, err);
    }
  }

  quitarCarga();

  if (coincidencias.length === 0) return null;

  return coincidencias.map(generarHTMLProducto).join('<hr>');
}

  window.buscarProductoEnArchivos = buscarProductoEnArchivos;

})();
