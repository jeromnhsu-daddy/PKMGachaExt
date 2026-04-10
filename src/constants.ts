import { Arena, Gym } from './types';
import { ALL_POKEMON, getBasePokemon, getGeneration } from './data/pokemon';
export { ALL_POKEMON, getGeneration };

export const GYMS: Gym[] = [
  {
    id: 'pewter',
    name: 'Pewter Gym',
    leader: 'Brock',
    type: 'Rock',
    description: 'The Rock-Solid Pokémon Trainer. His defense is as hard as stone!',
    badge: 'Boulder Badge',
    badgeIcon: '🪨',
    pokemonIds: [74, 75, 95], // Geodude, Graveler, Onix
    reward: 500,
    color: 'bg-stone-600',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'cave',
    buildingIcon: '🏛️',
    regionId: 1
  },
  {
    id: 'cerulean',
    name: 'Cerulean Gym',
    leader: 'Misty',
    type: 'Water',
    description: 'The Tomboyish Mermaid. Her Water Pokémon will wash you away!',
    badge: 'Cascade Badge',
    badgeIcon: '💧',
    pokemonIds: [120, 121, 134], // Staryu, Starmie, Vaporeon
    reward: 600,
    color: 'bg-blue-500',
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'ocean',
    buildingIcon: '🌊',
    regionId: 1
  },
  {
    id: 'vermilion',
    name: 'Vermilion Gym',
    leader: 'Lt. Surge',
    type: 'Electric',
    description: 'The Lightning American. His Electric Pokémon are highly charged!',
    badge: 'Thunder Badge',
    badgeIcon: '⚡',
    pokemonIds: [100, 101, 26], // Voltorb, Electrode, Raichu
    reward: 700,
    color: 'bg-yellow-500',
    bgImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'powerplant',
    buildingIcon: '🏭',
    regionId: 1
  },
  {
    id: 'celadon',
    name: 'Celadon Gym',
    leader: 'Erika',
    type: 'Grass',
    description: 'The Nature-Loving Princess. Her Grass Pokémon are in full bloom!',
    badge: 'Rainbow Badge',
    badgeIcon: '🌈',
    pokemonIds: [71, 114, 45], // Victreebel, Tangela, Vileplume
    reward: 800,
    color: 'bg-emerald-500',
    bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'forest',
    buildingIcon: '🌿',
    regionId: 1
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia Gym',
    leader: 'Koga',
    type: 'Poison',
    description: 'The Poisonous Ninja Master. His Poison Pokémon strike from the shadows!',
    badge: 'Soul Badge',
    badgeIcon: '💜',
    pokemonIds: [109, 110, 89], // Koffing, Weezing, Muk
    reward: 900,
    color: 'bg-purple-600',
    bgImage: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'toxic',
    buildingIcon: '🏯',
    regionId: 1
  },
  {
    id: 'saffron',
    name: 'Saffron Gym',
    leader: 'Sabrina',
    type: 'Psychic',
    description: 'The Master of Psychic Pokémon. She can see your every move!',
    badge: 'Marsh Badge',
    badgeIcon: '🌀',
    pokemonIds: [64, 122, 65], // Kadabra, Mr. Mime, Alakazam
    reward: 1000,
    color: 'bg-pink-600',
    bgImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🔮',
    regionId: 1
  },
  {
    id: 'cinnabar',
    name: 'Cinnabar Gym',
    leader: 'Blaine',
    type: 'Fire',
    description: 'The Hot-Headed Quiz Master. His Fire Pokémon are burning with passion!',
    badge: 'Volcano Badge',
    badgeIcon: '🔥',
    pokemonIds: [78, 126, 59], // Rapidash, Magmar, Arcanine
    reward: 1100,
    color: 'bg-orange-600',
    bgImage: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'volcano',
    buildingIcon: '🌋',
    regionId: 1
  },
  {
    id: 'viridian',
    name: 'Viridian Gym',
    leader: 'Giovanni',
    type: 'Ground',
    description: 'The Earth-Shaking Boss. His Ground Pokémon will rattle your bones!',
    badge: 'Earth Badge',
    badgeIcon: '🌍',
    pokemonIds: [111, 112, 34], // Rhyhorn, Rhydon, Nidoking
    reward: 1200,
    color: 'bg-amber-800',
    bgImage: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🏢',
    regionId: 1
  },
  {
    id: 'lorelei',
    name: 'Elite Four Lorelei',
    leader: 'Lorelei',
    type: 'Ice/Water',
    description: 'The Ice-Cold Elite Four member. Her Pokémon will freeze you in your tracks!',
    badge: "Lorelei's Badge",
    badgeIcon: '❄️',
    pokemonIds: [87, 91, 124, 131], // Dewgong, Cloyster, Jynx, Lapras
    reward: 2000,
    color: 'bg-cyan-600',
    bgImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'glacier',
    buildingIcon: '🏛️',
    regionId: 1,
    isEliteFour: true
  },
  {
    id: 'bruno',
    name: 'Elite Four Bruno',
    leader: 'Bruno',
    type: 'Fighting/Rock',
    description: 'The Master of Fighting Pokémon. He lives for the heat of battle!',
    badge: "Bruno's Badge",
    badgeIcon: '🥊',
    pokemonIds: [106, 107, 95, 68], // Hitmonlee, Hitmonchan, Onix, Machamp
    reward: 2500,
    color: 'bg-red-800',
    bgImage: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🏛️',
    regionId: 1,
    isEliteFour: true
  },
  {
    id: 'agatha',
    name: 'Elite Four Agatha',
    leader: 'Agatha',
    type: 'Ghost/Poison',
    description: 'The Master of Ghost Pokémon. She will haunt your dreams!',
    badge: "Agatha's Badge",
    badgeIcon: '👻',
    pokemonIds: [93, 94, 42, 110], // Haunter, Gengar, Golbat, Weezing
    reward: 3000,
    color: 'bg-indigo-900',
    bgImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🏛️',
    regionId: 1,
    isEliteFour: true
  },
  {
    id: 'lance',
    name: 'Elite Four Lance',
    leader: 'Lance',
    type: 'Dragon/Flying',
    description: 'The Dragon Master. His Dragon Pokémon are legendary!',
    badge: "Lance's Badge",
    badgeIcon: '🐲',
    pokemonIds: [130, 148, 149, 142], // Gyarados, Dragonair, Dragonite, Aerodactyl
    reward: 4000,
    color: 'bg-red-600',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'sky',
    buildingIcon: '🏛️',
    regionId: 1,
    isEliteFour: true
  },
  {
    id: 'champion',
    name: 'Champion Blue',
    leader: 'Blue',
    type: 'Mixed',
    description: 'The Pokémon League Champion. He is the strongest trainer in the world!',
    badge: 'Champion Title',
    badgeIcon: '👑',
    pokemonIds: [18, 65, 112, 130, 103, 6], // Pidgeot, Alakazam, Rhydon, Gyarados, Exeggutor, Charizard
    reward: 10000,
    color: 'bg-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'indigo',
    buildingIcon: '🏆',
    regionId: 1,
    isChampion: true
  },
  // Johto Gyms (Region 2)
  {
    id: 'violet',
    name: 'Violet Gym',
    leader: 'Falkner',
    type: 'Flying',
    description: 'The Elegant Flier! His Flying Pokémon soar through the sky!',
    badge: 'Zephyr Badge',
    badgeIcon: '🕊️',
    pokemonIds: [163, 164, 176], // Hoothoot, Noctowl, Togetic
    reward: 1500,
    color: 'bg-sky-400',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'sky',
    buildingIcon: '🏯',
    regionId: 2
  },
  {
    id: 'azalea',
    name: 'Azalea Gym',
    leader: 'Bugsy',
    type: 'Bug',
    description: 'The Walking Bug Encyclopedia! His Bug Pokémon are swarming!',
    badge: 'Hive Badge',
    badgeIcon: '🐝',
    pokemonIds: [167, 168, 212], // Spinarak, Ariados, Scizor
    reward: 1600,
    color: 'bg-lime-600',
    bgImage: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'forest',
    buildingIcon: '🌿',
    regionId: 2
  },
  {
    id: 'goldenrod',
    name: 'Goldenrod Gym',
    leader: 'Whitney',
    type: 'Normal',
    description: 'The Incredibly Pretty Girl! Her Miltank is a force to be reckoned with!',
    badge: 'Plain Badge',
    badgeIcon: '⚪',
    pokemonIds: [161, 162, 241], // Sentret, Furret, Miltank
    reward: 1800,
    color: 'bg-pink-400',
    bgImage: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🏬',
    regionId: 2
  },
  {
    id: 'ecruteak',
    name: 'Ecruteak Gym',
    leader: 'Morty',
    type: 'Ghost',
    description: 'The Seer of Unseen Things! His Ghost Pokémon are haunting!',
    badge: 'Fog Badge',
    badgeIcon: '🌫️',
    pokemonIds: [200, 198, 215], // Misdreavus, Murkrow, Sneasel
    reward: 2000,
    color: 'bg-indigo-800',
    bgImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🔮',
    regionId: 2
  },
  {
    id: 'cianwood',
    name: 'Cianwood Gym',
    leader: 'Chuck',
    type: 'Fighting',
    description: 'His roaring fists do the talking! His Fighting Pokémon are powerful!',
    badge: 'Storm Badge',
    badgeIcon: '👊',
    pokemonIds: [214, 236, 237], // Heracross, Tyrogue, Hitmontop
    reward: 2100,
    color: 'bg-orange-800',
    bgImage: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🥋',
    regionId: 2
  },
  {
    id: 'olivine',
    name: 'Olivine Gym',
    leader: 'Jasmine',
    type: 'Steel',
    description: 'The Steel-Clad Girl! Her Steel Pokémon are tough as nails!',
    badge: 'Mineral Badge',
    badgeIcon: '🔩',
    pokemonIds: [208, 227, 212], // Steelix, Skarmory, Scizor
    reward: 2200,
    color: 'bg-slate-400',
    bgImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'powerplant',
    buildingIcon: '🏭',
    regionId: 2
  },
  {
    id: 'mahogany',
    name: 'Mahogany Gym',
    leader: 'Pryce',
    type: 'Ice',
    description: 'The Teacher of Winter\'s Harshness! His Ice Pokémon are freezing!',
    badge: 'Glacier Badge',
    badgeIcon: '❄️',
    pokemonIds: [220, 221, 225], // Swinub, Piloswine, Delibird
    reward: 2300,
    color: 'bg-cyan-400',
    bgImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'glacier',
    buildingIcon: '❄️',
    regionId: 2
  },
  {
    id: 'blackthorn',
    name: 'Blackthorn Gym',
    leader: 'Clair',
    type: 'Dragon',
    description: 'The Blessed User of Dragon Pokémon! Her dragons are legendary!',
    badge: 'Rising Badge',
    badgeIcon: '🐉',
    pokemonIds: [230, 230, 247], // Kingdra, Kingdra, Pupitar
    reward: 2500,
    color: 'bg-indigo-700',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'cave',
    buildingIcon: '🏯',
    regionId: 2
  },
  {
    id: 'johto_will',
    name: 'Elite Four Will',
    leader: 'Will',
    type: 'Psychic',
    description: 'The master of Psychic Pokémon. He can see your future!',
    badge: "Will's Badge",
    badgeIcon: '🔮',
    pokemonIds: [178, 196, 199, 202], // Xatu, Espeon, Slowking, Wobbuffet
    reward: 3000,
    color: 'bg-purple-600',
    bgImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🏛️',
    regionId: 2,
    isEliteFour: true
  },
  {
    id: 'johto_koga',
    name: 'Elite Four Koga',
    leader: 'Koga',
    type: 'Poison',
    description: 'The master of Poison Pokémon. He has refined his skills!',
    badge: "Koga's Badge",
    badgeIcon: '🧪',
    pokemonIds: [169, 168, 211, 214], // Crobat, Ariados, Qwilfish, Heracross
    reward: 3500,
    color: 'bg-purple-900',
    bgImage: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'toxic',
    buildingIcon: '🏛️',
    regionId: 2,
    isEliteFour: true
  },
  {
    id: 'johto_bruno',
    name: 'Elite Four Bruno',
    leader: 'Bruno',
    type: 'Fighting',
    description: 'The master of Fighting Pokémon. He has come from Kanto!',
    badge: "Bruno's Badge",
    badgeIcon: '🥊',
    pokemonIds: [237, 237, 214, 208], // Hitmontop, Hitmontop, Heracross, Steelix
    reward: 4000,
    color: 'bg-red-800',
    bgImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🏛️',
    regionId: 2,
    isEliteFour: true
  },
  {
    id: 'johto_karen',
    name: 'Elite Four Karen',
    leader: 'Karen',
    type: 'Dark',
    description: 'The master of Dark Pokémon. She prefers strong Pokémon!',
    badge: "Karen's Badge",
    badgeIcon: '🌑',
    pokemonIds: [197, 198, 215, 229], // Umbreon, Murkrow, Sneasel, Houndoom
    reward: 4500,
    color: 'bg-slate-800',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🏛️',
    regionId: 2,
    isEliteFour: true
  },
  {
    id: 'johto_champion',
    name: 'Johto Champion',
    leader: 'Lance',
    type: 'Dragon',
    description: 'The Dragon Master Champion! Can you withstand his dragons?',
    badge: 'Johto Champion Title',
    badgeIcon: '👑',
    pokemonIds: [230, 248, 249, 250], // Kingdra, Tyranitar, Lugia, Ho-Oh
    reward: 15000,
    color: 'bg-red-900',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'indigo',
    buildingIcon: '🏆',
    regionId: 2,
    isChampion: true
  },
  // Hoenn Gyms (Region 3)
  {
    id: 'rustboro',
    name: 'Rustboro Gym',
    leader: 'Roxanne',
    type: 'Rock',
    description: 'The Rock-Loving Honor Student! Her defense is solid!',
    badge: 'Stone Badge',
    badgeIcon: '💎',
    pokemonIds: [299, 304, 305], // Nosepass, Aron, Lairon
    reward: 2000,
    color: 'bg-stone-500',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'cave',
    buildingIcon: '🏫',
    regionId: 3
  },
  {
    id: 'dewford',
    name: 'Dewford Gym',
    leader: 'Brawly',
    type: 'Fighting',
    description: 'A big wave in fighting! His Fighting Pokémon are strong!',
    badge: 'Knuckle Badge',
    badgeIcon: '🥊',
    pokemonIds: [296, 297, 308], // Makuhita, Hariyama, Medicham
    reward: 2100,
    color: 'bg-orange-600',
    bgImage: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🥊',
    regionId: 3
  },
  {
    id: 'mauville',
    name: 'Mauville Gym',
    leader: 'Wattson',
    type: 'Electric',
    description: 'The Cheerful Electrician! His Electric Pokémon are shocking!',
    badge: 'Dynamo Badge',
    badgeIcon: '⚡',
    pokemonIds: [309, 310, 311, 312], // Electrike, Manectric, Plusle, Minun
    reward: 2400,
    color: 'bg-yellow-400',
    bgImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'powerplant',
    buildingIcon: '⚡',
    regionId: 3
  },
  {
    id: 'lavaridge',
    name: 'Lavaridge Gym',
    leader: 'Flannery',
    type: 'Fire',
    description: 'One with a fiery passion! Her Fire Pokémon are burning hot!',
    badge: 'Heat Badge',
    badgeIcon: '♨️',
    pokemonIds: [322, 323, 324], // Numel, Camerupt, Torkoal
    reward: 2800,
    color: 'bg-orange-700',
    bgImage: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'volcano',
    buildingIcon: '♨️',
    regionId: 3
  },
  {
    id: 'petalburg',
    name: 'Petalburg Gym',
    leader: 'Norman',
    type: 'Normal',
    description: 'A man in pursuit of power! His Normal Pokémon are balanced!',
    badge: 'Balance Badge',
    badgeIcon: '⚖️',
    pokemonIds: [287, 288, 289], // Lazy, Vigoroth, Slaking
    reward: 3000,
    color: 'bg-slate-500',
    bgImage: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🏠',
    regionId: 3
  },
  {
    id: 'fortree',
    name: 'Fortree Gym',
    leader: 'Winona',
    type: 'Flying',
    description: 'The Bird-User of the World! Her Flying Pokémon soar high!',
    badge: 'Feather Badge',
    badgeIcon: '🪶',
    pokemonIds: [277, 279, 334, 357], // Swellow, Pelipper, Altaria, Tropius
    reward: 3200,
    color: 'bg-sky-300',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'sky',
    buildingIcon: '🌳',
    regionId: 3
  },
  {
    id: 'mossdeep',
    name: 'Mossdeep Gym',
    leader: 'Tate & Liza',
    type: 'Psychic',
    description: 'Twin leaders who fight as one! Their Psychic Pokémon are synchronized!',
    badge: 'Mind Badge',
    badgeIcon: '🧠',
    pokemonIds: [337, 338, 344], // Lunatone, Solrock, Claydol
    reward: 3500,
    color: 'bg-pink-500',
    bgImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🔮',
    regionId: 3
  },
  {
    id: 'sootopolis',
    name: 'Sootopolis Gym',
    leader: 'Wallace',
    type: 'Water',
    description: 'The artist of Water! His Water Pokémon are elegant and strong!',
    badge: 'Rain Badge',
    badgeIcon: '🌧️',
    pokemonIds: [350, 370, 321, 365], // Milotic, Luvdisc, Wailord, Walrein
    reward: 4000,
    color: 'bg-blue-600',
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'ocean',
    buildingIcon: '🌊',
    regionId: 3
  },
  {
    id: 'hoenn_sidney',
    name: 'Elite Four Sidney',
    leader: 'Sidney',
    type: 'Dark',
    description: 'The master of Dark Pokémon. He loves the thrill of battle!',
    badge: "Sidney's Badge",
    badgeIcon: '🌑',
    pokemonIds: [262, 275, 332, 359], // Mightyena, Shiftry, Cacturne, Absol
    reward: 5000,
    color: 'bg-slate-800',
    bgImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🏛️',
    regionId: 3,
    isEliteFour: true
  },
  {
    id: 'hoenn_phoebe',
    name: 'Elite Four Phoebe',
    leader: 'Phoebe',
    type: 'Ghost',
    description: 'The master of Ghost Pokémon. She communicates with spirits!',
    badge: "Phoebe's Badge",
    badgeIcon: '👻',
    pokemonIds: [354, 354, 356, 356], // Banette, Banette, Dusclops, Dusclops
    reward: 5500,
    color: 'bg-indigo-900',
    bgImage: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🏛️',
    regionId: 3,
    isEliteFour: true
  },
  {
    id: 'hoenn_glacia',
    name: 'Elite Four Glacia',
    leader: 'Glacia',
    type: 'Ice',
    description: 'The master of Ice Pokémon. She came from afar to train!',
    badge: "Glacia's Badge",
    badgeIcon: '❄️',
    pokemonIds: [362, 362, 365, 365], // Glalie, Glalie, Walrein, Walrein
    reward: 6000,
    color: 'bg-cyan-600',
    bgImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'glacier',
    buildingIcon: '🏛️',
    regionId: 3,
    isEliteFour: true
  },
  {
    id: 'hoenn_drake',
    name: 'Elite Four Drake',
    leader: 'Drake',
    type: 'Dragon',
    description: 'The master of Dragon Pokémon. He has dedicated his life to them!',
    badge: "Drake's Badge",
    badgeIcon: '🐲',
    pokemonIds: [330, 334, 372, 373], // Flygon, Altaria, Shelgon, Salamence
    reward: 7000,
    color: 'bg-red-600',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'sky',
    buildingIcon: '🏛️',
    regionId: 3,
    isEliteFour: true
  },
  {
    id: 'hoenn_champion',
    name: 'Hoenn Champion',
    leader: 'Steven',
    type: 'Steel',
    description: 'The Iron-Clad Champion! His Steel Pokémon are unbreakable!',
    badge: 'Hoenn Champion Title',
    badgeIcon: '👑',
    pokemonIds: [306, 344, 348, 376, 384], // Aggron, Claydol, Armaldo, Metagross, Rayquaza
    reward: 20000,
    color: 'bg-slate-700',
    bgImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'indigo',
    buildingIcon: '🏆',
    regionId: 3,
    isChampion: true
  },
  // Sinnoh Gyms (Region 4)
  {
    id: 'oreburgh',
    name: 'Oreburgh Gym',
    leader: 'Roark',
    type: 'Rock',
    description: 'The Rock-Hard Mine Leader! He digs deep for victory!',
    badge: 'Coal Badge',
    badgeIcon: '⛏️',
    pokemonIds: [408, 409, 410], // Cranidos, Rampardos, Shieldon
    reward: 3000,
    color: 'bg-stone-800',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'cave',
    buildingIcon: '⛏️',
    regionId: 4
  },
  {
    id: 'eterna',
    name: 'Eterna Gym',
    leader: 'Gardenia',
    type: 'Grass',
    description: 'The Master of Grass Pokémon! Her Pokémon are in full bloom!',
    badge: 'Forest Badge',
    badgeIcon: '🌳',
    pokemonIds: [387, 388, 407], // Turtwig, Grotle, Roserade
    reward: 3200,
    color: 'bg-emerald-600',
    bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'forest',
    buildingIcon: '🌿',
    regionId: 4
  },
  {
    id: 'hearthome',
    name: 'Hearthome Gym',
    leader: 'Fantina',
    type: 'Ghost',
    description: 'The Alluring French Soul! Her Ghost Pokémon dance with spirit!',
    badge: 'Relic Badge',
    badgeIcon: '🏺',
    pokemonIds: [425, 426, 429], // Drifblim, Drifblim, Mismagius
    reward: 4000,
    color: 'bg-purple-800',
    bgImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '💃',
    regionId: 4
  },
  {
    id: 'veilstone',
    name: 'Veilstone Gym',
    leader: 'Maylene',
    type: 'Fighting',
    description: 'The Barefoot Fighting Girl! Her Fighting Pokémon are tough!',
    badge: 'Cobble Badge',
    badgeIcon: '🧱',
    pokemonIds: [447, 448, 453, 454], // Riolu, Lucario, Croagunk, Toxicroak
    reward: 3500,
    color: 'bg-orange-800',
    bgImage: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'dojo',
    buildingIcon: '🥊',
    regionId: 4
  },
  {
    id: 'pastoria',
    name: 'Pastoria Gym',
    leader: 'Wake',
    type: 'Water',
    description: 'The Torrential Masked Master! His Water Pokémon will splash you!',
    badge: 'Fen Badge',
    badgeIcon: '🌊',
    pokemonIds: [418, 419, 422, 423], // Buizel, Floatzel, Shellos, Gastrodon
    reward: 3800,
    color: 'bg-blue-700',
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'ocean',
    buildingIcon: '🌊',
    regionId: 4
  },
  {
    id: 'canalave',
    name: 'Canalave Gym',
    leader: 'Byron',
    type: 'Steel',
    description: 'The Man with the Steel Body! His Steel Pokémon are unbreakable!',
    badge: 'Mine Badge',
    badgeIcon: '🔩',
    pokemonIds: [411, 436, 437], // Bastiodon, Bronzor, Bronzong
    reward: 4200,
    color: 'bg-slate-600',
    bgImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'powerplant',
    buildingIcon: '🏭',
    regionId: 4
  },
  {
    id: 'snowpoint',
    name: 'Snowpoint Gym',
    leader: 'Candice',
    type: 'Ice',
    description: 'The Diamond Dust Girl! Her Ice Pokémon are freezing cold!',
    badge: 'Icicle Badge',
    badgeIcon: '❄️',
    pokemonIds: [459, 460, 461, 478], // Snover, Abomasnow, Weavile, Froslass
    reward: 4500,
    color: 'bg-cyan-300',
    bgImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'glacier',
    buildingIcon: '❄️',
    regionId: 4
  },
  {
    id: 'sunyshore',
    name: 'Sunyshore Gym',
    leader: 'Volkner',
    type: 'Electric',
    description: 'The Shining Shock Star! His Electric Pokémon are brilliant!',
    badge: 'Beacon Badge',
    badgeIcon: '🗼',
    pokemonIds: [403, 404, 405, 466], // Shinx, Luxio, Luxray, Electivire
    reward: 5000,
    color: 'bg-yellow-500',
    bgImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'powerplant',
    buildingIcon: '🗼',
    regionId: 4
  },
  {
    id: 'sinnoh_aaron',
    name: 'Elite Four Aaron',
    leader: 'Aaron',
    type: 'Bug',
    description: 'The master of Bug Pokémon. They are stronger than they look!',
    badge: "Aaron's Badge",
    badgeIcon: '🐞',
    pokemonIds: [402, 416, 452, 469], // Kricketune, Vespiquen, Drapion, Yanmega
    reward: 8000,
    color: 'bg-lime-700',
    bgImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'forest',
    buildingIcon: '🏛️',
    regionId: 4,
    isEliteFour: true
  },
  {
    id: 'sinnoh_bertha',
    name: 'Elite Four Bertha',
    leader: 'Bertha',
    type: 'Ground',
    description: 'The master of Ground Pokémon. She will shake the earth!',
    badge: "Bertha's Badge",
    badgeIcon: '🏜️',
    pokemonIds: [449, 450, 464, 472], // Hippopotas, Hippowdon, Rhyperior, Gliscor
    reward: 8500,
    color: 'bg-amber-900',
    bgImage: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'cave',
    buildingIcon: '🏛️',
    regionId: 4,
    isEliteFour: true
  },
  {
    id: 'sinnoh_flint',
    name: 'Elite Four Flint',
    leader: 'Flint',
    type: 'Fire',
    description: 'The master of Fire Pokémon. His passion is burning!',
    badge: "Flint's Badge",
    badgeIcon: '🔥',
    pokemonIds: [391, 392, 467, 421], // Monferno, Infernape, Magmortar, Cherrim
    reward: 9000,
    color: 'bg-orange-600',
    bgImage: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'volcano',
    buildingIcon: '🏛️',
    regionId: 4,
    isEliteFour: true
  },
  {
    id: 'sinnoh_lucian',
    name: 'Elite Four Lucian',
    leader: 'Lucian',
    type: 'Psychic',
    description: 'The master of Psychic Pokémon. He reads your every thought!',
    badge: "Lucian's Badge",
    badgeIcon: '🧠',
    pokemonIds: [437, 439, 475, 480], // Bronzong, Mime Jr., Gallade, Uxie
    reward: 10000,
    color: 'bg-pink-700',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'mansion',
    buildingIcon: '🏛️',
    regionId: 4,
    isEliteFour: true
  },
  {
    id: 'sinnoh_champion',
    name: 'Sinnoh Champion',
    leader: 'Cynthia',
    type: 'Mixed',
    description: 'The Ultimate Champion! She and her Garchomp are legendary!',
    badge: 'Sinnoh Champion Title',
    badgeIcon: '👑',
    pokemonIds: [442, 445, 448, 483, 484], // Spiritomb, Garchomp, Lucario, Dialga, Palkia
    reward: 30000,
    color: 'bg-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    arenaId: 'indigo',
    buildingIcon: '🏆',
    regionId: 4,
    isChampion: true
  }
];

