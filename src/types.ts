import { Language } from './i18n';

export interface Move {
  name: string;
  damage: number;
  type: string;
}

export type Rarity = 'Common' | 'Rare' | 'Legendary';

export interface BasePokemon {
  id: number;
  name: string;
  types: string[];
  rarity: Rarity;
  evolvesTo?: number | number[];
}

export interface Pokemon extends BasePokemon {
  image: string;
  hp: number;
  defense: number;
  speed: number;
  level: number;
  moves: Move[];
  height: string;
  weight: string;
  generation: number;
  collected?: boolean;
  count?: number;
  currentHp?: number;
}

export interface Arena {
  id: string;
  name: string;
  description: string;
  boostedTypes: string[];
  color: string;
  icon: string;
  bgImage: string;
}

export interface Gym {
  id: string;
  name: string;
  description: string;
  leader: string;
  type: string;
  badge: string;
  badgeIcon: string;
  pokemonIds: number[];
  reward: number;
  color: string;
  bgImage: string;
  arenaId: string;
  buildingIcon: string;
  regionId: number;
  isEliteFour?: boolean;
  isChampion?: boolean;
}

export type SortOption = 'id' | 'name' | 'hp' | 'attack' | 'defense' | 'speed' | 'rarity';

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'heal' | 'full-heal' | 'rare-candy' | 'lucky-egg' | 'evolution-candy' | 'attack-boost' | 'defense-boost' | 'transfer-ball-1' | 'transfer-ball-3' | 'transfer-ball-inf';
  value?: number;
  icon: string;
}

export interface CollectionState {
  cards: { [id: number]: number };
  coins: number;
  hpMap?: { [id: number]: number };
  attackBoosts?: { [id: number]: number };
  defenseBoosts?: { [id: number]: number };
  transferUses?: { [id: number]: number };
  lastHealTime?: number;
  badges: string[];
  inventory: { [itemId: string]: number };
  lang?: Language;
  lastDailyReward?: number;
  currentRegion?: number;
  unlockedRegions?: number[];
  isInfiniteCoins?: boolean;
}
