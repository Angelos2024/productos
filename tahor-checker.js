
// tahor-checker.js - Núcleo para verificar ingredientes Tame según Levítico 11


function normalizeBasico(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeYsingularizar(txt) {
  return normalizeBasico(txt)
    .split(" ")
    .map(w => w.endsWith("s") && !w.endsWith("es") ? w.slice(0, -1) : w)
    .join(" ");
}


const listaDudosos = [
  "carboximetilcelulosa","monostearate",
  "mono y diglicéridos",
  "mono- and diglycerides",
  "mono- and diglycerides of fatty acids",
  "monoestearato de glicerilo",
  "monoestearato de sorbitán",
  "monoglicéridos y diglicéridos de ácidos grasos",
    "monoestearato",
  "monoglicéridos",
  "monoglycerides",
  "monostearate",
    "saborizante natural",
  "saborizante artificial",
     "saborizantes naturales",
  "saborizantes artificiales",
  "saborizante idéntico al natural",
  "saborizantes",
  "saborizante",
  "mono y diglicéridos",
  "mono- and diglycerides",
  "mono- and diglycerides of fatty acids",
  "monoestearato de glicerilo",
  "monoestearato de sorbitán",
  "monoglicéridos y diglicéridos de ácidos grasos",
];

function isDudoso(ingredienteOriginal) {
  const normal = normalizeYsingularizar(ingredienteOriginal);

  // Intentar también con plural agregando una "s" al final de cada palabra que no termina en "es"
  const plural = normal
    .split(" ")
    .map(w => (w.endsWith("s") || w.endsWith("es") ? w : w + "s"))
    .join(" ");

  return listaDudosos.some(d => normal.includes(d) || plural.includes(d));
}

// 🟢 Lista blanca: frases que no deben marcarse como Tame
const excepcionesPermitidas = [
  "saborizante natural",
  "saborizante artificial",
  "saborizante idéntico al natural",
  "curcuma",
  "colorante como tartrazina",
  "conservador",
  "antiglutinante"
].map(normalizeYsingularizar);


// 🔴 Frases exactas que deben marcarse como Tame
const ingredientesTameFrases = [
  'CI 75470',
  'E-120',
  'CI natural red 4',
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
  'glicerol',
  'glycerol esters',
  'glycerol',
  'glyceryl',
  'goma laca',
  'grasa animal',
  'grasa de cerdo',
  'laca armin',
  'laca de cochinilla',
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
  'ácido esteárico animal',
  'ésteres de glicerol'
].map(normalizeYsingularizar);

// 🟥 Palabras sueltas que deben marcarse como Tame
const ingredientesTamePalabras = [
  'E120',
  'abeja',
  'glicerol',
  'glicerina',
  'polyglycerol',
  'glycerin',
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

// ✅ Función segura y blindada para detectar Tame
function isTame(ingrediente) {
  if (!ingrediente || typeof ingrediente !== 'string') return false;

  const normal = normalizeYsingularizar(ingrediente);
if (excepcionesPermitidas.some(exc => normal.includes(exc))) return false;
  if (ingredientesTameFrases.includes(normal)) return true;

  const palabras = normal.split(" ");
  return palabras.some(p => ingredientesTamePalabras.includes(p));
}

// 🔍 Analizar lista de ingredientes
function analizarIngredientes(ingredientes) {
  const impuros = ingredientes.filter(i => isTame(i));
  return {
    resultado: impuros.length > 0 ? 'Tame' : 'Tahor',
    ingredientesTame: impuros
  };
}

window.isDudoso = isDudoso;