export const ARENAS: Arena[] = [
  {
    id: 'forest',
    name: 'Viridian Forest',
    description: 'A deep and sprawling forest. Grass and Bug types feel at home here.',
    boostedTypes: ['Grass', 'Bug'],
    color: 'bg-emerald-600',
    icon: '🌲',
    bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'volcano',
    name: 'Cinnabar Volcano',
    description: 'The intense heat of the volcano empowers Fire and Ground types.',
    boostedTypes: ['Fire', 'Ground'],
    color: 'bg-orange-600',
    icon: '🌋',
    bgImage: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'ocean',
    name: 'Cerulean Ocean',
    description: 'The vast and deep ocean where Water and Ice types gain immense power.',
    boostedTypes: ['Water', 'Ice'],
    color: 'bg-blue-600',
    icon: '🌊',
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'powerplant',
    name: 'Abandoned Power Plant',
    description: 'Residual electricity boosts Electric and Steel types.',
    boostedTypes: ['Electric', 'Steel'],
    color: 'bg-yellow-500',
    icon: '⚡',
    bgImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mansion',
    name: 'Psychic Universe',
    description: 'A cosmic dimension where Psychic and Ghost types transcend reality.',
    boostedTypes: ['Ghost', 'Psychic'],
    color: 'bg-purple-700',
    icon: '🌌',
    bgImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'dojo',
    name: 'Saffron Dojo',
    description: 'A place of intense training. Fighting and Normal types excel here.',
    boostedTypes: ['Fighting', 'Normal'],
    color: 'bg-amber-700',
    icon: '🥋',
    bgImage: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'cave',
    name: 'Mt. Moon Cave',
    description: 'A dark cave filled with rocks. Rock and Ground types are stronger.',
    boostedTypes: ['Rock', 'Ground'],
    color: 'bg-stone-700',
    icon: '🪨',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'toxic',
    name: 'Fuchsia Cave',
    description: 'A dark, cavernous space where Poison and Bug types thrive in the shadows.',
    boostedTypes: ['Poison', 'Bug'],
    color: 'bg-purple-900',
    icon: '🧪',
    bgImage: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'sky',
    name: 'Indigo Sky',
    description: 'High above the clouds. Flying and Dragon types dominate the skies.',
    boostedTypes: ['Flying', 'Dragon'],
    color: 'bg-sky-400',
    icon: '☁️',
    bgImage: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'indigo',
    name: 'Indigo Plateau',
    description: 'The ultimate stage for the Pokémon League. All types are equally powerful here.',
    boostedTypes: [],
    color: 'bg-slate-900',
    icon: '🏛️',
    bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tower',
    name: 'Sprout Tower',
    description: 'A tall, swaying tower. Ghost and Flying types find peace here.',
    boostedTypes: ['Ghost', 'Flying'],
    color: 'bg-stone-500',
    icon: '🗼',
    bgImage: 'https://images.unsplash.com/photo-1528164344705-4754268799af?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'glacier',
    name: 'Ice Path',
    description: 'A slippery, frozen cave. Ice and Water types are at their peak.',
    boostedTypes: ['Ice', 'Water'],
    color: 'bg-blue-200',
    icon: '❄️',
    bgImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'desert',
    name: 'Hoenn Desert',
    description: 'A harsh desert with sandstorms. Ground and Rock types are resilient here.',
    boostedTypes: ['Ground', 'Rock'],
    color: 'bg-yellow-700',
    icon: '🏜️',
    bgImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'temple',
    name: 'Spear Pillar',
    description: 'An ancient temple at the top of the world. Dragon and Psychic types feel the divine power.',
    boostedTypes: ['Dragon', 'Psychic'],
    color: 'bg-slate-400',
    icon: '🏛️',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000'
  }
];

