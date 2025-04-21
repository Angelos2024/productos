// matzah-checker.js – Verificador para panes sin levadura

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

// Lista Tame (idéntica a tahor-checker.js)
const ingredientesTame = [
  "cerdo", "chancho", "puerco", "caballo", "burro", "mulo", "camello", "liebre", "conejo",
  "perro", "gato", "zorro", "marisco", "camarón", "langosta", "ostra", "almeja", "mejillón",
  "calamar", "pulpo", "anguila", "tiburón", "gelatina", "cochinilla", "carmín", "e120",
  "rana", "sapo", "tortuga", "serpiente", "murciélago", "cuervo", "águila", "búho", "buitre",
  "halcón", "gaviota", "jam", "grenetina", "enzima animal", "cuajo animal", "pork", "lard",
  "gelatin", "sangre", "blood", "pig", "surimi", "cochineal", "donkey", "locust", "lizard"
];

const ingredientesLeudantes = [
  "levadura", "fermento", "masa madre", "malta", "vinagre de malta",
  "polvo para hornear", "bicarbonato", "gasificante",
  "carbonato", "hidrogenocarbonato",
  "raising agents", "baking powder", "sourdough", "yeast", "malt", "leavening"
];

const ingredientesTameNorm = ingredientesTame.map(normalizeYsingularizar);
const ingredientesLeudNorm = ingredientesLeudantes.map(normalizeYsingularizar);

function isTame(ing) {
  const normal = normalizeYsingularizar(ing);
  const palabras = normal.split(" ");
  return palabras.some(p => ingredientesTameNorm.includes(p));
}

function isLeudante(ing) {
  const normal = normalizeYsingularizar(ing);
  const palabras = normal.split(" ");
  return palabras.some(p => ingredientesLeudNorm.includes(p));
}

// Función principal para escaneo en sección matzah
function analizarIngredientesMatzah(ingredientes) {
  const tame = ingredientes.filter(isTame);
  const leud = ingredientes.filter(i => !isTame(i) && isLeudante(i));

  return {
    resultado: tame.length > 0 ? 'Tame'
             : leud.length > 0 ? 'Leudado'
             : 'Tahor',
    ingredientesTame: tame,
    ingredientesLeud: leud
  };
}
