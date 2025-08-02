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

const ingredientesTameFrases = [
  'CI 75470',
  'E-120',
  'CI natural red 4',
  'amarillo ocaso',
  'amarillo ocaso FCF',
  'animal collagen',
  'animal enzyme',
  'animal extract',
  'animal fat',
  'animal glycerin',
  'animal glycerol',
  'animal magnesium stearate',
  'animal rennet',
  'animal stearic acid',
  'black pudding',
  'blood sausage',
  'caldo de cerdo',
  'carmesi natural',
  'carmine lac',
  'ci natural red 4',
  'cochineal lac',
  'colorante amarillo ocaso FCF',
  'colágeno animal',
  'colágeno porcino',
  'crimson lake',
  'cuajo animal',
  'cuajo de cerdo',
  'enzima animal',
  'estearato de magnesio animal',
  'extracto animal',
  'extracto de carne de cerdo',
  'gelatina de cerdo',
  'glicerina animal',
  'glicerol animal',
  'glicerol monoestearato',
  'glycerol esters',
  'glycerol monostearate',
  'glyceryl monostearate',
  'goma laca',
  'grasa animal',
  'grasa de cerdo',
  'laca armin',
  'laca de cochinilla',
  'mono y diglicéridos',
  'mono- and diglycerides',
  'mono- and diglycerides of fatty acids',
  'monoestearato de glicerilo',
  'monoestearato de sorbitán',
  'monoglicéridos y diglicéridos de ácidos grasos',
  'natural carmine',
  'natural red',
  'natural red 4',
  'natural rojo 4',
  'negra de cerdo',
  'pepsina porcina',
  'porcine collagen',
  'porcine pepsin',
  'pork broth',
  'pork fat',
  'pork gelatin',
  'pork meat extract',
  'pork rennet',
  'sorbitan monostearate',
  'ácido esteárico animal',
  'ésteres de glicerol'
].map(normalizeYsingularizar);


const ingredientesTamePalabras = [
  'E120',
  'abeja',
  'acetilgliceridos',
  'acetylglycerides',
  'almeja',
  'anguila',
  'ant',
  'avestruz',
  'avispa',
  'ballena',
  'bat',
  'bee',
  'beetle',
  'buitre',
  'burro',
  'búho',
  'caballo',
  'calamar',
  'camarón',
  'camel',
  'camello',
  'carmine',
  'carminic',
  'carminico',
  'carmín',
  'cat',
  'cerdo',
  'chancho',
  'clam',
  'cochineal',
  'cochinilla',
  'cocodrilo',
  'conejo',
  'cricket',
  'crocodile',
  'cuervo',
  'diglicéridos',
  'diglycerides',
  'dog',
  'donkey',
  'e110',
  'e120',
  'e422',
  'e470a',
  'e470b',
  'e471',
  'e472',
  'e473',
  'e474',
  'e475',
  'e904',
  'eagle',
  'eel',
  'escarabajo',
  'escorpión',
  'falcon',
  'fly',
  'fox',
  'frog',
  'gato',
  'gaviota',
  'gelatin',
  'glycerin',
  'glycerol',
  'grenetina',
  'grillo',
  'gusano',
  'halcón',
  'hare',
  'hormiga',
  'horse',
  'insect',
  'insecto',
  'lac',
  'laca',
  'lagarto',
  'langosta',
  'larva',
  'liebre',
  'lizard',
  'lobster',
  'locust',
  'mantarraya',
  'marisco',
  'mejillón',
  'mermelada',
  'monoestearato',
  'monoglicéridos',
  'monoglycerides',
  'monostearate',
  'morcilla',
  'mosca',
  'mule',
  'mulo',
  'murciélago',
  'mussel',
  'octopus',
  'ostra',
  'ostrich',
  'owl',
  'oyster',
  'pelican',
  'pelícano',
  'perro',
  'pig',
  'pork',
  'puerco',
  'pulpo',
  'rabbit',
  'rana',
  'raven',
  'saltamontes',
  'sangre',
  'sapo',
  'scorpion',
  'seagull',
  'serpiente',
  'shrimp',
  'skunk',
  'snake',
  'sorbitan monostearate',
  'squid',
  'stingray',
  'surimi',
  'swine',
  'tiburón',
  'toad',
  'tortuga',
  'turtle',
  'vulture',
  'wasp',
  'whale',
  'worm',
  'zorrillo',
  'zorro'
].map(normalizeYsingularizar);