export const POKEMON_NAMES = ALL_POKEMON.map(p => p.name);

export const getPokemonTypes = (id: number): string[] => {
  const pokemon = getBasePokemon(id);
  return pokemon ? pokemon.types : ["Normal"];
};

export const getPokemonMoves = (types: string[]) => {
  const movePool = [
    { name: "Tackle", damage: 20, type: "Normal" },
    { name: "Quick Attack", damage: 30, type: "Normal" },
    { name: "Slam", damage: 40, type: "Normal" },
    { name: "Ember", damage: 30, type: "Fire" },
    { name: "Flamethrower", damage: 60, type: "Fire" },
    { name: "Water Gun", damage: 30, type: "Water" },
    { name: "Hydro Pump", damage: 70, type: "Water" },
    { name: "Vine Whip", damage: 30, type: "Grass" },
    { name: "Solar Beam", damage: 80, type: "Grass" },
    { name: "Thunder Shock", damage: 30, type: "Electric" },
    { name: "Thunderbolt", damage: 60, type: "Electric" },
    { name: "Confusion", damage: 30, type: "Psychic" },
    { name: "Psychic", damage: 70, type: "Psychic" },
    { name: "Rock Throw", damage: 30, type: "Rock" },
    { name: "Earthquake", damage: 80, type: "Ground" },
    { name: "Wing Attack", damage: 40, type: "Flying" },
    { name: "Fly", damage: 60, type: "Flying" },
    { name: "Bite", damage: 30, type: "Dark" },
    { name: "Sludge Bomb", damage: 50, type: "Poison" },
  ];

  // Pick 2 moves: one matching type, one normal
  const typeMove = movePool.find(m => types.includes(m.type)) || movePool[0];
  const normalMove = movePool.find(m => m.type === "Normal" && m.name !== typeMove.name) || movePool[1];
  
  return [typeMove, normalMove];
};

