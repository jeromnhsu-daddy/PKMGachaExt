import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Swords, X, Zap, RefreshCw } from 'lucide-react';
import { Pokemon, Arena, CollectionState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TeamSelectViewProps {
  collection: CollectionState;
  useItem: (itemId: string, pokemon: Pokemon) => void;
  selectedTeam: Pokemon[];
  setSelectedTeam: React.Dispatch<React.SetStateAction<Pokemon[]>>;
  filteredPokemon: Pokemon[];
  setView: (view: any) => void;
  start3vs3Battle: (team: Pokemon[]) => void;
  selectedArena: Arena;
  setSelectedArena: (arena: Arena) => void;
  showArenaModal: boolean;
  setShowArenaModal: (val: boolean) => void;
  showBattleModeModal: boolean;
  setShowBattleModeModal: (val: boolean) => void;
  setIsAutoBattle: (val: boolean) => void;
  arenas: Arena[];
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
}

export const TeamSelectView: React.FC<TeamSelectViewProps> = ({
  collection,
  useItem,
  selectedTeam,
  setSelectedTeam,
  filteredPokemon,
  setView,
  start3vs3Battle,
  selectedArena,
  setSelectedArena,
  showArenaModal,
  setShowArenaModal,
  showBattleModeModal,
  setShowBattleModeModal,
  setIsAutoBattle,
  arenas,
  setToast
}) => {
  const { t } = useLanguage();
  const [activeGen, setActiveGen] = React.useState<number>(collection.currentRegion || 1);

  // Set activeGen to current region when entering team select
  useEffect(() => {
    setActiveGen(collection.currentRegion || 1);
  }, [collection.currentRegion]);

  // --- Body Scroll Lock ---
  useEffect(() => {
    if (showArenaModal || showBattleModeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showArenaModal, showBattleModeModal]);

  return (
    <motion.div 
      key="select-team"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-white p-10 rounded-3xl border-4 border-[#141414] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-6xl font-bold tracking-tighter italic serif uppercase mb-2">{t('team.title')}</h2>
          <p className="text-sm opacity-60 font-mono uppercase tracking-widest leading-relaxed max-w-md">
            {t('team.desc')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-4">
            <button 
              onClick={() => setView('collection')}
              className="flex items-center gap-2 text-[#141414] hover:opacity-60 transition-opacity font-bold uppercase tracking-widest text-sm"
            >
              <ArrowLeft className="w-5 h-5" /> {t('common.cancel')}
            </button>
            <button 
              disabled={selectedTeam.length < 3}
              onClick={() => setShowArenaModal(true)}
              className={`px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl ${
                selectedTeam.length === 3 
                  ? 'bg-[#141414] text-[#E4E3E0] hover:bg-slate-800' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Swords className="w-5 h-5" /> {t('team.confirm', { current: selectedTeam.length, total: 3 })}
            </button>
          </div>
        </div>
      </div>

      {/* Arena Selection Modal */}
      <AnimatePresence>
        {showArenaModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-4xl w-full bg-white rounded-3xl p-8 border-4 border-[#141414] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="text-center mb-8">
                <h3 className="text-4xl font-bold tracking-tighter mb-2 italic serif uppercase">
                  {t('team.choose_arena')}
                </h3>
                <p className="text-sm opacity-60 font-mono uppercase">
                  {t('team.arena_boost_desc')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {arenas.map((arena) => (
                  <button
                    key={arena.id}
                    onClick={() => {
                      setSelectedArena(arena);
                      setShowArenaModal(false);
                      setShowBattleModeModal(true);
                    }}
                    className={`relative group overflow-hidden rounded-2xl border-2 transition-all p-6 flex flex-col items-start text-left ${
                      selectedArena.id === arena.id ? 'border-[#141414] ring-4 ring-[#141414]/10' : 'border-slate-100 hover:border-[#141414]/40'
                    }`}
                  >
                    <div className="absolute inset-0 z-0">
                      <img src={arena.bgImage} className="w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className={`absolute inset-0 ${arena.color} opacity-5`} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-xl ${arena.color} flex items-center justify-center text-2xl mb-4 shadow-lg border border-white/20`}>
                        {arena.icon}
                      </div>
                      <h4 className="font-bold text-xl uppercase tracking-tight mb-1">{t('arena.' + arena.id)}</h4>
                      <p className="text-[10px] opacity-60 mb-4 leading-tight max-w-[200px]">{t('arena.' + arena.id + '.desc')}</p>
                      <div className="flex flex-wrap gap-1">
                        {arena.boostedTypes.map(t_type => (
                          <span key={t_type} className="px-2 py-0.5 bg-[#141414] text-white rounded-full text-[8px] font-bold uppercase tracking-widest">
                            {t('type.' + t_type)} +30%
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setShowArenaModal(false)}
                  className="px-8 py-3 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  {t('team.back')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Mode Selection Modal */}
      <AnimatePresence>
        {showBattleModeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-md w-full bg-white rounded-3xl p-8 border-4 border-[#141414] shadow-2xl text-center max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Swords className="w-8 h-8 text-[#141414]" />
              </div>
              <h3 className="text-3xl font-bold tracking-tighter mb-2 italic serif uppercase">
                {t('battle.mode_choose')}
              </h3>
              <p className="text-sm opacity-60 font-mono uppercase mb-8">
                {t('battle.mode_desc')}
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => {
                    setIsAutoBattle(false);
                    setShowBattleModeModal(false);
                    start3vs3Battle(selectedTeam);
                  }}
                  className="w-full py-4 bg-white border-2 border-[#141414] text-[#141414] rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  <Zap className="w-5 h-5" /> {t('battle.manual')}
                </button>
                <button 
                  onClick={() => {
                    setIsAutoBattle(true);
                    setShowBattleModeModal(false);
                    start3vs3Battle(selectedTeam);
                  }}
                  className="w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" /> {t('battle.auto_fast')}
                </button>
                <button 
                  onClick={() => setShowBattleModeModal(false)}
                  className="w-full py-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Team Preview */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-32 h-48 rounded-2xl border-2 border-dashed border-[#141414]/20 flex items-center justify-center relative overflow-hidden bg-white/50">
            {selectedTeam[i] ? (
              <>
                <img src={selectedTeam[i].image} className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setSelectedTeam(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-2 right-2 p-1 bg-[#141414] text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <p className="text-[10px] font-bold uppercase">{t('pokemon.' + selectedTeam[i].id)}</p>
                </div>
              </>
            ) : (
              <p className="text-[10px] font-mono opacity-30 uppercase">{t('team.slot', { index: i + 1 })}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4].map((gen) => {
          const isUnlocked = (collection.unlockedRegions || [1]).includes(gen);
          return (
            <button
              key={gen}
              disabled={!isUnlocked}
              onClick={() => {
                setActiveGen(gen);
              }}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${
                activeGen === gen 
                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-lg' 
                  : isUnlocked
                    ? 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]/30'
                    : 'bg-[#141414]/5 text-[#141414]/30 border-transparent cursor-not-allowed'
              }`}
            >
              {t(`region.${gen}`)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredPokemon.filter(p => p.collected && p.generation === activeGen).map(p => {
          const isSelected = selectedTeam.some(s => s.id === p.id);
          const currentHp = collection.hpMap[p.id] !== undefined ? collection.hpMap[p.id] : p.hp;
          const isInjured = currentHp < p.hp;
          const hasPotion = (collection.inventory['potion'] || 0) > 0;
          const hasSuperPotion = (collection.inventory['super-potion'] || 0) > 0;
          const hasFullRestore = (collection.inventory['full-restore'] || 0) > 0;

          return (
            <motion.div 
              key={p.id}
              whileHover={{ y: -5 }}
              className="flex flex-col gap-2"
            >
              <div
                onClick={() => {
                  if (currentHp <= 0) {
                    setToast({ message: t('team.fainted_error', { name: t('pokemon.' + p.id) }), type: 'error' });
                    return;
                  }
                  if (isSelected) {
                    setSelectedTeam(prev => prev.filter(s => s.id !== p.id));
                  } else if (selectedTeam.length < 3) {
                    setSelectedTeam(prev => [...prev, p]);
                  }
                }}
                className={`relative aspect-[3/4] rounded-2xl p-3 border cursor-pointer transition-all ${
                  currentHp <= 0 ? 'opacity-50 grayscale cursor-not-allowed border-red-200 bg-red-50' :
                  isSelected ? 'border-[#141414] bg-[#141414]/5 shadow-lg' : 'border-[#141414]/10 bg-white hover:border-[#141414]/30'
                }`}
              >
                <div className="absolute top-2 right-2 text-[10px] font-mono opacity-30 flex items-center gap-1">
                  {currentHp <= 0 && <span className="text-red-500 font-bold">{t('battle.fainted')}</span>}
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    p.rarity === 'Legendary' ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]' : 
                    p.rarity === 'Rare' ? 'bg-blue-500' : 'bg-yellow-400'
                  }`} />
                  #{p.id.toString().padStart(3, '0')}
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <img 
                    src={p.image} 
                    className="w-24 h-24 object-contain mb-2" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('assets.pokemon.com')) {
                        target.src = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${p.id}.png`;
                      } else if (target.src.includes('official-artwork')) {
                        target.src = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${p.id}.png`;
                      }
                    }}
                  />
                  <p className="text-[10px] font-bold uppercase text-center">{t('pokemon.' + p.id)}</p>
                  
                  {/* HP Bar */}
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-[8px] font-bold uppercase mb-0.5 opacity-50">
                      <span>HP</span>
                      <span>{currentHp}/{p.hp}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${currentHp / p.hp < 0.3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentHp / p.hp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Use Items in Team Select */}
              {isInjured && (hasPotion || hasSuperPotion || hasFullRestore) && (
                <div className="flex gap-1">
                  {hasPotion && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); useItem('potion', p); }}
                      className="flex-1 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                    >
                      {t('item.potion.name')}
                    </button>
                  )}
                  {hasSuperPotion && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); useItem('super-potion', p); }}
                      className="flex-1 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                    >
                      {t('item.super-potion.name')}
                    </button>
                  )}
                  {!hasPotion && !hasSuperPotion && hasFullRestore && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); useItem('full-restore', p); }}
                      className="flex-1 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                    >
                      {t('item.full-restore.name')}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
