import { BasePokemon, Rarity } from '../types';

const POKEMON_NAMES_GEN4 = [
  "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape",
  "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor",
  "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio",
  "Luxray", "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon",
  "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen",
  "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos",
  "Gastrodon", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny",
  "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky",
  "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny",
  "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", "Munchlax",
  "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion",
  "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke",
  "Snover", "Abomasnow", "Weavile", "Magnezone", "Lickilicky", "Rhyperior",
  "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon",
  "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Probopass",
  "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga",
  "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione",
  "Manaphy", "Darkrai", "Shaymin", "Arceus"
];

const TYPE_MAP_GEN4: { [key: string]: string[] } = {
  Grass: ["Turtwig", "Grotle", "Torterra", "Budew", "Roserade", "Burmy", "Wormadam", "Cherubi", "Cherrim", "Carnivine", "Snover", "Abomasnow", "Tangrowth", "Leafeon", "Shaymin"],
  Fire: ["Chimchar", "Monferno", "Infernape", "Magmortar", "Heatran"],
  Water: ["Piplup", "Prinplup", "Empoleon", "Buizel", "Floatzel", "Shellos", "Gastrodon", "Finneon", "Lumineon", "Mantyke", "Phione", "Manaphy"],
  Electric: ["Shinx", "Luxio", "Luxray", "Pachirisu", "Magnezone", "Electivire", "Rotom"],
  Psychic: ["Mime Jr.", "Chingling", "Bronzor", "Bronzong", "Gallade", "Uxie", "Mesprit", "Azelf", "Cresselia"],
  Fighting: ["Monferno", "Infernape", "Lucario", "Croagunk", "Toxicroak", "Gallade"],
  Poison: ["Budew", "Roserade", "Stunky", "Skuntank", "Skorupi", "Croagunk", "Toxicroak"],
  Ground: ["Torterra", "Gastrodon", "Gible", "Gabite", "Garchomp", "Hippopotas", "Hippowdon", "Rhyperior", "Mamoswine"],
  Flying: ["Starly", "Staravia", "Staraptor", "Mothim", "Vespiquen", "Drifloon", "Drifblim", "Honchkrow", "Chatot", "Mantyke", "Togekiss", "Yanmega", "Gliscor", "Shaymin"],
  Bug: ["Kricketot", "Kricketune", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen", "Skorupi", "Yanmega"],
  Rock: ["Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Bonsly", "Probopass"],
  Ghost: ["Drifloon", "Drifblim", "Mismagius", "Spiritomb", "Dusknoir", "Froslass", "Rotom", "Giratina"],
  Dragon: ["Gible", "Gabite", "Garchomp", "Dialga", "Palkia", "Giratina"],
  Normal: ["Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Ambipom", "Buneary", "Lopunny", "Glameow", "Purugly", "Happiny", "Chatot", "Munchlax", "Lickilicky", "Regigigas", "Arceus"],
  Ice: ["Snover", "Abomasnow", "Weavile", "Glaceon", "Mamoswine", "Froslass"],
  Steel: ["Empoleon", "Shieldon", "Bastiodon", "Bronzor", "Bronzong", "Lucario", "Magnezone", "Probopass", "Dialga", "Heatran"],
  Dark: ["Honchkrow", "Stunky", "Skuntank", "Spiritomb", "Drapion", "Weavile", "Darkrai"],
  Fairy: ["Mime Jr.", "Togekiss"]
};

const EVOLUTION_MAP_GEN4: { [key: number]: number | number[] } = {
  387: 388, 388: 389, // Turtwig
  390: 391, 391: 392, // Chimchar
  393: 394, 394: 395, // Piplup
  396: 397, 397: 398, // Starly
  399: 400, // Bidoof
  401: 402, // Kricketot
  403: 404, 404: 405, // Shinx
  406: 315, // Budew -> Roselia (Gen 3)
  408: 409, // Cranidos
  410: 411, // Shieldon
  412: [413, 414], // Burmy
  415: 416, // Combee
  418: 419, // Buizel
  420: 421, // Cherubi
  422: 423, // Shellos
  190: 424, // Aipom -> Ambipom
  425: 426, // Drifloon
  427: 428, // Buneary
  200: 429, // Misdreavus -> Mismagius
  198: 430, // Murkrow -> Honchkrow
  431: 432, // Glameow
  433: 358, // Chingling -> Chimecho (Gen 3)
  434: 435, // Stunky
  436: 437, // Bronzor
  438: 185, // Bonsly -> Sudowoodo (Gen 2)
  439: 122, // Mime Jr. -> Mr. Mime (Gen 1)
  440: 113, // Happiny -> Chansey (Gen 1)
  443: 444, 444: 445, // Gible
  446: 143, // Munchlax -> Snorlax (Gen 1)
  447: 448, // Riolu
  449: 450, // Hippopotas
  451: 452, // Skorupi
  453: 454, // Croagunk
  456: 457, // Finneon
  458: 226, // Mantyke -> Mantine (Gen 2)
  459: 460, // Snover
  215: 461, // Sneasel -> Weavile
  82: 462,  // Magneton -> Magnezone
  108: 463, // Lickitung -> Lickilicky
  112: 464, // Rhydon -> Rhyperior
  114: 465, // Tangela -> Tangrowth
  125: 466, // Electabuzz -> Electivire
  126: 467, // Magmar -> Magmortar
  176: 468, // Togetic -> Togekiss
  193: 469, // Yanma -> Yanmega
  133: [134, 135, 136, 196, 197, 470, 471], // Eevee
  207: 472, // Gligar -> Gliscor
  221: 473, // Piloswine -> Mamoswine
  233: 474, // Porygon2 -> Porygon-Z
  281: 475, // Kirlia -> Gallade
  299: 476, // Nosepass -> Probopass
  356: 477, // Dusclops -> Dusknoir
  361: 478, // Snorunt -> Froslass
};

const LEGENDARY_IDS_GEN4 = [480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493];
const RARE_IDS_GEN4 = [
  389, 392, 395, 398, 405, 407, 409, 411, 424, 429, 430, 437, 445, 448, 450, 452, 454, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479
];

export const GEN4_POKEMON: BasePokemon[] = POKEMON_NAMES_GEN4.map((name, index) => {
  const id = index + 387;
  const types: string[] = [];
  for (const type in TYPE_MAP_GEN4) {
    if (TYPE_MAP_GEN4[type].includes(name)) {
      types.push(type);
    }
  }
  
  let rarity: Rarity = 'Common';
  if (LEGENDARY_IDS_GEN4.includes(id)) rarity = 'Legendary';
  else if (RARE_IDS_GEN4.includes(id)) rarity = 'Rare';

  return {
    id,
    name,
    types: types.length > 0 ? types : ["Normal"],
    rarity,
    evolvesTo: EVOLUTION_MAP_GEN4[id]
  };
});
