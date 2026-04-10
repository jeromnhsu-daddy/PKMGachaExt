import { BasePokemon, Rarity } from '../types';

const POKEMON_NAMES = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
  "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok",
  "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
  "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable",
  "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
  "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat",
  "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck",
  "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
  "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
  "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
  "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
  "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo",
  "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
  "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee",
  "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute",
  "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung",
  "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela",
  "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu",
  "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar",
  "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto",
  "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte",
  "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno",
  "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"
];

const TYPE_MAP: { [key: string]: string[] } = {
  Grass: ["Bulbasaur", "Ivysaur", "Venusaur", "Oddish", "Gloom", "Vileplume", "Bellsprout", "Weepinbell", "Victreebel", "Exeggcute", "Exeggutor", "Tangela", "Paras", "Parasect"],
  Fire: ["Charmander", "Charmeleon", "Charizard", "Vulpix", "Ninetales", "Growlithe", "Arcanine", "Ponyta", "Rapidash", "Magmar", "Flareon", "Moltres"],
  Water: ["Squirtle", "Wartortle", "Blastoise", "Psyduck", "Golduck", "Poliwag", "Poliwhirl", "Poliwrath", "Tentacool", "Tentacruel", "Slowpoke", "Slowbro", "Seel", "Dewgong", "Shellder", "Cloyster", "Krabby", "Kingler", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Magikarp", "Gyarados", "Lapras", "Vaporeon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Articuno", "Dewgong", "Cloyster", "Lapras"],
  Electric: ["Pikachu", "Raichu", "Magnemite", "Magneton", "Voltorb", "Electrode", "Electabuzz", "Jolteon", "Zapdos"],
  Psychic: ["Abra", "Kadabra", "Alakazam", "Drowzee", "Hypno", "Mr. Mime", "Jynx", "Mewtwo", "Mew", "Exeggcute", "Exeggutor", "Slowpoke", "Slowbro", "Starmie"],
  Fighting: ["Mankey", "Primeape", "Machop", "Machoke", "Machamp", "Hitmonlee", "Hitmonchan", "Poliwrath"],
  Poison: ["Bulbasaur", "Ivysaur", "Venusaur", "Weedle", "Kakuna", "Beedrill", "Ekans", "Arbok", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Zubat", "Golbat", "Grimer", "Muk", "Koffing", "Weezing", "Oddish", "Gloom", "Vileplume", "Venonat", "Venomoth", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Gastly", "Haunter", "Gengar"],
  Ground: ["Sandshrew", "Sandslash", "Diglett", "Dugtrio", "Geodude", "Graveler", "Golem", "Cubone", "Marowak", "Rhyhorn", "Rhydon", "Nidoqueen", "Nidoking", "Onix"],
  Flying: ["Pidgey", "Pidgeotto", "Pidgeot", "Spearow", "Fearow", "Farfetch'd", "Doduo", "Dodrio", "Scyther", "Aerodactyl", "Articuno", "Zapdos", "Moltres", "Dragonite", "Charizard", "Butterfree", "Zubat", "Golbat", "Gyarados"],
  Bug: ["Caterpie", "Metapod", "Butterfree", "Paras", "Parasect", "Venonat", "Venomoth", "Pinsir", "Weedle", "Kakuna", "Beedrill", "Scyther"],
  Rock: ["Onix", "Geodude", "Graveler", "Golem", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Rhyhorn", "Rhydon"],
  Ghost: ["Gastly", "Haunter", "Gengar"],
  Dragon: ["Dratini", "Dragonair", "Dragonite"],
  Normal: ["Rattata", "Raticate", "Meowth", "Persian", "Lickitung", "Chansey", "Kangaskhan", "Tauros", "Ditto", "Eevee", "Porygon", "Snorlax", "Pidgey", "Pidgeotto", "Pidgeot", "Spearow", "Fearow", "Jigglypuff", "Wigglytuff", "Farfetch'd", "Doduo", "Dodrio"],
  Ice: ["Articuno", "Dewgong", "Cloyster", "Lapras", "Jynx"]
};

const EVOLUTION_MAP: { [key: number]: number | number[] } = {
  1: 2, 2: 3, // Bulbasaur
  4: 5, 5: 6, // Charmander
  7: 8, 8: 9, // Squirtle
  10: 11, 11: 12, // Caterpie
  13: 14, 14: 15, // Weedle
  16: 17, 17: 18, // Pidgey
  19: 20, // Rattata
  21: 22, // Spearow
  23: 24, // Ekans
  25: 26, // Pikachu
  27: 28, // Sandshrew
  29: 30, 30: 31, // Nidoran F
  32: 33, 33: 34, // Nidoran M
  35: 36, // Clefairy
  37: 38, // Vulpix
  39: 40, // Jigglypuff
  41: 42, 42: 169, // Zubat -> Golbat -> Crobat
  43: 44, 44: 45, // Oddish
  46: 47, // Paras
  48: 49, // Venonat
  50: 51, // Diglett
  52: 53, // Meowth
  54: 55, // Psyduck
  56: 57, // Mankey
  58: 59, // Growlithe
  60: 61, 61: 62, // Poliwag
  63: 64, 64: 65, // Abra
  66: 67, 67: 68, // Machop
  69: 70, 70: 71, // Bellsprout
  72: 73, // Tentacool
  74: 75, 75: 76, // Geodude
  77: 78, // Ponyta
  79: [80, 199], // Slowpoke -> Slowbro, Slowking
  81: 82, 82: 462, // Magnemite -> Magneton -> Magnezone
  84: 85, // Doduo
  86: 87, // Seel
  88: 89, // Grimer
  90: 91, // Shellder
  92: 93, 93: 94, // Gastly
  95: 208, // Onix -> Steelix
  96: 97, // Drowzee
  98: 99, // Krabby
  100: 101, // Voltorb
  102: 103, // Exeggcute
  104: 105, // Cubone
  108: 463, // Lickitung -> Lickilicky
  109: 110, // Koffing
  111: 112, 112: 464, // Rhyhorn -> Rhydon -> Rhyperior
  113: 242, // Chansey -> Blissey
  114: 465, // Tangela -> Tangrowth
  116: 117, 117: 230, // Horsea -> Seadra -> Kingdra
  118: 119, // Goldeen
  120: 121, // Staryu
  123: 212, // Scyther -> Scizor
  125: 466, // Electabuzz -> Electivire
  126: 467, // Magmar -> Magmortar
  129: 130, // Magikarp
  133: [134, 135, 136, 196, 197, 470, 471], // Eevee
  137: 233, // Porygon -> Porygon2
  138: 139, // Omanyte
  140: 141, // Kabuto
  147: 148, 148: 149, // Dratini
};

const LEGENDARY_IDS = [144, 145, 146, 150, 151];
const RARE_IDS = [
  3, 6, 9, 26, 31, 34, 38, 59, 62, 65, 68, 71, 76, 78, 80, 94, 103, 115, 123, 127, 130, 131, 134, 135, 136, 142, 143, 149
];

export const GEN1_POKEMON: BasePokemon[] = POKEMON_NAMES.map((name, index) => {
  const id = index + 1;
  const types: string[] = [];
  for (const type in TYPE_MAP) {
    if (TYPE_MAP[type].includes(name)) {
      types.push(type);
    }
  }
  
  let rarity: Rarity = 'Common';
  if (LEGENDARY_IDS.includes(id)) rarity = 'Legendary';
  else if (RARE_IDS.includes(id)) rarity = 'Rare';

  return {
    id,
    name,
    types: types.length > 0 ? types : ["Normal"],
    rarity,
    evolvesTo: EVOLUTION_MAP[id]
  };
});
