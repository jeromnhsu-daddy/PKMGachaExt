import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Zap, Swords, Trophy, Sparkles, LayoutGrid, X, Info, Map as MapIcon, ArrowRight, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TYPE_EFFECTIVENESS } from '../constants';
import { TypeBadge } from './Common';
import { ALL_POKEMON, getGeneration, getBasePokemon } from '../data/pokemon';
import { CollectionState } from '../types';

interface GuideViewProps {
  collection: CollectionState;
}

export const GuideView: React.FC<GuideViewProps> = ({ collection }) => {
  const { t } = useLanguage();
  const [showTypeChart, setShowTypeChart] = useState(false);
  const [showCrossGenTable, setShowCrossGenTable] = useState(false);

  const sections = [
    {
      id: 'features',
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      title: t('guide.features.title'),
      desc: t('guide.features.desc'),
      color: 'bg-yellow-50'
    },
    {
      id: 'regions',
      icon: <MapIcon className="w-8 h-8 text-purple-400" />,
      title: t('guide.regions.title'),
      desc: t('guide.regions.desc'),
      steps: [
        t('guide.regions.step1'),
        t('guide.regions.step2'),
        t('guide.regions.step3'),
        t('guide.regions.step4')
      ],
      color: 'bg-purple-50'
    },
    {
      id: 'gameplay',
      icon: <LayoutGrid className="w-8 h-8 text-blue-400" />,
      title: t('guide.gameplay.title'),
      steps: [
        t('guide.gameplay.step1'),
        t('guide.gameplay.step2'),
        t('guide.gameplay.step3'),
        t('guide.gameplay.step4')
      ],
      color: 'bg-blue-50'
    },
    {
      id: 'gym_vs_battle',
      icon: <Swords className="w-8 h-8 text-red-400" />,
      title: t('guide.gym_vs_battle.title'),
      content: [
        { label: t('nav.gyms'), desc: t('guide.gyms.desc') },
        { label: t('nav.battle'), desc: t('guide.battles.desc') }
      ],
      color: 'bg-red-50'
    },
    {
      id: 'arenas',
      icon: <Zap className="w-8 h-8 text-emerald-400" />,
      title: t('guide.arenas.title'),
      desc: t('guide.arenas.desc'),
      color: 'bg-emerald-50'
    }
  ];

  const allTypes = Object.keys(TYPE_EFFECTIVENESS).sort();

  return (
    <motion.div 
      key="guide"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto py-12 px-6"
    >
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#141414] text-[#E4E3E0] mb-6 shadow-xl">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-6xl font-bold tracking-tighter italic serif uppercase mb-4">{t('guide.title')}</h2>
        <p className="text-sm opacity-60 font-mono uppercase tracking-widest mb-8">{t('guide.subtitle')}</p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setShowTypeChart(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#141414] text-[#E4E3E0] rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
          >
            <Info className="w-5 h-5" />
            {t('guide.type_chart.button')}
          </button>

          <button
            onClick={() => setShowCrossGenTable(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            {t('guide.cross_gen.button')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-10 rounded-[2.5rem] border-2 border-[#141414] shadow-xl relative overflow-hidden ${section.color}`}
          >
            <div className="relative z-10">
              <div className="mb-6">{section.icon}</div>
              <h3 className="text-3xl font-bold tracking-tighter italic serif uppercase mb-4">{section.title}</h3>
              
              {section.desc && (
                <p className="text-sm leading-relaxed opacity-70 mb-4">{section.desc}</p>
              )}

              {section.steps && (
                <ul className="space-y-4">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#141414] text-white text-[10px] font-bold flex items-center justify-center mt-1">
                        {i + 1}
                      </span>
                      <p className="text-sm opacity-80 leading-tight">{step}</p>
                    </li>
                  ))}
                </ul>
              )}

              {section.content && (
                <div className="space-y-6">
                  {section.content.map((item, i) => (
                    <div key={i}>
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
                        {item.label}
                      </h4>
                      <p className="text-sm opacity-70 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#141414]/5 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-12 bg-[#141414] text-[#E4E3E0] rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h3 className="text-4xl font-bold tracking-tighter italic serif uppercase mb-4">Ready to start?</h3>
          <p className="text-sm opacity-60 font-mono uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
            Every journey begins with a single step. Draw your first card and embark on your quest to become the ultimate Pokémon Master!
          </p>
        </div>
        
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>

      {/* Type Chart Modal */}
      <AnimatePresence>
        {showTypeChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-md"
            onClick={() => setShowTypeChart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#E4E3E0] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] border-2 border-[#141414] shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-[#141414]/10 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-4xl font-bold tracking-tighter italic serif uppercase">{t('guide.type_chart.title')}</h3>
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">Damage Multipliers</p>
                </div>
                <button 
                  onClick={() => setShowTypeChart(false)}
                  className="p-3 hover:bg-[#141414]/10 rounded-full transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8">
                <div className="min-w-[900px]">
                  <div className="grid gap-1 mb-8 h-24" style={{ gridTemplateColumns: `120px repeat(${allTypes.length}, 1fr)` }}>
                    <div className="flex items-end justify-center pb-2 text-[10px] font-bold uppercase opacity-30">
                      {t('guide.type_chart.attacker')} ↓
                    </div>
                    {allTypes.map(type => (
                      <div key={type} className="flex items-end justify-center pb-2">
                        <div className="rotate-[-45deg] origin-bottom-left whitespace-nowrap translate-x-4">
                          <TypeBadge type={type} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {allTypes.map(attacker => (
                    <div key={attacker} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `120px repeat(${allTypes.length}, 1fr)` }}>
                      <div className="flex items-center justify-end pr-4">
                        <TypeBadge type={attacker} />
                      </div>
                      {allTypes.map(defender => {
                        const multiplier = TYPE_EFFECTIVENESS[attacker]?.[defender] ?? 1;
                        let bgColor = 'bg-white/50';
                        let textColor = 'text-[#141414]/30';
                        let label = '';

                        if (multiplier > 1) {
                          bgColor = 'bg-emerald-500';
                          textColor = 'text-white';
                          label = '2.5';
                        } else if (multiplier === 0) {
                          bgColor = 'bg-red-900';
                          textColor = 'text-white';
                          label = '0';
                        } else if (multiplier < 1) {
                          bgColor = 'bg-red-500';
                          textColor = 'text-white';
                          label = '0.4';
                        }

                        return (
                          <div 
                            key={defender} 
                            className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${bgColor} ${textColor} transition-all hover:scale-110 cursor-help`}
                            title={`${attacker} vs ${defender}: ${multiplier}x`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">2.5</div>
                    <span className="text-xs font-bold uppercase tracking-widest">{t('guide.type_chart.super_effective')}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold text-xs">0.4</div>
                    <span className="text-xs font-bold uppercase tracking-widest">{t('guide.type_chart.not_very_effective')}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-red-900 flex items-center justify-center text-white font-bold text-xs">0</div>
                    <span className="text-xs font-bold uppercase tracking-widest">{t('guide.type_chart.no_effect')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Cross-Gen Evolution Modal */}
      <AnimatePresence>
        {showCrossGenTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-md"
            onClick={() => setShowCrossGenTable(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#E4E3E0] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] border-2 border-[#141414] shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-[#141414]/10 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-4xl font-bold tracking-tighter italic serif uppercase">{t('guide.cross_gen.title')}</h3>
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">Discover Evolution Paths Across Regions</p>
                </div>
                <button 
                  onClick={() => setShowCrossGenTable(false)}
                  className="p-3 hover:bg-[#141414]/10 rounded-full transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ALL_POKEMON.filter(p => p.evolvesTo).map(pokemon => {
                    const nextIdOrIds = pokemon.evolvesTo!;
                    const nextIds = Array.isArray(nextIdOrIds) ? nextIdOrIds : [nextIdOrIds];
                    
                    // Filter for cross-gen evolutions
                    const crossGenEvolutions = nextIds.filter(nextId => getGeneration(pokemon.id) !== getGeneration(nextId));
                    
                    if (crossGenEvolutions.length === 0) return null;

                    return crossGenEvolutions.map(nextId => {
                      const targetGen = getGeneration(nextId);
                      const isUnlocked = (collection.unlockedRegions || [1]).includes(targetGen);
                      const targetPokemon = getBasePokemon(nextId);

                      return (
                        <div 
                          key={`${pokemon.id}-${nextId}`}
                          className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-[#141414]/5 hover:border-purple-200 transition-all group"
                        >
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                              <img 
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                alt={pokemon.name}
                                className="w-10 h-10 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-mono opacity-40 uppercase">Gen {getGeneration(pokemon.id)}</p>
                              <p className="text-sm font-bold">{t(`pokemon.${pokemon.id}`)}</p>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />

                          <div className="flex-1 flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${isUnlocked ? 'bg-purple-50' : 'bg-slate-200'}`}>
                              {isUnlocked ? (
                                <img 
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nextId}.png`}
                                  alt={targetPokemon?.name}
                                  className="w-10 h-10 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Lock className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-mono opacity-40 uppercase">Gen {targetGen}</p>
                              <p className={`text-sm font-bold ${isUnlocked ? 'text-purple-700' : 'text-slate-400 italic'}`}>
                                {isUnlocked ? t(`pokemon.${nextId}`) : t('guide.cross_gen.mysterious')}
                              </p>
                              {!isUnlocked && (
                                <p className="text-[9px] text-red-400 font-bold uppercase tracking-tighter">{t('guide.cross_gen.region_locked')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
