// tahor-checker.js - Núcleo para verificar ingredientes Tame según Levítico 11

// Lista simplificada sin tradiciones rabínicas
const ingredientesTame = [
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

function isTame(ingrediente) {
  return ingredientesTame.some(tame => ingrediente.includes(tame));
}

function analizarIngredientes(ingredientes) {
  const impuros = ingredientes.filter(i => isTame(i));
  return {
    resultado: impuros.length > 0 ? 'Tame' : 'Tahor',
    ingredientesTame: impuros
  };
}