export const getPokemonImage = (id: number) => 
  `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id.toString().padStart(3, '0')}.png`;

export const TYPE_EFFECTIVENESS: { [key: string]: { [key: string]: number } } = {
  Fire: { Grass: 2.5, Ice: 2.5, Bug: 2.5, Steel: 2.5, Fire: 0.4, Water: 0.4, Rock: 0.4, Dragon: 0.4 },
  Water: { Fire: 2.5, Ground: 2.5, Rock: 2.5, Water: 0.4, Grass: 0.4, Dragon: 0.4 },
  Grass: { Water: 2.5, Ground: 2.5, Rock: 2.5, Grass: 0.4, Fire: 0.4, Poison: 0.4, Flying: 0.4, Bug: 0.4, Dragon: 0.4, Steel: 0.4 },
  Electric: { Water: 2.5, Flying: 2.5, Electric: 0.4, Grass: 0.4, Dragon: 0.4, Ground: 0 },
  Psychic: { Fighting: 2.5, Poison: 2.5, Psychic: 0.4, Steel: 0.4, Dark: 0 },
  Fighting: { Normal: 2.5, Ice: 2.5, Rock: 2.5, Dark: 2.5, Steel: 2.5, Poison: 0.4, Flying: 0.4, Psychic: 0.4, Bug: 0.4, Fairy: 0.4, Ghost: 0 },
  Poison: { Grass: 2.5, Fairy: 2.5, Poison: 0.4, Ground: 0.4, Rock: 0.4, Ghost: 0.4, Steel: 0 },
  Ground: { Fire: 2.5, Electric: 2.5, Poison: 2.5, Rock: 2.5, Steel: 2.5, Grass: 0.4, Bug: 0.4, Flying: 0 },
  Flying: { Grass: 2.5, Fighting: 2.5, Bug: 2.5, Electric: 0.4, Rock: 0.4, Steel: 0.4 },
  Bug: { Grass: 2.5, Psychic: 2.5, Dark: 2.5, Fire: 0.4, Fighting: 0.4, Poison: 0.4, Flying: 0.4, Ghost: 0.4, Steel: 0.4, Fairy: 0.4 },
  Rock: { Fire: 2.5, Ice: 2.5, Flying: 2.5, Bug: 2.5, Fighting: 0.4, Ground: 0.4, Steel: 0.4 },
  Ghost: { Psychic: 2.5, Ghost: 2.5, Dark: 0.4, Normal: 0 },
  Dragon: { Dragon: 2.5, Steel: 0.4, Fairy: 0 },
  Ice: { Grass: 2.5, Ground: 2.5, Flying: 2.5, Dragon: 2.5, Fire: 0.4, Water: 0.4, Ice: 0.4, Steel: 0.4 },
  Normal: { Rock: 0.4, Steel: 0.4, Ghost: 0 },
  Steel: { Ice: 2.5, Rock: 2.5, Fairy: 2.5, Fire: 0.4, Water: 0.4, Electric: 0.4, Steel: 0.4 },
  Dark: { Psychic: 2.5, Ghost: 2.5, Fighting: 0.4, Dark: 0.4, Fairy: 0.4 },
  Fairy: { Fighting: 2.5, Dragon: 2.5, Dark: 2.5, Fire: 0.4, Poison: 0.4, Steel: 0.4 }
};

