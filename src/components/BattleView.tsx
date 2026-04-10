import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Heart, X, Swords } from 'lucide-react';
import { Card } from './Card';
import { Gym, Arena, Pokemon } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BattleState {
  playerTeam: Pokemon[];
  opponentTeam: Pokemon[];
  playerHp: number[];
  opponentHp: number[];
  currentPlayerIndex: number;
  currentOpponentIndex: number;
  turn: 'player' | 'opponent';
  logs: string[];
  isFinished: boolean;
  winner: 'player' | 'opponent' | 'draw' | null;
  isPlayerAttacking: boolean;
  isOpponentAttacking: boolean;
  isPlayerHit: boolean;
  isOpponentHit: boolean;
  damageNumber: { value: number; target: 'player' | 'opponent' } | null;
  shakeArena: boolean;
  selectedArena: Arena;
  currentGym: Gym | null;
}

interface BattleViewProps {
  battleState: BattleState;
  isAutoBattle: boolean;
  setIsAutoBattle: (val: boolean) => void;
  setView: (view: any) => void;
  handleAttack: (move: any) => void;
  playSound: (type: any) => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  battleState,
  isAutoBattle,
  setIsAutoBattle,
  setView,
  handleAttack,
  playSound
}) => {
  const { t } = useLanguage();

  return (
    <motion.div 
      key="battle-view"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        x: battleState.shakeArena ? [0, -10, 10, -10, 10, 0] : 0,
        y: battleState.shakeArena ? [0, -5, 5, -5, 5, 0] : 0
      }}
      exit={{ opacity: 0 }}
      className="py-8 flex flex-col items-center w-full min-h-screen relative"
    >
      {/* Arena Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.img 
          src={battleState.selectedArena.bgImage} 
          className="w-full h-full object-cover opacity-10 scale-110"
          animate={{
            scale: battleState.shakeArena ? 1.15 : 1.1,
            filter: battleState.shakeArena ? 'blur(2px) brightness(1.2)' : 'blur(0px) brightness(1)'
          }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#E4E3E0] via-transparent to-[#E4E3E0]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Floating Auto Battle Toggle for Mobile */}
        <div className="fixed bottom-24 right-6 z-40 sm:hidden">
          <button
            onClick={() => setIsAutoBattle(!isAutoBattle)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isAutoBattle 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-[#141414] text-[#E4E3E0]'
            }`}
          >
            <Zap className={`w-6 h-6 ${isAutoBattle ? 'fill-white' : ''}`} />
          </button>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#141414] text-[#E4E3E0] text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest">
            {isAutoBattle ? t('battle.auto_on') : t('battle.auto_off')}
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
          <button 
            onClick={() => setView('collection')}
            className="flex items-center gap-2 text-[#141414] hover:opacity-60 transition-opacity font-bold uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="w-5 h-5" /> {t('battle.quit')}
          </button>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsAutoBattle(!isAutoBattle)}
              className={`px-4 sm:px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all ${
                isAutoBattle 
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                  : 'bg-[#141414] text-[#E4E3E0] hover:bg-slate-800'
              }`}
            >
              {isAutoBattle ? t('battle.auto_on') : t('battle.auto_off')}
            </button>
            <div className="px-3 sm:px-4 py-2 bg-white border border-[#141414] rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span>{battleState.selectedArena.icon}</span>
              {t('arena.' + battleState.selectedArena.id)}
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Player Side */}
          <div className="flex flex-col items-center gap-6">
            {/* Bench / Waiting Area */}
            <div className="w-full h-16 flex justify-center gap-2 mb-2">
              {battleState.playerTeam.map((p, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    scale: i === battleState.currentPlayerIndex ? 1.2 : 1,
                    opacity: i < battleState.currentPlayerIndex ? 0.5 : 1,
                    borderColor: i === battleState.currentPlayerIndex ? '#ef4444' : '#141414'
                  }}
                  className={`w-12 h-12 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden shadow-sm relative ${i === battleState.currentPlayerIndex ? 'ring-2 ring-red-500/20' : ''}`}
                >
                  <img src={p.image} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                  {i < battleState.currentPlayerIndex && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="w-full h-24 bg-white rounded-2xl p-4 border border-[#141414] shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-sm uppercase tracking-widest">{t('battle.player_team')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="font-mono font-bold">
                    {battleState.playerHp[battleState.currentPlayerIndex]} / {battleState.playerTeam[battleState.currentPlayerIndex]?.hp}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(battleState.playerHp[battleState.currentPlayerIndex] / (battleState.playerTeam[battleState.currentPlayerIndex]?.hp || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="h-[400px] flex items-center justify-center relative w-full">
              <AnimatePresence mode="wait">
                {battleState.playerTeam[battleState.currentPlayerIndex] && (
                  <motion.div
                    key={`player-${battleState.currentPlayerIndex}-${battleState.playerTeam[battleState.currentPlayerIndex]?.id}`}
                    initial={{ x: -200, opacity: 0, rotate: -10 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    exit={{ 
                      y: 200, 
                      opacity: 0, 
                      rotate: 20,
                      transition: { duration: 0.8, ease: "easeIn" }
                    }}
                    className="relative"
                  >
                    <Card 
                      pokemon={battleState.playerTeam[battleState.currentPlayerIndex]!} 
                      isFlipped={true} 
                      size="normal" 
                      isAttacking={battleState.isPlayerAttacking}
                      isHit={battleState.isPlayerHit}
                      side="player"
                      currentHp={battleState.playerHp[battleState.currentPlayerIndex]}
                      playSound={playSound}
                    />
                    {/* Damage Number */}
                    <AnimatePresence>
                      {battleState.damageNumber?.target === 'player' && (
                        <motion.div
                          initial={{ opacity: 0, y: 0, scale: 0.5 }}
                          animate={{ opacity: 1, y: -100, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-red-600 font-black text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                        >
                          -{battleState.damageNumber.value}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              {battleState.playerTeam[battleState.currentPlayerIndex]?.moves.map((move, idx) => (
                <button
                  key={idx}
                  disabled={battleState.turn !== 'player' || battleState.isFinished}
                  onClick={() => handleAttack(move)}
                  className="p-4 bg-[#141414] text-[#E4E3E0] rounded-xl font-bold flex flex-col items-center gap-1 hover:bg-slate-800 disabled:opacity-50 transition-all group relative overflow-hidden"
                >
                  <span className="text-xs relative z-10">{t('move.' + move.name)}</span>
                  <span className="text-[10px] font-mono opacity-60 relative z-10">{t('battle.dmg')}: {move.damage} | {t('type.' + move.type)}</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Opponent Side */}
          <div className="flex flex-col items-center gap-6">
            {/* Bench / Waiting Area */}
            <div className="w-full h-16 flex justify-center gap-2 mb-2">
              {battleState.opponentTeam.map((p, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    scale: i === battleState.currentOpponentIndex ? 1.2 : 1,
                    opacity: i < battleState.currentOpponentIndex ? 0.5 : 1,
                    borderColor: i === battleState.currentOpponentIndex ? '#ef4444' : '#141414'
                  }}
                  className={`w-12 h-12 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden shadow-sm relative ${i === battleState.currentOpponentIndex ? 'ring-2 ring-red-500/20' : ''}`}
                >
                  <img src={p.image} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                  {i < battleState.currentOpponentIndex && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="w-full h-24 bg-white rounded-2xl p-4 border border-[#141414] shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-sm uppercase tracking-widest">
                    {battleState.currentGym ? t('battle.leader', { leader: t('gym.' + battleState.currentGym.id + '.leader') }) : t('battle.opponent_team')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="font-mono font-bold">
                    {battleState.opponentHp[battleState.currentOpponentIndex]} / {battleState.opponentTeam[battleState.currentOpponentIndex]?.hp}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-red-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(battleState.opponentHp[battleState.currentOpponentIndex] / (battleState.opponentTeam[battleState.currentOpponentIndex]?.hp || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="h-[400px] flex items-center justify-center relative w-full">
              <AnimatePresence mode="wait">
                {battleState.opponentTeam[battleState.currentOpponentIndex] && (
                  <motion.div
                    key={`opponent-${battleState.currentOpponentIndex}-${battleState.opponentTeam[battleState.currentOpponentIndex]?.id}`}
                    initial={{ x: 200, opacity: 0, rotate: 10 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    exit={{ 
                      y: 200, 
                      opacity: 0, 
                      rotate: -20,
                      transition: { duration: 0.8, ease: "easeIn" }
                    }}
                    className="relative"
                  >
                    <Card 
                      pokemon={battleState.opponentTeam[battleState.currentOpponentIndex]!} 
                      isFlipped={true} 
                      size="normal" 
                      isAttacking={battleState.isOpponentAttacking}
                      isHit={battleState.isOpponentHit}
                      side="opponent"
                      currentHp={battleState.opponentHp[battleState.currentOpponentIndex]}
                      playSound={playSound}
                    />
                    {/* Damage Number */}
                    <AnimatePresence>
                      {battleState.damageNumber?.target === 'opponent' && (
                        <motion.div
                          initial={{ opacity: 0, y: 0, scale: 0.5 }}
                          animate={{ opacity: 1, y: -100, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-red-600 font-black text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                        >
                          -{battleState.damageNumber.value}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="w-full h-32 bg-[#141414]/5 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] space-y-1 border border-[#141414]/10">
              <p className="opacity-40 uppercase mb-2">{t('battle.logs')}</p>
              {battleState.logs.map((log, idx) => (
                <p key={idx} className={`border-l-2 pl-2 ${log.includes('super effective') || log.includes('效果絕佳') ? 'text-green-600 border-green-600 font-bold' : log.includes('not very effective') || log.includes('效果不理想') ? 'text-orange-600 border-orange-600' : 'border-[#141414]'}`}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {battleState.isFinished && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border-4 border-[#141414] shadow-2xl text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${battleState.winner === 'player' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Swords className="w-10 h-10" />
            </div>
            <h3 className="text-4xl font-bold tracking-tighter mb-2 italic serif uppercase">
              {battleState.winner === 'player' ? t('battle.victory') : t('battle.defeat')}
            </h3>
            <p className="text-sm opacity-60 font-mono uppercase mb-8">
              {battleState.winner === 'player' 
                ? (battleState.currentGym 
                    ? t('battle.gym_win', { leader: t('gym.' + battleState.currentGym.id + '.leader'), badge: t('gym.' + battleState.currentGym.id + '.badge') }) 
                    : t('battle.wild_win'))
                : t('battle.lose_desc')}
            </p>

            {battleState.winner === 'player' && battleState.currentGym && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="mb-8 p-6 bg-yellow-50 rounded-3xl border-2 border-yellow-400 inline-block relative"
              >
                <div className="text-6xl mb-2">{battleState.currentGym.badgeIcon}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-yellow-700">{t('gym.' + battleState.currentGym.id + '.badge')}</div>
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                  +
                </div>
              </motion.div>
            )}

            {battleState.winner === 'player' && !battleState.currentGym && (
              <div className="flex justify-center gap-4 mb-8">
                {battleState.opponentTeam.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-24 h-32 bg-slate-50 rounded-xl border-2 border-slate-200 p-2 flex items-center justify-center relative overflow-hidden group">
                      <img src={p.image} className="w-20 h-20 object-contain z-10" referrerPolicy="no-referrer" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setView('collection')}
              className="w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              {t('battle.back')}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