const excepcionesPermitidas = [
  "saborizante natural",
  "saborizante artificial",
  "saborizante idéntico al natural",
  "curcuma",
  "colorante como tartrazina",
  "conservador",
  "antiglutinante"
].map(normalizeYsingularizar);

function isTame(i) {
  const normal = normalizeYsingularizar(i);

  if (excepcionesPermitidas.some(exc => normal.includes(exc))) return false;

  // Primero buscar coincidencias exactas en frases Tame
  if (ingredientesTameFrases?.some(tame => normal === normalizeYsingularizar(tame))) return true;

  // Luego verificar por palabras sueltas
  const palabras = normal.split(" ");
  return palabras.some(p => ingredientesTamePalabras?.includes(p));
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
  const manuales = producto.ingredientes_tame || [];

  const ingredientes = Array.isArray(producto.ingredientes) ? producto.ingredientes : [];

  const detectados = ingredientes
    .filter(i => !manuales.find(m => normalizeYsingularizar(m.ingrediente) === normalizeYsingularizar(i)))
    .filter(i => isTame(i))
    .map(i => ({ ingrediente: i, razon: "Detectado en lista Tame" }));

  const ingredientesTameDetectados = [...manuales, ...detectados];

  const leudantesDetectados = ingredientes.filter(i =>
    !ingredientesTameDetectados.find(obj => normalizeYsingularizar(obj.ingrediente) === normalizeYsingularizar(i))
    && isLeudante(i)
  );

  const ing = ingredientes.map(i => {
    const normal = normalizeYsingularizar(i);
    if (ingredientesTameDetectados.find(obj => normalizeYsingularizar(obj.ingrediente) === normal)) {
      return `<span style="color:red">${i}</span>`;
    } else if (typeof isLeudante === "function" && isLeudante(i)) {
      return `<span style="color:orange; font-weight:bold;">${i}</span>`;
    } else {
      return `<span>${i}</span>`;
    }
  }).join(', ');

  let html = `
    <details class="detalle-producto">
      <summary><strong>${producto.nombre}</strong> – ${producto.marca} (${producto.pais})</summary>
      ${producto.imagen && producto.imagen !== "imagen no disponible"
        ? `<img src="${producto.imagen}" alt="Imagen del producto" style="max-width:200px;">`
        : `<p style="color:gray;">🖼️ Imagen no disponible</p>`}
      <p><strong>Ingredientes:</strong> ${ing}</p>
  `;

  if (ingredientesTameDetectados.length > 0) {
    html += `<p><strong style="color:red;">Ingredientes Tame detectados:</strong><br>`;
    html += `<ul style="color:red;">${ingredientesTameDetectados.map(obj =>
      `<li><b>${obj.ingrediente}</b>: ${obj.razon}</li>`).join("")}</ul></p>`;
  }

  if (leudantesDetectados.length > 0) {
    html += `<p><strong style="color:orange;">Ingredientes Leudantes detectados:</strong><br>`;
    html += `<ul style="color:orange;">${leudantesDetectados.map(i => `<li><b>${i}</b></li>`).join('')}</ul></p>`;
  }

  const esTame = ingredientesTameDetectados.length > 0;
  const esLeudado = leudantesDetectados.length > 0;

  let mensajeFinal = '';
  let colorFinal = 'green';

  if (esTame && esLeudado) {
    mensajeFinal = '❌ No Apto (Tame y Leudado para Pesaj)';
    colorFinal = 'darkred';
  } else if (esTame) {
    mensajeFinal = '❌ No Apto (Tame)';
    colorFinal = 'red';
  } else if (esLeudado) {
    mensajeFinal = '⚠️ Apto (Tahor) pero Leudado – No apto para Pesaj';
    colorFinal = 'orange';
  } else {
    mensajeFinal = '✅ Apto (Tahor y sin Leudante)';
    colorFinal = 'green';
  }

  html += `<p style="color:${colorFinal}; font-weight:bold;">${mensajeFinal}</p>`;
  html += `</details>`;

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