export const EVOLUTION_MAP: { [key: number]: number | number[] } = ALL_POKEMON.reduce((acc, p) => {
  if (p.evolvesTo) {
    acc[p.id] = p.evolvesTo;
  }
  return acc;
}, {} as { [key: number]: number | number[] });

export const getPokemonData = (id: number, attackBoost = 0, defenseBoost = 0) => {
  const pokemon = getBasePokemon(id);
  if (!pokemon) throw new Error(`Pokemon with id ${id} not found`);

  const { name, types, rarity } = pokemon;
  const generation = getGeneration(id);
  
  // Level based on ID (evolution stage approximation)
  // Level range: 10 to 100
  const level = Math.min(100, Math.floor((id % ALL_POKEMON.length) / 2) + 10 + (rarity === 'Legendary' ? 20 : rarity === 'Rare' ? 10 : 0));
  
  // Base stats redesigned for faster combat (max 5 turns)
  // HP scales slower than damage
  let hp = 100 + level * 4;
  let defense = level * 1.2 + defenseBoost;
  let speed = 40 + level;
  
  // Rarity bonus
  const rarityBonus = rarity === 'Legendary' ? 1.4 : rarity === 'Rare' ? 1.2 : 1.0;
  
  hp = Math.floor(hp * rarityBonus);
  defense = Math.floor(defense * rarityBonus);
  speed = Math.floor(speed * rarityBonus);
  
  // Realistic-ish physical stats
  const height = (0.3 + (id % 10) * 0.2 + Math.floor(id / 50) * 0.5).toFixed(1);
  const weight = (5 + (id % 20) * 2 + Math.floor(id / 10) * 10).toFixed(1);
  
  return {
    id,
    name,
    image: getPokemonImage(id),
    types,
    level,
    rarity,
    hp,
    defense,
    speed,
    height,
    weight,
    generation,
    moves: getPokemonMoves(types).map(m => ({
      ...m,
      // Damage scales faster than HP to ensure quick battles
      damage: Math.floor((m.damage + level * 1.8 + attackBoost) * rarityBonus)
    }))
  };
};
