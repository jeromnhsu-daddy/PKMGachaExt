import { BasePokemon, Rarity } from '../types';

const POKEMON_NAMES_GEN2 = [
  "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion",
  "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot",
  "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat",
  "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi",
  "Togetic", "Natu", "Xatu", "Mareep", "Flaaffy", "Ampharos",
  "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip",
  "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma",
  "Wooper", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking",
  "Misdreavus", "Unown", "Wobbuffet", "Girafarig", "Pineco", "Forretress",
  "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish",
  "Scizor", "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring",
  "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Remoraid",
  "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom",
  "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle",
  "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank",
  "Blissey", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar",
  "Tyranitar", "Lugia", "Ho-Oh", "Celebi"
];

const TYPE_MAP_GEN2: { [key: string]: string[] } = {
  Grass: ["Chikorita", "Bayleef", "Meganium", "Bellossom", "Hoppip", "Skiploom", "Jumpluff", "Sunkern", "Sunflora", "Celebi"],
  Fire: ["Cyndaquil", "Quilava", "Typhlosion", "Slugma", "Magcargo", "Houndour", "Houndoom", "Ho-Oh"],
  Water: ["Totodile", "Croconaw", "Feraligatr", "Chinchou", "Lanturn", "Marill", "Azumarill", "Politoed", "Wooper", "Quagsire", "Remoraid", "Octillery", "Mantine", "Suicune"],
  Electric: ["Chinchou", "Lanturn", "Pichu", "Mareep", "Flaaffy", "Ampharos", "Elekid", "Raikou"],
  Psychic: ["Natu", "Xatu", "Espeon", "Slowking", "Unown", "Wobbuffet", "Girafarig", "Smoochum", "Celebi", "Lugia"],
  Fighting: ["Tyrogue", "Hitmontop", "Heracross"],
  Poison: ["Spinarak", "Ariados", "Crobat", "Qwilfish"],
  Ground: ["Wooper", "Quagsire", "Gligar", "Steelix", "Swinub", "Piloswine", "Phanpy", "Donphan", "Larvitar", "Pupitar"],
  Flying: ["Hoothoot", "Noctowl", "Ledyba", "Ledian", "Crobat", "Togetic", "Natu", "Xatu", "Hoppip", "Skiploom", "Jumpluff", "Yanma", "Murkrow", "Gligar", "Delibird", "Mantine", "Skarmory", "Lugia", "Ho-Oh"],
  Bug: ["Ledyba", "Ledian", "Spinarak", "Ariados", "Yanma", "Pineco", "Forretress", "Scizor", "Shuckle", "Heracross"],
  Rock: ["Sudowoodo", "Shuckle", "Magcargo", "Corsola", "Larvitar", "Pupitar", "Tyranitar"],
  Ghost: ["Misdreavus"],
  Dragon: ["Kingdra"],
  Normal: ["Sentret", "Furret", "Hoothoot", "Noctowl", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Aipom", "Girafarig", "Dunsparce", "Snubbull", "Granbull", "Teddiursa", "Ursaring", "Stantler", "Smeargle", "Tyrogue", "Miltank", "Blissey"],
  Ice: ["Swinub", "Piloswine", "Delibird", "Smoochum"],
  Steel: ["Forretress", "Steelix", "Scizor", "Skarmory"],
  Dark: ["Umbreon", "Murkrow", "Houndour", "Houndoom", "Sneasel", "Tyranitar"],
  Fairy: ["Cleffa", "Igglybuff", "Togepi", "Togetic", "Marill", "Azumarill", "Snubbull", "Granbull"]
};

const EVOLUTION_MAP_GEN2: { [key: number]: number | number[] } = {
  152: 153, 153: 154, // Chikorita
  155: 156, 156: 157, // Cyndaquil
  158: 159, 159: 160, // Totodile
  161: 162, // Sentret
  163: 164, // Hoothoot
  165: 166, // Ledyba
  167: 168, // Spinarak
  170: 171, // Chinchou
  172: 25, // Pichu -> Pikachu
  173: 35, // Cleffa -> Clefairy
  174: 39, // Igglybuff -> Jigglypuff
  175: 176, 176: 468, // Togepi -> Togetic -> Togekiss
  177: 178, // Natu
  179: 180, 180: 181, // Mareep
  183: 184, // Marill
  187: 188, 188: 189, // Hoppip
  190: 424, // Aipom -> Ambipom
  191: 192, // Sunkern
  193: 469, // Yanma -> Yanmega
  194: 195, // Wooper
  198: 430, // Murkrow -> Honchkrow
  200: 429, // Misdreavus -> Mismagius
  204: 205, // Pineco
  207: 472, // Gligar -> Gliscor
  209: 210, // Snubbull
  215: 461, // Sneasel -> Weavile
  216: 217, // Teddiursa
  218: 219, // Slugma
  220: 221, 221: 473, // Swinub -> Piloswine -> Mamoswine
  223: 224, // Remoraid
  228: 229, // Houndour
  231: 232, // Phanpy
  233: 474, // Porygon2 -> Porygon-Z
  236: [106, 107, 237], // Tyrogue -> Hitmonlee, Hitmonchan, Hitmontop
  238: 124, // Smoochum -> Jynx
  239: 125, // Elekid -> Electabuzz
  240: 126, // Magby -> Magmar
  246: 247, 247: 248, // Larvitar
};

const LEGENDARY_IDS_GEN2 = [243, 244, 245, 249, 250, 251];
const RARE_IDS_GEN2 = [
  154, 157, 160, 169, 181, 182, 184, 186, 196, 197, 199, 208, 212, 214, 227, 230, 233, 241, 242, 248
];

export const GEN2_POKEMON: BasePokemon[] = POKEMON_NAMES_GEN2.map((name, index) => {
  const id = index + 152;
  const types: string[] = [];
  for (const type in TYPE_MAP_GEN2) {
    if (TYPE_MAP_GEN2[type].includes(name)) {
      types.push(type);
    }
  }
  
  let rarity: Rarity = 'Common';
  if (LEGENDARY_IDS_GEN2.includes(id)) rarity = 'Legendary';
  else if (RARE_IDS_GEN2.includes(id)) rarity = 'Rare';

  return {
    id,
    name,
    types: types.length > 0 ? types : ["Normal"],
    rarity,
    evolvesTo: EVOLUTION_MAP_GEN2[id]
  };
});
