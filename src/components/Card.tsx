import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap } from 'lucide-react';
import { Pokemon, Rarity } from '../types';
import { TypeBadge, PokeballIcon } from './Common';
import { useLanguage } from '../contexts/LanguageContext';

export const Card: React.FC<{ 
  pokemon: Pokemon; 
  isFlipped: boolean; 
  onFlip?: () => void;
  playSound?: (type: 'flip' | 'hit' | 'victory' | 'defeat' | 'draw' | 'exp' | 'evolve' | 'battle') => void;
  size?: "small" | "normal" | "large";
  className?: string;
  showStats?: boolean;
  isAttacking?: boolean;
  isHit?: boolean;
  isHealing?: boolean;
  side?: "player" | "opponent";
  currentHp?: number;
}> = ({ 
  pokemon, 
  isFlipped, 
  onFlip, 
  playSound,
  size = "normal",
  className = "",
  showStats = true,
  isAttacking = false,
  isHit = false,
  isHealing = false,
  side = "player",
  currentHp
}) => {
  const { t } = useLanguage();
  const sizeClasses = {
    small: "w-32 h-48",
    normal: "w-64 h-96",
    large: "w-80 h-[480px]"
  };

  if (!pokemon) return null;

  const displayHp = currentHp !== undefined ? currentHp : pokemon.hp;

  const rarityStyles = {
    Common: {
      border: 'border-slate-300',
      bg: 'bg-white',
      glow: '',
      badge: 'bg-slate-100 text-slate-600'
    },
    Rare: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      glow: 'shadow-[0_0_15px_rgba(96,165,250,0.5)]',
      badge: 'bg-blue-500 text-white'
    },
    Legendary: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.6)] animate-pulse',
      badge: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
    }
  };

  const currentRarity = rarityStyles[pokemon.rarity] || rarityStyles.Common;

  const lungeX = side === 'player' ? [0, 100, 0] : [0, -100, 0];

  return (
    <div 
      className={`relative ${sizeClasses[size]} cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
      onClick={() => {
        if (onFlip) {
          playSound?.('flip');
          onFlip();
        }
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          x: isAttacking ? lungeX : isHit ? [0, -15, 15, -15, 15, 0] : 0,
          y: isHit ? [0, -10, 10, -10, 10, 0] : 0,
          scale: isAttacking ? [1, 1.2, 1] : isHit ? [1, 0.9, 1.1, 1] : 1
        }}
        transition={{ 
          rotateY: { type: 'spring', stiffness: 260, damping: 20 },
          x: { duration: isAttacking ? 0.4 : 0.4, ease: "easeInOut" },
          y: { duration: 0.4 },
          scale: { duration: 0.3 }
        }}
      >
        {/* Hit Flash Overlay */}
        <AnimatePresence>
          {isHit && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white rounded-2xl pointer-events-none"
            />
          )}
          {isHealing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-emerald-400 rounded-2xl pointer-events-none mix-blend-screen"
            />
          )}
        </AnimatePresence>

        {/* Front (Back of the card) */}
        <motion.div 
          className="absolute inset-0 bg-slate-900 rounded-2xl border-4 border-slate-700 flex flex-col items-center justify-center p-6 overflow-hidden shadow-2xl"
          animate={{
            filter: isHit ? 'brightness(2)' : 'brightness(1)'
          }}
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)'
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent scale-150" />
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center relative z-10 overflow-hidden">
            <PokeballIcon className="w-16 h-16 md:w-20 md:h-20 text-blue-400" />
          </div>
          <div className="mt-8 text-center relative z-10">
            <h3 className="text-blue-400 font-mono text-sm tracking-widest uppercase">Pokémon TCG</h3>
            <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-tighter">{t('card.catch_all')}</p>
          </div>
        </motion.div>

        {/* Back (Front of the card) */}
        <motion.div 
          className={`absolute inset-0 ${currentRarity.bg} rounded-2xl border-4 ${currentRarity.border} ${currentRarity.glow} flex flex-col p-4 shadow-2xl`}
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${currentRarity.badge}`}>
                {t('rarity.' + pokemon.rarity)}
              </span>
              <h3 className="text-sm font-black tracking-tighter uppercase mt-1">{t('pokemon.' + pokemon.id)}</h3>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400">{t('collection.hp')}</span>
              <span className="text-lg font-black text-red-600">{displayHp}</span>
            </div>
          </div>

          {/* Image Area */}
          <div className="relative flex-1 bg-gradient-to-b from-slate-100 to-white rounded-lg border-2 border-slate-200 overflow-hidden flex items-center justify-center group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-50" />
            <img 
              src={pokemon.image} 
              alt={t('pokemon.' + pokemon.id)}
              className="w-3/4 h-3/4 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('assets.pokemon.com')) {
                  target.src = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
                } else if (target.src.includes('official-artwork')) {
                  target.src = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${pokemon.id}.png`;
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              {pokemon.types.map(t_type => <TypeBadge key={t_type} type={t_type} />)}
            </div>
          </div>

          {/* Stats/Moves */}
          {showStats && (
            <div className="mt-4 space-y-3">
              {pokemon.moves.map((move, i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={move.type} />
                      <span className="text-[10px] font-bold tracking-tight">{t('move.' + move.name)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black">{move.damage}</span>
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="flex flex-col items-center p-1 bg-slate-50 rounded-lg">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">{t('card.def')}</span>
                  <span className="text-[10px] font-black">{pokemon.defense}</span>
                </div>
                <div className="flex flex-col items-center p-1 bg-slate-50 rounded-lg">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">{t('card.spd')}</span>
                  <span className="text-[10px] font-black">{pokemon.speed}</span>
                </div>
                <div className="flex flex-col items-center p-1 bg-slate-50 rounded-lg">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">{t('card.lvl')}</span>
                  <span className="text-[10px] font-black">{pokemon.level}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-2 flex justify-between items-end">
            <span className="text-[8px] font-mono text-slate-400">#{pokemon.id.toString().padStart(3, '0')}</span>
            <div className="flex gap-0.5">
              {[...Array(pokemon.rarity === 'Legendary' ? 3 : pokemon.rarity === 'Rare' ? 2 : 1)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-sm" />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
