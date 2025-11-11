// matzah-checker.js – Verificador para panes sin levadura

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
const excepcionesPermitidasMatzah = [

].map(normalizeYsingularizar);

  // Lista Tame (idéntica a tahor-checker.js pero renombrada internamente)
const ingredientesTameFrasesMatzah = ['CI 75470',
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
    'gelatina',                                  
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
  'glicerol monoestearato',
  'glycerol esters',
  'glycerol monostearate',
  'glyceryl monostearate',
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
  'sorbitan monostearate',
  'ácido esteárico animal',
  'ésteres de glicerol'
].map(normalizeYsingularizar);
const ingredientesTamePalabrasMatzah = [
  'e120', 'e122', 'e123', 'e124', 'e129','glicerol',
  'cochinilla', 'carmín', 'carminico', 'carminic', 'carminic acid',
  'cochineal', 'lac', 'carmine', 'carmines','glicerina', 'polyglycerol',
  'glycerin',  'gelatina',
  'cerdo', 'chancho', 'puerco', 'pig', 'pork', 'swine',
  'caballo', 'burro', 'mulo', 'camel', 'camello', 'horse', 'donkey', 'mule',
  'liebre', 'conejo', 'hare', 'rabbit',
  'perro', 'gato', 'zorro', 'zorrillo', 'dog', 'cat', 'fox', 'skunk',
  'marisco', 'camarón', 'langosta', 'surimi',
  'ostra', 'almeja', 'mejillón', 'calamar', 'pulpo',
  'anguila', 'tiburón', 'ballena', 'mantarraya',
  'shellfish', 'shrimp', 'lobster', 'oyster', 'clam',
  'mussel', 'squid', 'octopus', 'eel', 'shark', 'whale', 'stingray',
  'insecto', 'insect', 'larva', 'worm', 'gusano',
  'escarabajo', 'mosca', 'abeja', 'avispa', 'hormiga',
  'beetle', 'fly', 'bee', 'wasp', 'ant',
  'escorpión', 'scorpion', 'saltamontes', 'grillo', 'locust', 'cricket',
  'rana', 'sapo', 'tortuga', 'serpiente', 'cocodrilo', 'lagarto',
  'frog', 'toad', 'turtle', 'snake', 'crocodile', 'lizard',
  'águila', 'buitre', 'halcón', 'búho', 'cuervo',
  'gaviota', 'murciélago', 'avestruz', 'pelícano',
  'eagle', 'vulture', 'falcon', 'owl', 'raven',
  'seagull', 'bat', 'ostrich', 'pelican',
  'gelatin', 'blood', 'sangre', 'grenetina'
].map(normalizeYsingularizar);

  window.ingredientesLeudantes = [
    "levadura", "fermento", "masa madre", "malta", "vinagre de malta",
    "polvo para hornear", "bicarbonato", "gasificante","vinagre",
    "carbonato", "hidrogenocarbonato","trigo", "gluten",
    "raising agents", "baking powder", "sourdough", "yeast", "malt", "leavening"
  ];



function isLeudante(ing) {
  const normal = normalizeYsingularizar(ing);

  return ingredientesLeudantes.some(leud => {
    const leudNorm = normalizeYsingularizar(leud);
    return normal.includes(leudNorm) || normal.split(" ").includes(leudNorm);
  });
}


function isTameMatzah(ing) {
  if (!ing) return false;

  const normal = normalizeYsingularizar(ing);
  if (!normal) return false;

  if (excepcionesPermitidasMatzah.some(exc => normal.includes(exc))) return false;

  if (ingredientesTameFrasesMatzah.includes(normal)) return true;

  const palabras = normal.split(" ");
  return Array.isArray(ingredientesTamePalabrasMatzah) &&
         palabras.some(p => ingredientesTamePalabrasMatzah.includes(p));
}



  // Función principal para escaneo en sección matzah
function analizarIngredientesMatzah(ingredientes) {
  const lista = Array.isArray(ingredientes) ? ingredientes.filter(Boolean) : [];

  const tame = lista.filter(i => typeof i === 'string' && isTameMatzah(i));
  const leud = lista.filter(i => typeof i === 'string' && !isTameMatzah(i) && isLeudante(i));


  return {
    resultado: tame.length > 0 ? 'Tame'
             : leud.length > 0 ? 'Leudado'
             : 'Tahor',
    ingredientesTame: tame,
    ingredientesLeud: leud
  };
}


  // ✅ Exportar solo las funciones necesarias al ámbito global
  // ✅ Exportar solo las funciones necesarias al ámbito global
  window.isTameMatzah = isTameMatzah;
  window.isLeudante = isLeudante;
  window.analizarIngredientesMatzah = analizarIngredientesMatzah;
  window.isTameMatzah = isTameMatzah; // <-- 👈 esta es la que te falta
})();
