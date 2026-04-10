import { BasePokemon } from '../types';
import { GEN1_POKEMON } from './gen1';
import { GEN2_POKEMON } from './gen2';
import { GEN3_POKEMON } from './gen3';
import { GEN4_POKEMON } from './gen4';

export const ALL_POKEMON: BasePokemon[] = [
  ...GEN1_POKEMON,
  ...GEN2_POKEMON,
  ...GEN3_POKEMON,
  ...GEN4_POKEMON,
];

export const getBasePokemon = (id: number): BasePokemon | undefined => {
  return ALL_POKEMON.find(p => p.id === id);
};

export const getGeneration = (id: number): number => {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  return 1; // Default
};
