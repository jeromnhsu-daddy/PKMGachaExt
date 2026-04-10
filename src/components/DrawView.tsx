import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, RefreshCw, Zap } from 'lucide-react';
import { Pokemon, CollectionState, Rarity } from '../types';
import { Card } from './Card';
import { PokeballIcon } from './Common';
import { useLanguage } from '../contexts/LanguageContext';

interface DrawViewProps {
  coins: number;
  collection: CollectionState;
  drawCard: () => void;
  drawnCard: Pokemon | null;
  isDrawing: boolean;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  playSound: (type: any) => void;
  getPrice: (rarity: Rarity, isSelling?: boolean) => number;
}

export const DrawView: React.FC<DrawViewProps> = ({
  coins,
  collection,
  drawCard,
  drawnCard,
  isDrawing,
  isFlipped,
  setIsFlipped,
  playSound,
  getPrice
}) => {
  const { t } = useLanguage();
  return (
    <motion.div 
      key="draw"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[70vh] py-12"
    >
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-12 items-center justify-center">
        <div className="flex-1 text-center md:text-left space-y-8">
          <div className="space-y-4">
            <h2 className="text-8xl font-black tracking-tighter italic serif uppercase leading-none">
              {t('draw.title')}
            </h2>
            <p className="text-sm opacity-60 font-mono uppercase tracking-widest leading-relaxed max-w-md">
              {t('draw.subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center md:items-start">
            <div className="px-10 py-8 bg-[#141414] text-[#E4E3E0] rounded-3xl flex items-center gap-6 shadow-2xl border-2 border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse relative z-10" />
              <div className="flex flex-col relative z-10">
                <span className="text-xs opacity-50 uppercase font-bold tracking-widest leading-none mb-2">{t('draw.balance')}</span>
                <span className="text-5xl font-black tracking-tighter leading-none">{coins}</span>
              </div>
            </div>

            <button 
              onClick={drawCard}
              disabled={isDrawing || (!collection.isInfiniteCoins && coins < 100)}
              className={`group relative px-12 py-8 rounded-3xl font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-4 overflow-hidden shadow-2xl ${
                (collection.isInfiniteCoins || coins >= 100) && !isDrawing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <PokeballIcon className={`w-8 h-8 ${isDrawing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
              <div className="flex flex-col items-start relative z-10">
                <span className="text-[10px] opacity-60 font-bold leading-none mb-1">
                  {collection.isInfiniteCoins ? 'FREE' : t('draw.cost', { amount: 100 })}
                </span>
                <span className="text-xl font-black tracking-tighter leading-none">{t('draw.button')}</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-sm">
            <Info className="w-5 h-5 text-blue-500 opacity-40" />
            <p className="text-[10px] font-mono leading-relaxed opacity-60 uppercase">
              {t('draw.unboxed_desc')}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-8">
          <div className="relative">
            <AnimatePresence mode="wait">
              {drawnCard ? (
                <motion.div
                  key={drawnCard.id}
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <Card 
                    pokemon={drawnCard} 
                    isFlipped={isFlipped} 
                    onFlip={() => setIsFlipped(true)}
                    size="large"
                    playSound={playSound}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-80 h-[480px] rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm"
                >
                  <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center mb-8 border-2 border-slate-100">
                    <PokeballIcon className="w-20 h-20 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tighter opacity-20 mb-2">{t('draw.ready')}</h3>
                  <p className="text-[10px] font-mono opacity-20 uppercase tracking-widest">{t('draw.ready_to_draw')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isDrawing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#E4E3E0]/40 backdrop-blur-sm rounded-3xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 animate-pulse">{t('draw.preparing')}</span>
                </div>
              </motion.div>
            )}
          </div>
          
          {drawnCard && isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('draw.congrats')}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    drawCard();
                  }}
                  className="px-6 py-2 bg-slate-100 text-[#141414] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  {t('draw.button')}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
