import { BasePokemon, Rarity } from '../types';

const POKEMON_NAMES_GEN3 = [
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken",
  "Mudkip", "Marshtomp", "Swampert", "Poochyena", "Mightyena", "Zigzagoon",
  "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox",
  "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry",
  "Taillow", "Swellow", "Wingull", "Pelipper", "Ralts", "Kirlia",
  "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth",
  "Vigoroth", "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur",
  "Loudred", "Exploud", "Makuhita", "Hariyama", "Azurill", "Nosepass",
  "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon",
  "Aggron", "Meditite", "Medicham", "Electrike", "Manectric", "Plusle",
  "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", "Swalot",
  "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt",
  "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava",
  "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Zangoose",
  "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish",
  "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith",
  "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet",
  "Banette", "Duskull", "Dusclops", "Tropius", "Chimecho", "Absol",
  "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein",
  "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon",
  "Shelgon", "Salamence", "Beldum", "Metang", "Metagross", "Regirock",
  "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon",
  "Rayquaza", "Jirachi", "Deoxys"
];

const TYPE_MAP_GEN3: { [key: string]: string[] } = {
  Grass: ["Treecko", "Grovyle", "Sceptile", "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Shroomish", "Breloom", "Roselia", "Cacnea", "Cacturne", "Lileep", "Cradily", "Tropius", "Celebi"],
  Fire: ["Torchic", "Combusken", "Blaziken", "Numel", "Camerupt", "Torkoal"],
  Water: ["Mudkip", "Marshtomp", "Swampert", "Wingull", "Pelipper", "Lotad", "Lombre", "Ludicolo", "Surskit", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Barboach", "Whiscash", "Corphish", "Crawdaunt", "Feebas", "Milotic", "Castform", "Spheal", "Sealeo", "Walrein", "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Kyogre"],
  Electric: ["Electrike", "Manectric", "Plusle", "Minun"],
  Psychic: ["Ralts", "Kirlia", "Gardevoir", "Meditite", "Medicham", "Spoink", "Grumpig", "Lunatone", "Solrock", "Baltoy", "Claydol", "Chimecho", "Wynaut", "Beldum", "Metang", "Metagross", "Latias", "Latios", "Jirachi", "Deoxys"],
  Fighting: ["Combusken", "Blaziken", "Breloom", "Makuhita", "Hariyama", "Meditite", "Medicham"],
  Poison: ["Dustox", "Roselia", "Gulpin", "Swalot", "Seviper"],
  Ground: ["Marshtomp", "Swampert", "Nincada", "Numel", "Camerupt", "Trapinch", "Vibrava", "Flygon", "Barboach", "Whiscash", "Baltoy", "Claydol", "Groudon"],
  Flying: ["Beautifly", "Taillow", "Swellow", "Wingull", "Pelipper", "Masquerain", "Ninjask", "Swablu", "Altaria", "Tropius", "Salamence", "Rayquaza"],
  Bug: ["Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", "Surskit", "Masquerain", "Nincada", "Ninjask", "Shedinja", "Volbeat", "Illumise", "Anorith", "Armaldo"],
  Rock: ["Nosepass", "Aron", "Lairon", "Aggron", "Lunatone", "Solrock", "Lileep", "Cradily", "Anorith", "Armaldo", "Relicanth", "Regirock"],
  Ghost: ["Shedinja", "Sableye", "Shuppet", "Banette", "Duskull", "Dusclops"],
  Dragon: ["Vibrava", "Flygon", "Altaria", "Bagon", "Shelgon", "Salamence", "Latias", "Latios", "Rayquaza"],
  Normal: ["Zigzagoon", "Linoone", "Slakoth", "Vigoroth", "Slaking", "Whismur", "Loudred", "Exploud", "Azurill", "Skitty", "Delcatty", "Spinda", "Zangoose", "Castform", "Kecleon"],
  Ice: ["Castform", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein", "Regice"],
  Steel: ["Mawile", "Aron", "Lairon", "Aggron", "Beldum", "Metang", "Metagross", "Registeel", "Jirachi"],
  Dark: ["Poochyena", "Mightyena", "Nuzleaf", "Shiftry", "Sableye", "Carvanha", "Sharpedo", "Cacturne", "Crawdaunt", "Absol"],
  Fairy: ["Ralts", "Kirlia", "Gardevoir", "Azurill", "Mawile"]
};

const EVOLUTION_MAP_GEN3: { [key: number]: number | number[] } = {
  252: 253, 253: 254, // Treecko
  255: 256, 256: 257, // Torchic
  258: 259, 259: 260, // Mudkip
  261: 262, // Poochyena
  263: 264, // Zigzagoon
  265: [266, 268], // Wurmple
  266: 267, // Silcoon
  268: 269, // Cascoon
  270: 271, 271: 272, // Lotad
  273: 274, 274: 275, // Seedot
  276: 277, // Taillow
  278: 279, // Wingull
  280: 281, 281: [282, 475], // Ralts -> Kirlia -> Gardevoir, Gallade
  283: 284, // Surskit
  285: 286, // Shroomish
  287: 288, 288: 289, // Slakoth
  290: [291, 292], // Nincada
  293: 294, 294: 295, // Whismur
  296: 297, // Makuhita
  298: 183, // Azurill -> Marill (Gen 2)
  299: 476, // Nosepass -> Probopass
  300: 301, // Skitty
  304: 305, 305: 306, // Aron
  307: 308, // Meditite
  309: 310, // Electrike
  315: 407, // Roselia -> Roserade
  316: 317, // Gulpin
  318: 319, // Carvanha
  320: 321, // Wailmer
  322: 323, // Numel
  325: 326, // Spoink
  328: 329, 329: 330, // Trapinch
  331: 332, // Cacnea
  333: 334, // Swablu
  339: 340, // Barboach
  341: 342, // Corphish
  343: 344, // Baltoy
  345: 346, // Lileep
  347: 348, // Anorith
  348: 349, // Armaldo
  349: 350, // Feebas
  353: 354, // Shuppet
  355: 356, 356: 477, // Duskull -> Dusclops -> Dusknoir
  360: 202, // Wynaut -> Wobbuffet (Gen 2)
  361: [362, 478], // Snorunt -> Glalie, Froslass
  363: 364, 364: 365, // Spheal
  366: [367, 368], // Clamperl
  371: 372, 372: 373, // Bagon
  374: 375, 375: 376, // Beldum
};

const LEGENDARY_IDS_GEN3 = [377, 378, 379, 380, 381, 382, 383, 384, 385, 386];
const RARE_IDS_GEN3 = [
  254, 257, 260, 272, 275, 282, 289, 295, 306, 330, 334, 350, 359, 365, 373, 376
];

export const GEN3_POKEMON: BasePokemon[] = POKEMON_NAMES_GEN3.map((name, index) => {
  const id = index + 252;
  const types: string[] = [];
  for (const type in TYPE_MAP_GEN3) {
    if (TYPE_MAP_GEN3[type].includes(name)) {
      types.push(type);
    }
  }
  
  let rarity: Rarity = 'Common';
  if (LEGENDARY_IDS_GEN3.includes(id)) rarity = 'Legendary';
  else if (RARE_IDS_GEN3.includes(id)) rarity = 'Rare';

  return {
    id,
    name,
    types: types.length > 0 ? types : ["Normal"],
    rarity,
    evolvesTo: EVOLUTION_MAP_GEN3[id]
  };
});
