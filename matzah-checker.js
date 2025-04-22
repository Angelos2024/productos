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

  // Lista Tame (idéntica a tahor-checker.js pero renombrada internamente)
  const ingredientesTameMatzah =[
 // Carmin
  "carmín", "cochinilla", "ácido carmínico", "ácido carminico",
"laca", "laca armin", "laca de cochinilla", "crimson lake",
"natural red 4", "natural rojo 4", "CI 75470", "E120",
"carminic acid", "natural red", "carmesi natural", "ci natural red 4",

  // Carnes impuras
  "cerdo", "chancho", "puerco",
  "caballo", "burro", "mulo",
  "camello", "liebre", "conejo",
  "perro", "gato", "zorro", "zorrillo",

  // Animales marinos sin escamas ni aletas
  "marisco", "camarón", "langosta", "surimi",
  "ostra", "almeja", "mejillón", "calamar", "pulpo",
  "anguila", "tiburón", "ballena", "mantarraya",
 "carmine", "cochineal", "carminic acid", "carminic acid",
"lac", "carmine lac", "cochineal lac", "crimson lake",
"natural red 4", "natural red 4", "CI 75470", "E120",
"carminic acid", "natural red", "natural carmine", "CI natural red 4",

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
  "cuajo animal", "cuajo de cerdo", "enzima animal", "mermelada", "jam",

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

  const ingredientesLeudantes = [
    "levadura", "fermento", "masa madre", "malta", "vinagre de malta",
    "polvo para hornear", "bicarbonato", "gasificante","vinagre",
    "carbonato", "hidrogenocarbonato","trigo", "gluten",
    "raising agents", "baking powder", "sourdough", "yeast", "malt", "leavening"
  ];

  const ingredientesTameNorm = ingredientesTameMatzah.map(normalizeYsingularizar);
  const ingredientesLeudNorm = ingredientesLeudantes.map(normalizeYsingularizar);

  function isTameMatzah(ing) {
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
    const tame = ingredientes.filter(isTameMatzah);
    const leud = ingredientes.filter(i => !isTameMatzah(i) && isLeudante(i));

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
  window.isLeudante = isLeudante;
  window.analizarIngredientesMatzah = analizarIngredientesMatzah;
  window.isTameMatzah = isTameMatzah; // <-- 👈 esta es la que te falta
})();
