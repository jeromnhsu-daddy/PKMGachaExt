/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  Info, 
  RefreshCw,
  ArrowUpDown,
  ArrowLeft,
  X,
  Maximize2,
  Swords,
  Heart,
  Zap,
  Volume2,
  VolumeX,
  Languages,
  Gift,
  Lock,
  Settings,
  Terminal
} from 'lucide-react';
import { POKEMON_NAMES, getPokemonImage, getPokemonData, TYPE_EFFECTIVENESS, EVOLUTION_MAP, ARENAS, GYMS, ALL_POKEMON, getGeneration } from './constants';
import { SHOP_ITEMS } from './constants/items';
import { Pokemon, CollectionState, Move, Rarity, Arena, Gym, SortOption } from './types';
import { PokeballIcon, TypeBadge } from './components/Common';
import { Card } from './components/Card';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './i18n';

// Lazy load views for better performance
const DrawView = lazy(() => import('./components/DrawView').then(m => ({ default: m.DrawView })));
const BattleView = lazy(() => import('./components/BattleView').then(m => ({ default: m.BattleView })));
const ShopView = lazy(() => import('./components/ShopView').then(m => ({ default: m.ShopView })));
const GymSelectView = lazy(() => import('./components/GymSelectView').then(m => ({ default: m.GymSelectView })));
const TeamSelectView = lazy(() => import('./components/TeamSelectView').then(m => ({ default: m.TeamSelectView })));
const GuideView = lazy(() => import('./components/GuideView').then(m => ({ default: m.GuideView })));
const MapView = lazy(() => import('./components/MapView').then(m => ({ default: m.MapView })));
const TradeView = lazy(() => import('./components/TradeView').then(m => ({ default: m.TradeView })));

const getEffectiveness = (moveType: string, targetTypes: string[]) => {
  let multiplier = 1;
  targetTypes.forEach(type => {
    if (TYPE_EFFECTIVENESS[moveType] && TYPE_EFFECTIVENESS[moveType][type] !== undefined) {
      multiplier *= TYPE_EFFECTIVENESS[moveType][type];
    }
  });
  return multiplier;
};

// --- Sound Effects ---
// Moved inside App component to support muting

// --- Components ---
// Moved to separate files: PokeballIcon, TypeBadge, Card, BattleView, ShopView, GymSelectView, TeamSelectView, DrawView

type View = 'draw' | 'collection' | 'battle' | 'select-team' | 'shop' | 'gyms' | 'guide' | 'map' | 'trade';

function AppContent() {
  const { t, lang, setLang } = useLanguage();
  const [collection, setCollection] = useState<CollectionState>(() => {
    const saved = localStorage.getItem('pokemon-collection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration if it was the old format [id]: boolean
        if (typeof parsed === 'object' && !('cards' in parsed)) {
          const cards: { [id: number]: number } = {};
          Object.keys(parsed).forEach(id => {
            if (parsed[id]) cards[Number(id)] = 1;
          });
          return { 
            cards, 
            coins: 1000, 
            hpMap: {}, 
            attackBoosts: {},
            defenseBoosts: {},
            transferUses: {},
            lastHealTime: Date.now(), 
            badges: [], 
            inventory: {}, 
            lang: 'en', 
            lastDailyReward: 0,
            currentRegion: 1,
            unlockedRegions: [1],
            isInfiniteCoins: false
          };
        }
        return {
          ...parsed,
          hpMap: parsed.hpMap || {},
          attackBoosts: parsed.attackBoosts || {},
          defenseBoosts: parsed.defenseBoosts || {},
          transferUses: parsed.transferUses || {},
          lastHealTime: parsed.lastHealTime || Date.now(),
          badges: parsed.badges || [],
          inventory: parsed.inventory || {},
          lang: parsed.lang || 'en',
          lastDailyReward: parsed.lastDailyReward || 0,
          currentRegion: parsed.currentRegion || 1,
          unlockedRegions: parsed.unlockedRegions || [1],
          isInfiniteCoins: parsed.isInfiniteCoins || false
        };
      } catch (e) {
        return { 
          cards: {}, 
          coins: 1000, 
          hpMap: {}, 
          attackBoosts: {},
          defenseBoosts: {},
          transferUses: {},
          lastHealTime: Date.now(), 
          badges: [], 
          inventory: {}, 
          lang: 'en', 
          lastDailyReward: 0, 
          currentRegion: 1, 
          unlockedRegions: [1], 
          isInfiniteCoins: false 
        };
      }
    }
    return { 
      cards: {}, 
      coins: 1000, 
      hpMap: {}, 
      attackBoosts: {},
      defenseBoosts: {},
      transferUses: {},
      lastHealTime: Date.now(), 
      badges: [], 
      inventory: {}, 
      lang: 'en', 
      lastDailyReward: 0, 
      currentRegion: 1, 
      unlockedRegions: [1], 
      isInfiniteCoins: false 
    };
  });

  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [isEnteringPassword, setIsEnteringPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Sync lang state with collection
  useEffect(() => {
    if (collection.lang && collection.lang !== lang) {
      setLang(collection.lang);
    }
  }, [collection.lang]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawEffect, setDrawEffect] = useState<'none' | 'rare' | 'legendary'>('none');
  const [currentCard, setCurrentCard] = useState<Pokemon | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drawId, setDrawId] = useState(0);
  const [view, setView] = useState<View>('draw');
  const [activeCollectionGen, setActiveCollectionGen] = useState<number>(1);
  const [activeTeamGen, setActiveTeamGen] = useState<number>(1);
  const [activeShopGen, setActiveShopGen] = useState<number>(1);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [healingPokemonId, setHealingPokemonId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Set activeTeamGen to current region when entering team select
  useEffect(() => {
    if (view === 'select-team') {
      setActiveTeamGen(collection.currentRegion || 1);
    }
    if (view === 'shop') {
      setActiveShopGen(collection.currentRegion || 1);
    }
  }, [view, collection.currentRegion]);

  const getPokemonWithBoosts = useCallback((id: number) => {
    const attackBoost = collection.attackBoosts?.[id] || 0;
    const defenseBoost = collection.defenseBoosts?.[id] || 0;
    return getPokemonData(id, attackBoost, defenseBoost);
  }, [collection.attackBoosts, collection.defenseBoosts]);

  const currentSelectedPokemon = useMemo(() => {
    if (!selectedPokemon) return null;
    return getPokemonWithBoosts(selectedPokemon.id);
  }, [selectedPokemon, getPokemonWithBoosts]);

  // --- Sound Effects ---
  const playSound = useCallback((type: 'flip' | 'hit' | 'victory' | 'defeat' | 'draw' | 'exp' | 'evolve' | 'battle' | 'click') => {
    if (isMuted) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);

      const now = ctx.currentTime;

      if (type === 'flip' || type === 'draw') {
        // Card Flip/Draw: Quick high-pitched snap
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'click') {
        // UI Click: Short, subtle blip
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'hit') {
        // Impact: Low thud + White noise burst
        // 1. Thud
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);

        // 2. Noise burst
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
      } else if (type === 'victory') {
        // Fanfare: Major arpeggio (C4, E4, G4, C5)
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        });
      } else if (type === 'defeat') {
        // Sad slide: Downward frequency
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.5);
        g.gain.setValueAtTime(0.1, now);
        g.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'evolve') {
        // Magical sparkle: Rapid rising frequency
        for (let i = 0; i < 10; i++) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400 + i * 100, now + i * 0.05);
          g.gain.setValueAtTime(0, now + i * 0.05);
          g.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.3);
        }
      } else if (type === 'battle') {
        // Alert: Two quick pulses
        [0, 0.15].forEach(delay => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now + delay);
          g.gain.setValueAtTime(0.2, now + delay);
          g.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
      } else if (type === 'exp') {
        // Level up/Coins: High chime
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  }, [isMuted]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('id');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const [isEvolving, setIsEvolving] = useState(false);
  const [isAutoBattle, setIsAutoBattle] = useState(false);
  const [showBattleModeModal, setShowBattleModeModal] = useState(false);
  const [showArenaModal, setShowArenaModal] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Arena>(ARENAS[0]);
  const [pendingGym, setPendingGym] = useState<Gym | null>(null);
  const [shopCards, setShopCards] = useState<Pokemon[]>([]);
  const [shopTab, setShopTab] = useState<'buy' | 'sell' | 'items' | 'trade'>('items');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Battle State
  const [battleState, setBattleState] = useState<{
    playerTeam: Pokemon[];
    opponentTeam: Pokemon[];
    playerHp: number[];
    opponentHp: number[];
    currentPlayerIndex: number;
    currentOpponentIndex: number;
    turn: 'player' | 'opponent';
    logs: string[];
    isFinished: boolean;
    isPlayerAttacking: boolean;
    isOpponentAttacking: boolean;
    isPlayerHit: boolean;
    isOpponentHit: boolean;
    damageNumber: { value: number; target: 'player' | 'opponent' } | null;
    winner: 'player' | 'opponent' | null;
    shakeArena: boolean;
    selectedArena: Arena;
    currentGym: Gym | null;
  }>({
    playerTeam: [],
    opponentTeam: [],
    playerHp: [],
    opponentHp: [],
    currentPlayerIndex: 0,
    currentOpponentIndex: 0,
    turn: 'player',
    logs: [],
    isFinished: false,
    isPlayerAttacking: false,
    isOpponentAttacking: false,
    isPlayerHit: false,
    isOpponentHit: false,
    damageNumber: null,
    winner: null,
    shakeArena: false,
    selectedArena: ARENAS[0],
    currentGym: null
  });

  const [selectedTeam, setSelectedTeam] = useState<Pokemon[]>([]);

  useEffect(() => {
    localStorage.setItem('pokemon-collection', JSON.stringify(collection));
  }, [collection]);

  // Save HP during battle
  useEffect(() => {
    if (view === 'battle' && battleState.playerTeam.length > 0) {
      setCollection(prev => {
        const newHpMap = { ...(prev.hpMap || {}) };
        let hasChanges = false;
        
        battleState.playerTeam.forEach((p, i) => {
          const currentHp = battleState.playerHp[i];
          if (newHpMap[p.id] !== currentHp) {
            newHpMap[p.id] = currentHp;
            hasChanges = true;
          }
        });

        if (!hasChanges) return prev;
        return { ...prev, hpMap: newHpMap };
      });
    }
  }, [battleState.playerHp, view, battleState.playerTeam]);

  // HP Recovery Mechanism
  useEffect(() => {
    const healInterval = setInterval(() => {
      setCollection(prev => {
        const now = Date.now();
        const lastHeal = prev.lastHealTime || now;
        const secondsPassed = Math.floor((now - lastHeal) / 1000);
        
        // Calculate how many 10-minute intervals have passed
        const intervalsPassed = Math.floor(secondsPassed / 600);
        
        if (intervalsPassed < 1) return prev;

        const newHpMap = { ...(prev.hpMap || {}) };
        let hasChanges = false;

        Object.keys(prev.cards).forEach(idStr => {
          const id = Number(idStr);
          const pokemon = getPokemonWithBoosts(id);
          const currentHp = newHpMap[id] !== undefined ? newHpMap[id] : pokemon.hp;
          
          if (currentHp < pokemon.hp) {
            // Heal 5% of max HP for each 10-minute interval passed
            const healPerInterval = Math.max(1, Math.floor(pokemon.hp * 0.05));
            const totalHeal = healPerInterval * intervalsPassed;
            newHpMap[id] = Math.min(pokemon.hp, currentHp + totalHeal);
            hasChanges = true;
          }
        });

        // Update lastHealTime by the number of intervals processed to keep the remainder
        const nextHealTime = lastHeal + (intervalsPassed * 600 * 1000);

        if (!hasChanges) return { ...prev, lastHealTime: nextHealTime };

        return {
          ...prev,
          hpMap: newHpMap,
          lastHealTime: nextHealTime
        };
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(healInterval);
  }, []);

  // --- Body Scroll Lock ---
  useEffect(() => {
    if (selectedPokemon) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPokemon]);

  const buyItem = (item: any) => {
    if (!collection.isInfiniteCoins && collection.coins < item.price) {
      setToast({ message: 'Not enough coins!', type: 'error' });
      return;
    }
    setCollection(prev => ({
      ...prev,
      coins: prev.isInfiniteCoins ? prev.coins : prev.coins - item.price,
      inventory: {
        ...prev.inventory,
        [item.id]: (prev.inventory[item.id] || 0) + 1
      }
    }));
    playSound('exp');
    setToast({ message: t('shop.bought_toast', { name: t(`item.${item.id}.name`) }), type: 'success' });
  };

  const useItem = (itemId: string, pokemon: Pokemon) => {
    const count = collection.inventory[itemId] || 0;
    if (count <= 0) return;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'evolution-candy') {
      const nextIdOrIds = EVOLUTION_MAP[pokemon.id];
      if (!nextIdOrIds) {
        setToast({ message: t('item.cannotEvolve', { name: t(`pokemon.${pokemon.id}`) }), type: 'error' });
        return;
      }

      setCollection(prev => {
        const newInventory = { ...prev.inventory };
        newInventory[itemId]--;
        if (newInventory[itemId] <= 0) delete newInventory[itemId];
        return { ...prev, inventory: newInventory };
      });

      setIsEvolving(true);
      playSound('evolve');

      setTimeout(() => {
        let nextId: number;
        if (Array.isArray(nextIdOrIds)) {
          nextId = nextIdOrIds[Math.floor(Math.random() * nextIdOrIds.length)];
        } else {
          nextId = nextIdOrIds;
        }

        const evolvedPokemon = getPokemonWithBoosts(nextId);

        setCollection(prev => {
          const newCards = { ...prev.cards };
          newCards[nextId] = (newCards[nextId] || 0) + 1;
          const newHpMap = { ...prev.hpMap };
          newHpMap[nextId] = evolvedPokemon.hp;
          return { ...prev, cards: newCards, hpMap: newHpMap };
        });

        setToast({ message: t('item.evolveSuccess', { name: t(`pokemon.${pokemon.id}`), evolved: t(`pokemon.${evolvedPokemon.id}`) }), type: 'success' });
        if (selectedPokemon?.id === pokemon.id) {
          setSelectedPokemon(evolvedPokemon);
        }
        
        setTimeout(() => {
          setIsEvolving(false);
        }, 500);
      }, 1500);
      return;
    }

    setCollection(prev => {
      const newInventory = { ...prev.inventory };
      newInventory[itemId]--;
      if (newInventory[itemId] <= 0) delete newInventory[itemId];

      const newHpMap = { ...(prev.hpMap || {}) };
      const newCards = { ...prev.cards };

      if (item.type === 'heal' && item.value) {
        const currentHp = newHpMap[pokemon.id] !== undefined ? newHpMap[pokemon.id] : pokemon.hp;
        if (currentHp >= pokemon.hp) {
          setToast({ message: t('item.alreadyFullHp', { name: t(`pokemon.${pokemon.id}`) }), type: 'error' });
          return prev;
        }
        newHpMap[pokemon.id] = Math.min(pokemon.hp, currentHp + item.value);
        setHealingPokemonId(pokemon.id);
        setTimeout(() => setHealingPokemonId(null), 1000);
      } else if (item.type === 'full-heal') {
        const currentHp = newHpMap[pokemon.id] !== undefined ? newHpMap[pokemon.id] : pokemon.hp;
        if (currentHp >= pokemon.hp) {
          setToast({ message: t('item.alreadyFullHp', { name: t(`pokemon.${pokemon.id}`) }), type: 'error' });
          return prev;
        }
        newHpMap[pokemon.id] = pokemon.hp;
        setHealingPokemonId(pokemon.id);
        setTimeout(() => setHealingPokemonId(null), 1000);
      } else if (item.type === 'rare-candy') {
        newCards[pokemon.id] = (newCards[pokemon.id] || 0) + 1;
      } else if (item.type === 'attack-boost') {
        const newAttackBoosts = { ...(prev.attackBoosts || {}) };
        newAttackBoosts[pokemon.id] = (newAttackBoosts[pokemon.id] || 0) + (item.value || 0);
        return {
          ...prev,
          inventory: newInventory,
          attackBoosts: newAttackBoosts
        };
      } else if (item.type === 'defense-boost') {
        const newDefenseBoosts = { ...(prev.defenseBoosts || {}) };
        newDefenseBoosts[pokemon.id] = (newDefenseBoosts[pokemon.id] || 0) + (item.value || 0);
        return {
          ...prev,
          inventory: newInventory,
          defenseBoosts: newDefenseBoosts
        };
      } else if (item.type === 'transfer-ball-1' || item.type === 'transfer-ball-3' || item.type === 'transfer-ball-inf') {
        const newTransferUses = { ...(prev.transferUses || {}) };
        const currentValue = newTransferUses[pokemon.id] || 0;
        
        if (item.type === 'transfer-ball-inf') {
          newTransferUses[pokemon.id] = -1;
        } else if (currentValue !== -1) {
          newTransferUses[pokemon.id] = currentValue + (item.value || 0);
        } else {
          setToast({ message: t('shop.transfer_permanent'), type: 'error' });
          return prev;
        }
        
        return {
          ...prev,
          inventory: newInventory,
          transferUses: newTransferUses
        };
      }

      return {
        ...prev,
        inventory: newInventory,
        hpMap: newHpMap,
        cards: newCards
      };
    });

    playSound('exp');
    setToast({ message: t('item.used', { item: t(`item.${item.id}.name`), name: t(`pokemon.${pokemon.id}`) }), type: 'success' });
  };

  const handleSwitchRegion = (regionId: number) => {
    setCollection(prev => ({
      ...prev,
      currentRegion: regionId
    }));
    setActiveCollectionGen(regionId);
    playSound('click');
    setView('draw');
    refreshShop();
    setSelectedTeam([]);
  };

  const handleJumpToRegion = (regionId: number) => {
    setCollection(prev => {
      const newCards = { ...prev.cards };
      const unlockedRegions = Array.from({ length: regionId }, (_, i) => i + 1);
      
      // Fill previous generations
      ALL_POKEMON.forEach(p => {
        const pGen = getGeneration(p.id);
        if (pGen < regionId) {
          if (!newCards[p.id]) newCards[p.id] = 1;
        }
      });

      return {
        ...prev,
        cards: newCards,
        unlockedRegions,
        currentRegion: regionId
      };
    });
    setSelectedTeam([]);
    setActiveCollectionGen(regionId);
    setToast({ message: t('dev.success'), type: 'success' });
    playSound('victory');
  };

  const clearRegionCards = (regionId: number) => {
    setCollection(prev => {
      const newCards = { ...prev.cards };
      ALL_POKEMON.forEach(p => {
        if (getGeneration(p.id) === regionId) {
          delete newCards[p.id];
        }
      });
      return { ...prev, cards: newCards };
    });
    setToast({ message: t('dev.clear_success'), type: 'success' });
    playSound('click');
  };

  const fillRegionCards = (regionId: number) => {
    setCollection(prev => {
      const newCards = { ...prev.cards };
      ALL_POKEMON.forEach(p => {
        if (getGeneration(p.id) === regionId) {
          if (!newCards[p.id]) newCards[p.id] = 1;
        }
      });
      return { ...prev, cards: newCards };
    });
    setToast({ message: t('dev.fill_success'), type: 'success' });
    playSound('victory');
  };

  const resetAllSettings = () => {
    const initialState = { 
      cards: {}, 
      coins: 1000, 
      hpMap: {}, 
      lastHealTime: Date.now(), 
      badges: [], 
      inventory: {}, 
      lang: lang as Language, 
      lastDailyReward: 0, 
      currentRegion: 1, 
      unlockedRegions: [1], 
      isInfiniteCoins: false 
    };
    setCollection(initialState);
    localStorage.removeItem('pokemon-collection');
    setToast({ message: t('dev.reset_success'), type: 'success' });
    playSound('victory');
    setView('draw');
    setIsDevPanelOpen(false);
  };

  const checkRegionUnlock = useCallback(() => {
    const currentRegion = collection.currentRegion || 1;
    const unlockedRegions = collection.unlockedRegions || [1];
    
    // Only check if next region is not already unlocked
    if (unlockedRegions.includes(currentRegion + 1)) return;
    if (currentRegion >= 4) return;

    const regionPokemon = ALL_POKEMON.filter(p => {
      if (currentRegion === 1) return p.id <= 151;
      if (currentRegion === 2) return p.id > 151 && p.id <= 251;
      if (currentRegion === 3) return p.id > 251 && p.id <= 386;
      if (currentRegion === 4) return p.id > 386 && p.id <= 493;
      return false;
    });

    const isComplete = regionPokemon.every(p => collection.cards[p.id]);

    if (isComplete) {
      setCollection(prev => ({
        ...prev,
        unlockedRegions: [...(prev.unlockedRegions || [1]), currentRegion + 1]
      }));
      setToast({ message: t('region.complete'), type: 'success' });
      playSound('victory');
    }
  }, [collection.cards, collection.currentRegion, collection.unlockedRegions, t, playSound]);

  useEffect(() => {
    checkRegionUnlock();
  }, [collection.cards]);

  const handleDraw = () => {
    if (isDrawing) return;
    
    if (!collection.isInfiniteCoins && collection.coins < 100) {
      setToast({ message: t('draw.insufficient'), type: 'error' });
      return;
    }

    const regionId = collection.currentRegion || 1;
    const regionPokemon = ALL_POKEMON.filter(p => {
      if (regionId === 1) return p.id <= 151;
      if (regionId === 2) return p.id > 151 && p.id <= 251;
      if (regionId === 3) return p.id > 251 && p.id <= 386;
      if (regionId === 4) return p.id > 386 && p.id <= 493;
      return false;
    });

    if (regionPokemon.length === 0) return;

    playSound('draw');
    setIsDrawing(true);
    setIsFlipped(false);
    setCurrentCard(null);
    setDrawEffect('none');
    setDrawId(prev => prev + 1);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * regionPokemon.length);
      const randomId = regionPokemon[randomIndex].id;
      const newPokemon = getPokemonWithBoosts(randomId);
      setCurrentCard(newPokemon);
      setIsDrawing(false);

      if (newPokemon.rarity === 'Legendary') setDrawEffect('legendary');
      else if (newPokemon.rarity === 'Rare') setDrawEffect('rare');

      setTimeout(() => {
        playSound('flip');
        setIsFlipped(true);
        setCollection(prev => ({
          ...prev,
          coins: prev.isInfiniteCoins ? prev.coins : prev.coins - 100,
          cards: { ...prev.cards, [randomId]: (prev.cards[randomId] || 0) + 1 },
          hpMap: { ...prev.hpMap, [randomId]: newPokemon.hp }
        }));
        setToast({ message: t('draw.new', { name: t(`pokemon.${newPokemon.id}`) }), type: 'success' });
        
        // Reset effect after some time
        setTimeout(() => setDrawEffect('none'), 3000);
      }, 400); // Faster flip start
    }, 400); // Faster draw preparation
  };

  const claimDailyReward = () => {
    const now = Date.now();
    const lastClaimed = collection.lastDailyReward || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastClaimed < oneDay) {
      setToast({ message: t('shop.claimed'), type: 'error' });
      return;
    }

    setCollection(prev => ({
      ...prev,
      coins: prev.coins + 500,
      lastDailyReward: now
    }));
    playSound('exp');
    setToast({ message: t('shop.reward_toast'), type: 'success' });
  };

  const getWeaknesses = (type: string) => {
    const weaknesses: string[] = [];
    Object.entries(TYPE_EFFECTIVENESS).forEach(([moveType, effectiveness]) => {
      if (effectiveness[type] && effectiveness[type] > 1) {
        weaknesses.push(moveType);
      }
    });
    return weaknesses;
  };

  const startGymBattle = (gym: Gym, team: Pokemon[]) => {
    const opponentTeam = gym.pokemonIds.map(id => getPokemonData(id));
    
    const playerHp = team.map(p => collection.hpMap?.[p.id] !== undefined ? collection.hpMap[p.id] : p.hp);
    const opponentHp = opponentTeam.map(p => p.hp);
    
    const playerFirst = team[0].speed >= opponentTeam[0].speed;

    // Consume transfer uses
    setCollection(prev => {
      const newTransferUses = { ...(prev.transferUses || {}) };
      let changed = false;
      team.forEach(p => {
        if (p.generation !== (prev.currentRegion || 1)) {
          const uses = newTransferUses[p.id] || 0;
          if (uses > 0) {
            newTransferUses[p.id] = uses - 1;
            changed = true;
          }
        }
      });
      return changed ? { ...prev, transferUses: newTransferUses } : prev;
    });

    setBattleState({
      playerTeam: team,
      opponentTeam,
      playerHp,
      opponentHp,
      currentPlayerIndex: 0,
      currentOpponentIndex: 0,
      turn: playerFirst ? 'player' : 'opponent',
      logs: [t('gym.challenge', { name: t(`gym.${gym.id}.name`) }), t('gym.leaderChallenge', { leader: t(`gym.${gym.id}.leader`) }), `${t(`pokemon.${team[0].id}`)} vs ${t(`pokemon.${opponentTeam[0].id}`)}`],
      isFinished: false,
      isPlayerAttacking: false,
      isOpponentAttacking: false,
      isPlayerHit: false,
      isOpponentHit: false,
      damageNumber: null,
      winner: null,
      shakeArena: false,
      selectedArena: ARENAS.find(a => a.id === gym.arenaId) || ARENAS[0],
      currentGym: gym
    });
    setView('battle');
    playSound('battle');

    if (!playerFirst) {
      setTimeout(() => executeOpponentTurn(playerHp, opponentHp, 0, 0, team, opponentTeam, [t('gym.challenge', { name: t(`gym.${gym.id}.name`) }), t('gym.leaderChallenge', { leader: t(`gym.${gym.id}.leader`) }), `${t(`pokemon.${team[0].id}`)} vs ${t(`pokemon.${opponentTeam[0].id}`)}`]), 1500);
    }
  };

  const startStandardBattle = (team: Pokemon[]) => {
    const regionId = collection.currentRegion || 1;
    const regionPokemon = ALL_POKEMON.filter(p => {
      if (regionId === 1) return p.id <= 151;
      if (regionId === 2) return p.id > 151 && p.id <= 251;
      if (regionId === 3) return p.id > 251 && p.id <= 386;
      if (regionId === 4) return p.id > 386 && p.id <= 493;
      return false;
    });

    const opponentTeam = Array.from({ length: team.length }, () => {
      const randomIndex = Math.floor(Math.random() * regionPokemon.length);
      const randomId = regionPokemon[randomIndex].id;
      return getPokemonData(randomId);
    });

    // Consume transfer uses
    setCollection(prev => {
      const newTransferUses = { ...(prev.transferUses || {}) };
      let changed = false;
      team.forEach(p => {
        if (p.generation !== (prev.currentRegion || 1)) {
          const uses = newTransferUses[p.id] || 0;
          if (uses > 0) {
            newTransferUses[p.id] = uses - 1;
            changed = true;
          }
        }
      });
      return changed ? { ...prev, transferUses: newTransferUses } : prev;
    });

    const playerHp = team.map(p => collection.hpMap?.[p.id] !== undefined ? collection.hpMap[p.id] : p.hp);
    const opponentHp = opponentTeam.map(p => p.hp);
    
    const playerFirst = team[0].speed >= opponentTeam[0].speed;

    setBattleState({
      playerTeam: team,
      opponentTeam,
      playerHp,
      opponentHp,
      currentPlayerIndex: 0,
      currentOpponentIndex: 0,
      turn: playerFirst ? 'player' : 'opponent',
      logs: [t('battle.startStandard', { arena: t(`arena.${selectedArena.id}.name`), count: team.length }), `${t(`pokemon.${team[0].id}`)} vs ${t(`pokemon.${opponentTeam[0].id}`)}`],
      isFinished: false,
      isPlayerAttacking: false,
      isOpponentAttacking: false,
      isPlayerHit: false,
      isOpponentHit: false,
      damageNumber: null,
      winner: null,
      shakeArena: false,
      selectedArena: selectedArena
    });
    setView('battle');
    playSound('battle');

    if (!playerFirst) {
      setTimeout(() => executeOpponentTurn(playerHp, opponentHp, 0, 0, team, opponentTeam, [t('battle.startStandard', { arena: t(`arena.${selectedArena.id}.name`), count: team.length }), `${t(`pokemon.${team[0].id}`)} vs ${t(`pokemon.${opponentTeam[0].id}`)}`]), 1500);
    }
  };

  useEffect(() => {
    if (view === 'battle' && isAutoBattle && battleState.turn === 'player' && !battleState.isFinished && !battleState.isPlayerAttacking && !battleState.isOpponentAttacking && !battleState.isPlayerHit && !battleState.isOpponentHit) {
      const timer = setTimeout(() => {
        const pIdx = battleState.currentPlayerIndex;
        const moves = battleState.playerTeam[pIdx].moves;
        const move = moves[Math.floor(Math.random() * moves.length)];
        handleAttack(move);
      }, isAutoBattle ? 500 : 1000);
      return () => clearTimeout(timer);
    }
  }, [view, isAutoBattle, battleState.turn, battleState.isFinished, battleState.isPlayerAttacking, battleState.isOpponentAttacking, battleState.isPlayerHit, battleState.isOpponentHit, battleState.currentPlayerIndex]);

  const executeOpponentTurn = (
    playerHp: number[], 
    opponentHp: number[], 
    pIdx: number, 
    oIdx: number, 
    pTeam: Pokemon[], 
    oTeam: Pokemon[],
    logs: string[]
  ) => {
    if (pIdx >= pTeam.length || oIdx >= oTeam.length) return;

    setBattleState(prev => ({ ...prev, isOpponentAttacking: true }));
    
    const attackDelay = isAutoBattle ? 300 : 600;
    const resetDelay = isAutoBattle ? 400 : 800;

    setTimeout(() => {
      const attacker = oTeam[oIdx];
      const target = pTeam[pIdx];
      const move = attacker.moves[Math.floor(Math.random() * 2)];
      
      const effectiveness = getEffectiveness(move.type, target.types);
      const arenaBonus = battleState.selectedArena.boostedTypes.includes(move.type) ? 1.3 : 1.0;
      const rawDamage = move.damage * effectiveness * arenaBonus;
      const damage = Math.max(5, Math.floor(rawDamage - (target.defense / 4)));
      
      playSound('hit');
      const newPlayerHp = [...playerHp];
      newPlayerHp[pIdx] = Math.max(0, playerHp[pIdx] - damage);
      
      let effectMsg = "";
      if (arenaBonus > 1) effectMsg += ` ${t('battle.log.arenaBoost')}`;
      if (effectiveness > 1) effectMsg += ` ${t('battle.log.superEffective')}`;
      if (effectiveness < 1 && effectiveness > 0) effectMsg += ` ${t('battle.log.notVeryEffective')}`;
      if (effectiveness === 0) effectMsg += ` ${t('battle.log.noEffect')}`;

      setBattleState(prev => {
        const newLogs = [...prev.logs, t('battle.log.attack', { 
          attacker: t(`pokemon.${attacker.id}`), 
          move: t('move.' + move.name), 
          effect: effectMsg, 
          damage 
        })];
        let nextPIdx = pIdx;
        let finished = false;
        let winner: 'player' | 'opponent' | null = null;

        if (newPlayerHp[pIdx] === 0) {
          newLogs.push(t('battle.log.fainted', { name: t(`pokemon.${target.id}`) }));
          nextPIdx++;
          if (nextPIdx >= pTeam.length) {
            newLogs.push(t('battle.log.allFaintedDefeat'));
            finished = true;
            winner = 'opponent';
            setTimeout(() => playSound('defeat'), 500);
          } else {
            newLogs.push(t('battle.log.go', { name: t(`pokemon.${pTeam[nextPIdx].id}`) }));
          }
        }

        return {
          ...prev,
          playerHp: newPlayerHp,
          logs: newLogs,
          isOpponentAttacking: false,
          isPlayerHit: true,
          damageNumber: { value: damage, target: 'player' },
          shakeArena: true,
          _nextPIdx: nextPIdx,
          _finished: finished,
          _winner: winner
        };
      });

      // Reset hit effect and damage number
      setTimeout(() => {
        setBattleState(prev => ({ 
          ...prev, 
          isPlayerHit: false, 
          damageNumber: null, 
          shakeArena: false,
          currentPlayerIndex: (prev as any)._nextPIdx ?? pIdx,
          turn: 'player',
          isFinished: (prev as any)._finished ?? false,
          winner: (prev as any)._winner ?? null
        }));
      }, resetDelay);
    }, attackDelay);
  };

  const handleAttack = (move: Move) => {
    if (battleState.turn !== 'player' || battleState.isFinished) return;

    setBattleState(prev => ({ ...prev, isPlayerAttacking: true }));

    const attackDelay = isAutoBattle ? 300 : 600;
    const resetDelay = isAutoBattle ? 400 : 800;

    setTimeout(() => {
      const pIdx = battleState.currentPlayerIndex;
      const oIdx = battleState.currentOpponentIndex;
      const attacker = battleState.playerTeam[pIdx];
      const target = battleState.opponentTeam[oIdx];
      
      const effectiveness = getEffectiveness(move.type, target.types);
      const arenaBonus = battleState.selectedArena.boostedTypes.includes(move.type) ? 1.3 : 1.0;
      const rawDamage = move.damage * effectiveness * arenaBonus;
      const damage = Math.max(5, Math.floor(rawDamage - (target.defense / 4)));
      
      playSound('hit');
      const newOpponentHp = [...battleState.opponentHp];
      newOpponentHp[oIdx] = Math.max(0, battleState.opponentHp[oIdx] - damage);
      
      let effectMsg = "";
      if (arenaBonus > 1) effectMsg += ` ${t('battle.log.arenaBoost')}`;
      if (effectiveness > 1) effectMsg += ` ${t('battle.log.superEffective')}`;
      if (effectiveness < 1 && effectiveness > 0) effectMsg += ` ${t('battle.log.notVeryEffective')}`;
      if (effectiveness === 0) effectMsg += ` ${t('battle.log.noEffect')}`;

      setBattleState(prev => {
        const newLogs = [...prev.logs, t('battle.log.attack', { 
          attacker: t(`pokemon.${attacker.id}`), 
          move: t('move.' + move.name), 
          effect: effectMsg, 
          damage 
        })];
        let nextOIdx = oIdx;
        let finished = false;
        let winner: 'player' | 'opponent' | null = null;

        if (newOpponentHp[oIdx] === 0) {
          newLogs.push(t('battle.log.opponentFainted', { name: t(`pokemon.${target.id}`) }));
          
          nextOIdx++;
          if (nextOIdx >= battleState.opponentTeam.length) {
            newLogs.push(t('battle.log.allOpponentFaintedWin'));
            finished = true;
            winner = 'player';
            
            // Capture all opponent's pokemon only on victory
            setCollection(c => {
              const newCards = { ...c.cards };
              battleState.opponentTeam.forEach(p => {
                newCards[p.id] = (newCards[p.id] || 0) + 1;
              });
              
              // Gym Rewards
              if (prev.currentGym) {
                const gym = prev.currentGym;
                const hasBadge = c.badges.includes(gym.badge);
                const newBadges = hasBadge ? c.badges : [...c.badges, gym.badge];
                return {
                  ...c,
                  cards: newCards,
                  coins: c.coins + gym.reward,
                  badges: newBadges
                };
              } else {
                // Standard battle reward
                return {
                  ...c,
                  cards: newCards,
                  coins: c.coins + 50
                };
              }
            });

            if (prev.currentGym) {
              newLogs.push(t('battle.log.gymReward', { badge: t(`gym.${prev.currentGym.id}.badge`), reward: prev.currentGym.reward }));
            } else {
              newLogs.push(t('battle.log.standardReward', { reward: 50 }));
              setToast({ message: t('battle.defeated_opponent'), type: 'success' });
            }

            setTimeout(() => playSound('victory'), 500);
          } else {
            newLogs.push(t('battle.log.opponentSentOut', { name: t(`pokemon.${prev.opponentTeam[nextOIdx].id}`) }));
          }
        }

        return {
          ...prev,
          opponentHp: newOpponentHp,
          logs: newLogs,
          isPlayerAttacking: false,
          isOpponentHit: true,
          damageNumber: { value: damage, target: 'opponent' } as const,
          shakeArena: true,
          _nextOIdx: nextOIdx,
          _finished: finished,
          _winner: winner
        };
      });

      // Reset hit effect and damage number
      setTimeout(() => {
        setBattleState(prev => {
          const isFinished = (prev as any)._finished ?? false;
          const nextOIdx = (prev as any)._nextOIdx ?? oIdx;
          const winner = (prev as any)._winner ?? null;

          const newState = { 
            ...prev, 
            isOpponentHit: false, 
            damageNumber: null, 
            shakeArena: false,
            currentOpponentIndex: nextOIdx,
            turn: 'opponent' as const,
            isFinished,
            winner
          };

          if (!isFinished) {
            setTimeout(() => {
              setBattleState(current => {
                if (current.isFinished) return current;
                executeOpponentTurn(
                  current.playerHp, 
                  current.opponentHp, 
                  current.currentPlayerIndex, 
                  current.currentOpponentIndex, 
                  current.playerTeam, 
                  current.opponentTeam, 
                  current.logs
                );
                return current;
              });
            }, isAutoBattle ? 400 : 800);
          }

          return newState;
        });
      }, resetDelay);
    }, attackDelay);
  };

  const regionPokemon = useMemo(() => {
    const regionId = collection.currentRegion || 1;
    return ALL_POKEMON.filter(p => {
      if (regionId === 1) return p.id <= 151;
      if (regionId === 2) return p.id > 151 && p.id <= 251;
      if (regionId === 3) return p.id > 251 && p.id <= 386;
      if (regionId === 4) return p.id > 386 && p.id <= 493;
      return false;
    });
  }, [collection.currentRegion]);

  const regionCollectedCount = useMemo(() => {
    return regionPokemon.filter(p => collection.cards[p.id]).length;
  }, [regionPokemon, collection.cards]);

  const progress = (regionCollectedCount / regionPokemon.length) * 100;
  const totalCollectedCount = useMemo(() => Object.keys(collection.cards).length, [collection.cards]);

  const filteredPokemon = useMemo(() => {
    const all = Array.from({ length: ALL_POKEMON.length }, (_, i) => {
      const id = i + 1;
      const data = getPokemonWithBoosts(id);
      return {
        ...data,
        collected: !!collection.cards[id],
        count: collection.cards[id] || 0,
        currentHp: collection.hpMap?.[id] !== undefined ? collection.hpMap[id] : data.hp
      };
    });

    const filtered = all.filter(p => {
      const translatedName = t('pokemon.' + p.id).toLowerCase();
      const matchesSearch = translatedName.includes(searchTerm.toLowerCase()) || 
                           p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.id.toString().includes(searchTerm);
      const matchesType = typeFilter === 'All' || p.types.includes(typeFilter);
      const matchesRarity = rarityFilter === 'All' || p.rarity === rarityFilter;
      return matchesSearch && matchesType && matchesRarity;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'id') return a.id - b.id;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'hp') return b.hp - a.hp;
      if (sortBy === 'defense') return b.defense - a.defense;
      if (sortBy === 'speed') return b.speed - a.speed;
      if (sortBy === 'attack') {
        const getAtk = (p: any) => Math.max(...p.moves.map((m: any) => m.damage));
        return getAtk(b) - getAtk(a);
      }
      return 0;
    });
  }, [collection, searchTerm, sortBy, typeFilter, rarityFilter]);

  const refreshShop = () => {
    const regionId = collection.currentRegion || 1;
    const regionPokemon = ALL_POKEMON.filter(p => {
      if (regionId === 1) return p.id <= 151;
      if (regionId === 2) return p.id > 151 && p.id <= 251;
      if (regionId === 3) return p.id > 251 && p.id <= 386;
      if (regionId === 4) return p.id > 386 && p.id <= 493;
      return false;
    });

    const newShopCards = Array.from({ length: 6 }, () => {
      const randomIndex = Math.floor(Math.random() * regionPokemon.length);
      const randomId = regionPokemon[randomIndex].id;
      return getPokemonData(randomId);
    });
    setShopCards(newShopCards);
  };

  useEffect(() => {
    refreshShop();
  }, []);

  const getPrice = (rarity: Rarity, isSelling: boolean) => {
    const base = rarity === 'Legendary' ? 1000 : rarity === 'Rare' ? 300 : 50;
    return isSelling ? Math.floor(base * 0.5) : base;
  };

  const buyCard = (pokemon: Pokemon) => {
    const price = getPrice(pokemon.rarity, false);
    if (collection.isInfiniteCoins || collection.coins >= price) {
      setCollection(prev => ({
        ...prev,
        coins: prev.isInfiniteCoins ? prev.coins : prev.coins - price,
        cards: { ...prev.cards, [pokemon.id]: (prev.cards[pokemon.id] || 0) + 1 },
        hpMap: { ...prev.hpMap, [pokemon.id]: pokemon.hp }
      }));
      playSound('draw');
      setToast({ message: t('shop.bought_toast', { name: t(`pokemon.${pokemon.id}`) }), type: 'success' });
    } else {
      setToast({ message: t('shop.no_coins_toast'), type: 'error' });
    }
  };

  const sellCard = (pokemon: Pokemon) => {
    if (collection.cards[pokemon.id] > 0) {
      const price = getPrice(pokemon.rarity, true);
      setCollection(prev => {
        const newCards = { ...prev.cards };
        newCards[pokemon.id] -= 1;
        if (newCards[pokemon.id] <= 0) delete newCards[pokemon.id];
        return {
          ...prev,
          coins: prev.coins + price,
          cards: newCards
        };
      });
      playSound('exp');
      setToast({ message: t('shop.sell.success', { name: t(`pokemon.${pokemon.id}`), price }), type: 'success' });
    }
  };

  const getEvolveRequirement = (pokemon: Pokemon) => {
    if (pokemon.level >= 30) return 2;
    return 3;
  };

  const handleEvolve = (pokemon: Pokemon) => {
    const nextIdOrIds = EVOLUTION_MAP[pokemon.id];
    if (!nextIdOrIds) return;

    const nextIds = Array.isArray(nextIdOrIds) ? nextIdOrIds : [nextIdOrIds];
    const unlockedNextIds = nextIds.filter(id => (collection.unlockedRegions || [1]).includes(getGeneration(id)));
    
    if (unlockedNextIds.length === 0) {
      setToast({ message: t('detail.evolve_locked'), type: 'error' });
      return;
    }

    const requiredCount = getEvolveRequirement(pokemon);
    const count = collection.cards[pokemon.id] || 0;
    
    if (count < requiredCount) {
      setToast({ message: t('item.evolve_requirement', { count: requiredCount, current: count }), type: 'error' });
      return;
    }

    setIsEvolving(true);
    playSound('evolve');

    setTimeout(() => {
      const nextId = unlockedNextIds[Math.floor(Math.random() * unlockedNextIds.length)];
      const evolvedPokemon = getPokemonWithBoosts(nextId);

      setCollection(prev => {
        const newCards = { ...prev.cards };
        newCards[pokemon.id] -= requiredCount;
        if (newCards[pokemon.id] <= 0) delete newCards[pokemon.id];
        newCards[nextId] = (newCards[nextId] || 0) + 1;
        const newHpMap = { ...prev.hpMap };
        newHpMap[nextId] = evolvedPokemon.hp;
        return { ...prev, cards: newCards, hpMap: newHpMap };
      });

      setToast({ message: t('item.evolve_success', { from: t(`pokemon.${pokemon.id}`), to: t(`pokemon.${evolvedPokemon.id}`) }), type: 'success' });
      setSelectedPokemon(evolvedPokemon);
      
      setTimeout(() => {
        setIsEvolving(false);
      }, 500);
    }, 1500);
  };

  const allTypes = ['All', 'Grass', 'Fire', 'Water', 'Electric', 'Psychic', 'Fighting', 'Poison', 'Ground', 'Flying', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Normal', 'Ice', 'Steel', 'Dark', 'Fairy'];

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Navigation */}
      <nav className="border-b border-[#141414] px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 bg-[#E4E3E0] z-50 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#141414] rounded-full flex items-center justify-center">
            <PokeballIcon className="text-[#E4E3E0] w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="hidden xs:block">
            <h1 className="font-bold text-base md:text-lg leading-none tracking-tight">{t('app.title')}</h1>
            <p className="text-[8px] md:text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">{t('app.subtitle')}</p>
          </div>
        </div>

        <div className="flex gap-1 bg-[#141414]/5 p-1 rounded-full overflow-x-auto w-full sm:w-auto no-scrollbar touch-pan-x">
          <button 
            onClick={() => {
              playSound('click');
              setView('draw');
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'draw' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.draw')}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setView('shop');
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'shop' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.shop')}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setView('collection');
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'collection' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.collection')}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setView('gyms');
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'gyms' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.gyms')}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setView('select-team');
              setPendingGym(null);
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'select-team' || view === 'battle' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.battle')}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setView('map');
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'map' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.map')}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setView('guide');
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${view === 'guide' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
          >
            {t('nav.guide')}
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => {
              playSound('click');
              const newLang = lang === 'en' ? 'zh' : 'en';
              setLang(newLang);
              setCollection(prev => ({ ...prev, lang: newLang }));
            }}
            className="fixed top-4 right-4 sm:static px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 shadow-lg sm:shadow-none z-[100]"
          >
            <Languages className="w-3 h-3 md:w-4 md:h-4" />
            {t('nav.lang')}
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-[#141414]/10 rounded-full transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          {isEnteringPassword ? (
            <motion.input 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 100, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              type="password"
              autoFocus
              value={passwordInput}
              onBlur={() => {
                setIsEnteringPassword(false);
                setPasswordInput('');
              }}
              onChange={(e) => {
                const val = e.target.value;
                setPasswordInput(val);
                if (val === '19790822') {
                  setIsDevPanelOpen(true);
                  setIsEnteringPassword(false);
                  setPasswordInput('');
                  playSound('success');
                }
              }}
              className="px-3 py-1 bg-slate-50 border-2 border-[#141414] rounded-full text-center font-mono text-[10px] tracking-widest focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          ) : (
            <button 
              onClick={() => {
                playSound('click');
                setIsEnteringPassword(true);
              }}
              className="p-2 hover:bg-[#141414]/10 rounded-full transition-colors text-blue-500"
              title={t('nav.dev')}
            >
              <Terminal className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#141414] text-[#E4E3E0] rounded-full">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-mono font-bold text-xs md:text-sm">
              {collection.isInfiniteCoins ? '∞' : collection.coins}
            </span>
          </div>
          <div className="hidden lg:block">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="uppercase">{t(`region.${collection.currentRegion || 1}`)}</span>
              <span>{regionCollectedCount}/{regionPokemon.length}</span>
            </div>
            <div className="w-32 h-1 bg-[#141414]/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'draw' ? (
            <motion.div 
              key="draw-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold tracking-tighter mb-2 italic serif">{t('draw.title')}</h2>
                <p className="text-sm opacity-60 font-mono uppercase">{t('draw.desc')}</p>
              </div>

              <div className="relative mb-12">
                {/* Rarity Effects Overlay */}
                <AnimatePresence>
                  {drawEffect !== 'none' && isFlipped && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute -inset-20 z-0 pointer-events-none blur-3xl opacity-40 rounded-full ${
                          drawEffect === 'legendary' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-16 left-0 right-0 text-center z-30"
                      >
                        <h3 className={`text-4xl font-bold italic serif uppercase tracking-tighter ${
                          drawEffect === 'legendary' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {drawEffect === 'legendary' ? t('draw.legendary') : t('draw.rare')}
                        </h3>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {currentCard ? (
                  <Card 
                    key={`draw-card-${drawId}`}
                    pokemon={currentCard} 
                    isFlipped={isFlipped} 
                    onFlip={() => setIsFlipped(!isFlipped)}
                    playSound={playSound}
                  />
                ) : (
                  <div className="w-64 h-96 bg-[#141414]/5 rounded-2xl border-2 border-dashed border-[#141414]/20 flex flex-col items-center justify-center text-[#141414]/30">
                    <PokeballIcon className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-xs font-mono uppercase tracking-widest">{t('draw.ready')}</p>
                  </div>
                )}

                {isDrawing && (
                  <div className="absolute inset-0 bg-[#E4E3E0]/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                    <RefreshCw className="w-12 h-12 animate-spin text-[#141414]" />
                  </div>
                )}
              </div>

              <button
                onClick={handleDraw}
                disabled={isDrawing || (!collection.isInfiniteCoins && collection.coins < 100)}
                className="group relative px-12 py-4 bg-[#141414] text-[#E4E3E0] rounded-full font-bold text-lg overflow-hidden transition-transform active:scale-95 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative z-10 flex flex-col items-center">
                  <span className="flex items-center gap-2">
                    {isDrawing ? t('draw.preparing') : t('draw.button')}
                    <RefreshCw className={`w-5 h-5 ${isDrawing ? 'animate-spin' : ''}`} />
                  </span>
                  {!isDrawing && (
                    <span className="text-[10px] opacity-60 font-mono">
                      {collection.isInfiniteCoins ? 'FREE' : t('draw.cost')}
                    </span>
                  )}
                </span>
              </button>
            </motion.div>
          ) : view === 'gyms' ? (
            <motion.div 
              key="gyms-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8"
            >
              <div className="flex flex-col gap-8 mb-12">
                <div>
                  <h2 className="text-6xl font-bold tracking-tighter italic serif">{t('gym.challenge_title')}</h2>
                  <p className="text-sm opacity-60 font-mono mt-2 uppercase">{t('gym.challenge_desc')}</p>
                  <p className="text-[10px] font-mono opacity-40 uppercase mt-1">{t('gym.arena_boost_note')}</p>
                  
                  <div className="relative mt-8 overflow-x-auto pb-4 no-scrollbar">
                    {/* Connecting Line */}
                    <div className="absolute top-1.5 left-8 right-8 h-0.5 bg-[#141414] opacity-10 z-0" />
                    
                    <div className="relative z-10 flex items-start gap-8 px-2">
                      {GYMS.filter(g => g.regionId === collection.currentRegion).map((g) => (
                        <div key={g.id} className="flex flex-col items-center gap-3 min-w-[56px]">
                          <div className={`w-3 h-3 rounded-full transition-all shrink-0 z-10 ${collection.badges.includes(g.badge) ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-[#141414] opacity-20'}`} />
                          <div className="scale-75 origin-top">
                            <TypeBadge type={g.type} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-[#141414] shadow-sm w-fit">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider mb-2">{t('gym.badges_earned')}</span>
                    <div className="flex flex-wrap gap-3">
                      {GYMS.filter(g => g.regionId === collection.currentRegion).map(gym => (
                        <div 
                          key={gym.id} 
                          title={t(`gym.${gym.id}.badge`)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-all ${
                            collection.badges.includes(gym.badge) 
                              ? 'bg-yellow-400 border-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-110' 
                              : 'bg-slate-100 border-slate-200 opacity-30 grayscale'
                          }`}
                        >
                          {gym.badgeIcon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-full mb-4">
                  <h3 className="text-2xl font-bold tracking-tighter italic serif border-b-2 border-[#141414] pb-2 uppercase">{t('gym.leaders_title')}</h3>
                </div>
                {GYMS.filter(g => g.regionId === collection.currentRegion && !g.isEliteFour && !g.isChampion).map((gym) => {
                  const isDefeated = collection.badges.includes(gym.badge);
                  return (
                    <motion.div
                      key={gym.id}
                      whileHover={{ y: -5 }}
                      className="relative group bg-white rounded-3xl overflow-hidden border-2 border-[#141414] shadow-lg flex flex-col"
                    >
                      <div className="h-32 relative overflow-hidden">
                        <img 
                          src={gym.bgImage} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute inset-0 ${gym.color} opacity-40`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 flex items-end gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
                            {gym.buildingIcon}
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase tracking-widest mb-1 block w-fit">
                              {gym.type.split('/').map((t_type, i) => (
                                <React.Fragment key={i}>
                                  {i > 0 && '/'}
                                  {t('type.' + t_type)}
                                </React.Fragment>
                              ))} {t('gym.gym')}
                            </span>
                            <h4 className="text-white font-bold text-xl tracking-tight leading-none">{t(`gym.${gym.id}.leader`)}</h4>
                          </div>
                        </div>
                        {isDefeated && (
                          <div className="absolute top-4 right-4 bg-yellow-400 text-[#141414] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                            <span>{gym.badgeIcon}</span> {t('gym.defeated')}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg uppercase tracking-tight">{t(`gym.${gym.id}.name`)}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px]" title={`${t('battle.arena')}: ${t(`arena.${gym.arenaId}.name`)}`}>
                                {ARENAS.find(a => a.id === gym.arenaId)?.icon}
                              </span>
                              <TypeBadge type={gym.type} />
                            </div>
                        <p className="text-xs opacity-60 mb-4 flex-1 italic leading-relaxed">"{t(`gym.${gym.id}.desc`)}"</p>
                        
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-mono opacity-40 uppercase">{t('gym.weaknesses')}</span>
                            <div className="flex flex-wrap gap-1">
                              {getWeaknesses(gym.type).map(w => (
                                <span key={w} className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[7px] font-bold uppercase">
                                  {t(`type.${w}`)}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-100 pt-3">
                            <span className="opacity-50 uppercase">{t('gym.team_size')}</span>
                            <span className="font-bold">{t('gym.team_size_count', { count: gym.pokemonIds.length })}</span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="opacity-50 uppercase">{t('gym.reward')}</span>
                            <span className="font-bold text-yellow-600 flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-yellow-600" /> {gym.reward}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (selectedTeam.length !== gym.pokemonIds.length) {
                                setPendingGym(gym);
                                setView('select-team');
                                setToast({ message: t('battle.select_team_size', { count: gym.pokemonIds.length }), type: 'error' });
                              } else {
                                startGymBattle(gym, selectedTeam);
                              }
                            }}
                            className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                              isDefeated 
                                ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' 
                                : 'bg-[#141414] text-[#E4E3E0] hover:bg-slate-800 shadow-lg'
                            }`}
                          >
                            {isDefeated ? t('gym.re_challenge') : t('gym.challenge')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <div className="col-span-full mt-12 mb-4 flex items-center justify-between border-b-2 border-red-600 pb-2">
                  <h3 className="text-2xl font-bold tracking-tighter italic serif uppercase text-red-600">{t('gym.league_title')}</h3>
                  {(() => {
                    const regionGyms = GYMS.filter(g => g.regionId === collection.currentRegion && !g.isEliteFour && !g.isChampion);
                    const regionBadgesCount = collection.badges.filter(b => regionGyms.some(rg => rg.badge === b)).length;
                    const required = regionGyms.length;
                    if (regionBadgesCount < required) {
                      return (
                        <span className="text-[10px] font-mono bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                          {t('gym.league_locked_requirement', { count: required - regionBadgesCount })}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                {GYMS.filter(g => g.regionId === collection.currentRegion && (g.isEliteFour || g.isChampion)).map((gym, index, array) => {
                  const isDefeated = collection.badges.includes(gym.badge);
                  const regionGyms = GYMS.filter(g => g.regionId === collection.currentRegion && !g.isEliteFour && !g.isChampion);
                  const regionBadgesCount = collection.badges.filter(b => regionGyms.some(rg => rg.badge === b)).length;
                  const isLeagueUnlocked = regionBadgesCount >= regionGyms.length;
                  
                  // Sequential unlock for Elite Four and Champion
                  let isUnlocked = isLeagueUnlocked;
                  if (isLeagueUnlocked && index > 0) {
                    const previousGym = array[index - 1];
                    isUnlocked = collection.badges.includes(previousGym.badge);
                  }

                      return (
                        <motion.div
                          key={gym.id}
                          whileHover={isUnlocked ? { y: -5 } : {}}
                          className={`relative group bg-white rounded-3xl overflow-hidden border-2 shadow-lg flex flex-col ${isUnlocked ? 'border-red-600' : 'border-slate-200 opacity-60'}`}
                        >
                          <div className="h-32 relative overflow-hidden">
                            <img 
                              src={gym.bgImage} 
                              className={`w-full h-full object-cover transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-110' : 'grayscale'}`} 
                              referrerPolicy="no-referrer"
                            />
                            <div className={`absolute inset-0 ${gym.color} opacity-40`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-end gap-3">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
                                {isUnlocked ? gym.buildingIcon : '🔒'}
                              </div>
                              <div>
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase tracking-widest mb-1 block w-fit">
                                  {gym.isChampion ? t('gym.champion') : t('gym.elite_four')}
                                </span>
                                <h4 className="text-white font-bold text-xl tracking-tight leading-none">{t(`gym.${gym.id}.leader`)}</h4>
                              </div>
                            </div>
                            {isDefeated && (
                              <div className="absolute top-4 right-4 bg-yellow-400 text-[#141414] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <span>{gym.badgeIcon}</span> {t('gym.defeated')}
                              </div>
                            )}
                            {!isUnlocked && (
                              <div className="absolute top-4 right-4 bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <Lock className="w-3 h-3" /> {t('gym.locked')}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg uppercase tracking-tight">{t(`gym.${gym.id}.name`)}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px]" title={`${t('battle.arena')}: ${t(`arena.${gym.arenaId}.name`)}`}>
                                    {ARENAS.find(a => a.id === gym.arenaId)?.icon}
                                  </span>
                                  <TypeBadge type={gym.type} />
                                </div>
                            <p className="text-xs opacity-60 mb-4 flex-1 italic leading-relaxed">"{t(`gym.${gym.id}.desc`)}"</p>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-100 pt-3">
                                <span className="opacity-50 uppercase">{t('gym.team_size')}</span>
                                <span className="font-bold">{t('gym.team_size_count', { count: gym.pokemonIds.length })}</span>
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="opacity-50 uppercase">{t('gym.reward')}</span>
                                <span className="font-bold text-yellow-600 flex items-center gap-1">
                                  <Zap className="w-3 h-3 fill-yellow-600" /> {gym.reward}
                                </span>
                              </div>
                              
                              <button
                                disabled={!isUnlocked}
                                onClick={() => {
                                  if (selectedTeam.length !== gym.pokemonIds.length) {
                                    setPendingGym(gym);
                                    setView('select-team');
                                    setToast({ message: t('battle.select_team_size', { count: gym.pokemonIds.length }), type: 'error' });
                                  } else {
                                    startGymBattle(gym, selectedTeam);
                                  }
                                }}
                                className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                                  !isUnlocked
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : isDefeated 
                                      ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' 
                                      : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                                }`}
                              >
                                {isDefeated ? t('gym.re_challenge') : isUnlocked ? t('gym.challenge') : t('gym.locked')}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
              </div>
            </motion.div>
          ) : view === 'select-team' ? (
            <motion.div 
              key="select-team-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                  <h2 className="text-6xl font-bold tracking-tighter italic serif">{t('team.title')}</h2>
                  <p className="text-sm opacity-60 font-mono mt-2 uppercase">{t('team.desc', { count: pendingGym ? pendingGym.pokemonIds.length : 3 })}</p>
                  <div className="mt-4 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg inline-flex items-center gap-2">
                    <Info className="w-4 h-4 text-yellow-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-700">
                      {t('team.region_restriction', { region: t(`region.${collection.currentRegion || 1}`) })}
                    </p>
                  </div>
                  {pendingGym && (
                    <button 
                      onClick={() => {
                        setPendingGym(null);
                        setView('gyms');
                      }}
                      className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <ArrowLeft className="w-4 h-4" /> {t('team.back_to_gyms')}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                    <input 
                      type="text" 
                      placeholder={t('team.search_placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none focus:bg-[#141414]/10 transition-all text-sm font-mono"
                    />
                  </div>

                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                  >
                    {allTypes.map(tType => <option key={tType} value={tType}>{tType === 'All' ? t('collection.all_types') : t(`type.${tType}`)}</option>)}
                  </select>

                  <select 
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                    className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                  >
                    <option value="All">{t('collection.all_rarities')}</option>
                    <option value="Common">{t('rarity.Common')}</option>
                    <option value="Rare">{t('rarity.Rare')}</option>
                    <option value="Legendary">{t('rarity.Legendary')}</option>
                  </select>

                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                  >
                    <option value="id">{t('collection.sort.id')}</option>
                    <option value="name">{t('collection.sort.name')}</option>
                    <option value="hp">{t('collection.sort.hp')}</option>
                    <option value="attack">{t('collection.sort.attack')}</option>
                    <option value="defense">{t('collection.sort.defense')}</option>
                    <option value="speed">{t('collection.sort.speed')}</option>
                  </select>
                  
                  {pendingGym ? (
                    <button 
                      disabled={selectedTeam.length !== pendingGym.pokemonIds.length}
                      onClick={() => {
                        startGymBattle(pendingGym, selectedTeam);
                        setPendingGym(null);
                      }}
                      className="px-8 py-3 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-red-700 shadow-lg flex items-center gap-2"
                    >
                      <Swords className="w-4 h-4" />
                      {t('battle.challenge_leader', { leader: t(`gym.${pendingGym.id}.leader`) })}
                    </button>
                  ) : (
                    <button 
                      disabled={selectedTeam.length === 0}
                      onClick={() => setShowArenaModal(true)}
                      className="px-8 py-3 bg-[#141414] text-[#E4E3E0] rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-30 transition-all"
                    >
                      {t('battle.select_arena')}
                    </button>
                  )}
                </div>
              </div>

              {/* Arena Selection Modal */}
              <AnimatePresence>
                {showArenaModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-[100] overflow-y-auto p-4 sm:p-6 flex justify-center items-start sm:items-center"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="relative my-auto max-w-4xl w-full bg-white rounded-3xl p-8 border-4 border-[#141414] shadow-2xl"
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
                        {ARENAS.map((arena) => (
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
                              <h4 className="font-bold text-xl uppercase tracking-tight mb-1">{t(`arena.${arena.id}.name`)}</h4>
                              <p className="text-[10px] opacity-60 mb-4 leading-tight max-w-[200px]">{t(`arena.${arena.id}.desc`)}</p>
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
                          {t('team.back_to_team')}
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
                    className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-[100] overflow-y-auto p-4 sm:p-6 flex justify-center items-start sm:items-center"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="relative my-auto max-w-md w-full bg-white rounded-3xl p-8 border-4 border-[#141414] shadow-2xl text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                        <Swords className="w-8 h-8 text-[#141414]" />
                      </div>
                      <h3 className="text-3xl font-bold tracking-tighter mb-2 italic serif uppercase">
                        {t('team.choose_mode')}
                      </h3>
                      <p className="text-sm opacity-60 font-mono uppercase mb-8">
                        {t('team.mode_desc')}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <button 
                          onClick={() => {
                            setIsAutoBattle(false);
                            setShowBattleModeModal(false);
                            startStandardBattle(selectedTeam);
                          }}
                          className="w-full py-4 bg-white border-2 border-[#141414] text-[#141414] rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                        >
                          <Zap className="w-5 h-5" /> {t('team.manual_battle')}
                        </button>
                        <button 
                          onClick={() => {
                            setIsAutoBattle(true);
                            setShowBattleModeModal(false);
                            startStandardBattle(selectedTeam);
                          }}
                          className="w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                        >
                          <RefreshCw className="w-5 h-5" /> {t('team.auto_battle')}
                        </button>
                        <button 
                          onClick={() => setShowBattleModeModal(false)}
                          className="w-full py-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                        >
                          {t('team.cancel')}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Team Preview */}
              <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
                {Array.from({ length: pendingGym ? pendingGym.pokemonIds.length : 3 }).map((_, i) => (
                  <div key={i} className="min-w-[128px] w-32 h-48 rounded-2xl border-2 border-dashed border-[#141414]/20 flex items-center justify-center relative overflow-hidden bg-white/50">
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
                        setActiveTeamGen(gen);
                        playSound('click');
                      }}
                      className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${
                        activeTeamGen === gen 
                          ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-lg' 
                          : isUnlocked
                            ? 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]/30'
                            : 'bg-[#141414]/5 text-[#141414]/30 border-transparent cursor-not-allowed'
                      }`}
                    >
                      {t(`region.${gen}`)}
                      {!isUnlocked && <Lock size={12} />}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredPokemon.filter(p => p.collected && p.generation === activeTeamGen).map(p => {
                  const isSameRegion = p.generation === (collection.currentRegion || 1);
                  const transferUses = collection.transferUses?.[p.id] || 0;
                  const isTransferred = transferUses > 0 || transferUses === -1;
                  const canUse = isSameRegion || isTransferred;

                  const isSelected = selectedTeam.some(s => s.id === p.id);
                  const currentHp = collection.hpMap?.[p.id] !== undefined ? collection.hpMap[p.id] : p.hp;
                  const isInjured = currentHp < p.hp;
                  const isFainted = currentHp <= 0;
                  const hasPotion = (collection.inventory['potion'] || 0) > 0;
                  const hasSuperPotion = (collection.inventory['super-potion'] || 0) > 0;
                  const hasFullRestore = (collection.inventory['full-restore'] || 0) > 0;

                  return (
                    <motion.div 
                      key={p.id}
                      className="flex flex-col gap-2"
                    >
                      <motion.div
                        whileHover={canUse ? { y: -5 } : {}}
                        onClick={() => {
                          if (!canUse) {
                            setToast({ message: t('team.region_locked'), type: 'error' });
                            return;
                          }
                          if (isFainted) {
                            setToast({ message: t('team.fainted_error', { name: t('pokemon.' + p.id) }), type: 'error' });
                            return;
                          }
                          if (isSelected) {
                            setSelectedTeam(prev => prev.filter(s => s.id !== p.id));
                          } else if (selectedTeam.length < (pendingGym ? pendingGym.pokemonIds.length : 3)) {
                            setSelectedTeam(prev => [...prev, p]);
                          }
                        }}
                        className={`relative aspect-[3/4] rounded-2xl p-3 border cursor-pointer transition-all ${
                          !canUse ? 'border-slate-200 bg-slate-50 grayscale opacity-40' :
                          isFainted ? 'border-red-200 bg-red-50/50 grayscale opacity-60' :
                          isSelected ? 'border-[#141414] bg-[#141414]/5 shadow-lg' : 'border-[#141414]/10 bg-white hover:border-[#141414]/30'
                        }`}
                      >
                        {isTransferred && !isSameRegion && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                            <Zap className="w-2 h-2" />
                            {transferUses === -1 ? t('team.transfer_permanent') : t('team.transfer_remaining', { count: transferUses })}
                          </div>
                        )}
                        {!isSameRegion && !isTransferred && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-600 text-white text-[8px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                            <Lock className="w-2 h-2" />
                            {t('team.region_locked_short')}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 text-[10px] font-mono opacity-30 flex items-center gap-1">
                          {isFainted && <span className="text-red-500 font-bold">{t('battle.fainted')}</span>}
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
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${currentHp / p.hp < 0.3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentHp / p.hp) * 100}%` }}
                              />
                            </div>
                            <p className={`text-[8px] font-mono mt-0.5 text-center ${isInjured ? 'text-red-500 font-bold' : 'opacity-40'}`}>
                              {Math.ceil(currentHp)}/{p.hp}
                            </p>
                          </div>

                          <div className="flex gap-1 mt-1">
                            {p.types.map(t => <TypeBadge key={t} type={t} />)}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute inset-0 bg-[#141414]/10 rounded-2xl flex items-center justify-center">
                            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center font-bold text-xs">
                              {selectedTeam.findIndex(s => s.id === p.id) + 1}
                            </div>
                          </div>
                        )}

                        {/* Healing Effect Overlay */}
                        <AnimatePresence>
                          {healingPokemonId === p.id && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.6, 0] }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-50 bg-emerald-400 rounded-2xl pointer-events-none mix-blend-screen"
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Quick Use Items */}
                      {isInjured && (hasPotion || hasSuperPotion || hasFullRestore) && (
                        <div className="flex gap-1">
                          {hasPotion && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); useItem('potion', p); }}
                              className="flex-1 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                            >
                              {t('collection.potion')}
                            </button>
                          )}
                          {hasSuperPotion && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); useItem('super-potion', p); }}
                              className="flex-1 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                            >
                              {t('collection.super')}
                            </button>
                          )}
                          {!hasPotion && !hasSuperPotion && hasFullRestore && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); useItem('full-restore', p); }}
                              className="flex-1 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-bold uppercase hover:bg-emerald-100 transition-colors"
                            >
                              {t('collection.full')}
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : view === 'collection' ? (
            <motion.div 
              key="collection-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-5xl font-bold tracking-tighter italic serif">{t('collection.title')}</h2>
                  <p className="text-sm opacity-60 font-mono mt-2 uppercase">{t('collection.subtitle')}</p>
                  
                  {collection.badges.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {GYMS.filter(g => collection.badges.includes(g.badge)).map(gym => (
                        <div 
                          key={gym.id} 
                          title={gym.badge}
                          className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform cursor-help"
                        >
                          {gym.badgeIcon}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                    <input 
                      type="text" 
                      placeholder={t('collection.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none focus:bg-[#141414]/10 transition-all text-sm font-mono"
                    />
                  </div>

                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                  >
                    {allTypes.map(tType => <option key={tType} value={tType}>{tType === 'All' ? t('collection.all_types') : t(`type.${tType}`)}</option>)}
                  </select>

                  <select 
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                    className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                  >
                    <option value="All">{t('collection.all_rarities')}</option>
                    <option value="Common">{t('rarity.Common')}</option>
                    <option value="Rare">{t('rarity.Rare')}</option>
                    <option value="Legendary">{t('rarity.Legendary')}</option>
                  </select>
                  
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                  >
                    <option value="id">{t('collection.sort.id')}</option>
                    <option value="name">{t('collection.sort.name')}</option>
                    <option value="hp">{t('collection.sort.hp')}</option>
                    <option value="attack">{t('collection.sort.attack')}</option>
                    <option value="defense">{t('collection.sort.defense')}</option>
                    <option value="speed">{t('collection.sort.speed')}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {[1, 2, 3, 4].map((gen) => {
                  const isUnlocked = (collection.unlockedRegions || [1]).includes(gen);
                  return (
                    <button
                      key={gen}
                      disabled={!isUnlocked}
                      onClick={() => {
                        setActiveCollectionGen(gen);
                        playSound('click');
                      }}
                      className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${
                        activeCollectionGen === gen 
                          ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-lg' 
                          : isUnlocked
                            ? 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]/30'
                            : 'bg-[#141414]/5 text-[#141414]/30 border-transparent cursor-not-allowed'
                      }`}
                    >
                      {t(`region.${gen}`)}
                      {!isUnlocked && <Lock size={12} />}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {filteredPokemon.filter(p => p.generation === activeCollectionGen).map((p) => {
                  const currentHp = collection.hpMap[p.id] !== undefined ? collection.hpMap[p.id] : p.hp;
                  const isInjured = currentHp < p.hp;
                  const hasPotion = (collection.inventory['potion'] || 0) > 0;
                  const hasSuperPotion = (collection.inventory['super-potion'] || 0) > 0;
                  const hasFullRestore = (collection.inventory['full-restore'] || 0) > 0;

                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col gap-2"
                    >
                      <div
                        onClick={() => p.collected && setSelectedPokemon(p)}
                        className={`aspect-[2/3] rounded-xl border p-2 flex flex-col transition-all group relative overflow-hidden ${
                          p.collected 
                            ? 'bg-white border-[#141414] shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                            : 'bg-[#141414]/5 border-dashed border-[#141414]/10 grayscale opacity-40'
                        }`}
                      >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-mono opacity-40">#{p.id.toString().padStart(3, '0')}</span>
                      {p.collected && (
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            p.rarity === 'Legendary' ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]' : 
                            p.rarity === 'Rare' ? 'bg-blue-500' : 'bg-yellow-400'
                          }`} />
                          <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative">
                      {p.collected ? (
                        <>
                          <img 
                            src={p.image} 
                            alt={t('pokemon.' + p.id)} 
                            className="w-full h-full object-contain drop-shadow-md"
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
                          {collection.transferUses?.[p.id] !== undefined && (
                            <div className="absolute top-0 left-0 bg-blue-600 text-white text-[6px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-br-lg flex items-center gap-0.5 shadow-lg">
                              <Zap className="w-1.5 h-1.5" />
                              {collection.transferUses[p.id] === -1 ? '∞' : collection.transferUses[p.id]}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[10px] font-mono text-center opacity-20 uppercase tracking-tighter">
                          {t('collection.missing')}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center flex flex-col items-center">
                      <p className={`text-[10px] font-bold truncate w-full ${p.collected ? 'text-[#141414]' : 'text-[#141414]/40'}`}>
                        {p.collected ? t('pokemon.' + p.id).toUpperCase() : '???'}
                      </p>
                      {p.collected && (
                        <div className="flex flex-col items-center w-full mt-1">
                          {p.count > 1 && (
                            <span className="text-[8px] font-mono bg-[#141414] text-[#E4E3E0] px-1.5 rounded-full mb-1">
                              x{p.count}
                            </span>
                          )}
                          
                          <div className="w-full">
                            <div className="flex justify-between text-[7px] font-bold uppercase mb-0.5 opacity-50">
                              <span>HP</span>
                              <span className={isInjured ? 'text-red-500' : ''}>{Math.ceil(currentHp)}/{p.hp}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${currentHp / p.hp < 0.3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentHp / p.hp) * 100}%` }}
                              />
                            </div>
                          </div>

                          {EVOLUTION_MAP[p.id] && (
                            <div className="w-full mt-1.5 px-1">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[6px] font-mono opacity-40 uppercase">{t('collection.evo')}</span>
                                <span className="text-[6px] font-mono font-bold">{Math.min(p.count, getEvolveRequirement(p))}/{getEvolveRequirement(p)}</span>
                              </div>
                              <div className="w-full h-1 bg-[#141414]/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(Math.min(p.count, getEvolveRequirement(p)) / getEvolveRequirement(p)) * 100}%` }}
                                  className={`h-full ${p.count >= getEvolveRequirement(p) ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'bg-[#141414]/40'}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Healing Effect Overlay */}
                    <AnimatePresence>
                      {healingPokemonId === p.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.6, 0] }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 bg-emerald-400 rounded-xl pointer-events-none mix-blend-screen"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Use Items */}
                  {p.collected && isInjured && (hasPotion || hasSuperPotion || hasFullRestore) && (
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
          ) : view === 'shop' ? (
            <motion.div 
              key="shop-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                  <h2 className="text-6xl font-bold tracking-tighter italic serif text-[#141414]">{t('shop.title')}</h2>
                  <p className="text-sm opacity-60 font-mono mt-2 uppercase">{t('shop.desc')}</p>
                  
                  <div className="flex gap-2 mt-6 bg-[#141414]/5 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full">
                    <button 
                      onClick={() => setShopTab('items')}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${shopTab === 'items' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
                    >
                      {t('shop.tab_items')}
                    </button>
                    <button 
                      onClick={() => setShopTab('buy')}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${shopTab === 'buy' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
                    >
                      {t('shop.tab_buy')}
                    </button>
                    <button 
                      onClick={() => setShopTab('sell')}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${shopTab === 'sell' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
                    >
                      {t('shop.tab.sell')}
                    </button>
                    <button 
                      onClick={() => setShopTab('trade')}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${shopTab === 'trade' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
                    >
                      {t('nav.trade')}
                    </button>
                  </div>

                  <button 
                    onClick={claimDailyReward}
                    className={`mt-6 px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                      (Date.now() - (collection.lastDailyReward || 0) < 24 * 60 * 60 * 1000)
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 animate-pulse'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    {Date.now() - (collection.lastDailyReward || 0) < 24 * 60 * 60 * 1000 
                      ? t('shop.claimed') 
                      : t('shop.claim')}
                  </button>
                </div>

                {shopTab !== 'items' && shopTab !== 'trade' && (
                  <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                      <input 
                        type="text" 
                        placeholder={t('shop.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none focus:bg-[#141414]/10 transition-all text-sm font-mono"
                      />
                    </div>

                    <select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                    >
                      {allTypes.map(tType => <option key={tType} value={tType}>{tType === 'All' ? t('collection.all_types') : t(`type.${tType}`)}</option>)}
                    </select>

                    <select 
                      value={rarityFilter}
                      onChange={(e) => setRarityFilter(e.target.value)}
                      className="px-4 py-3 bg-[#141414]/5 border-b border-[#141414] focus:outline-none text-xs font-bold uppercase tracking-widest"
                    >
                      <option value="All">{t('collection.all_rarities')}</option>
                      <option value="Common">{t('rarity.Common')}</option>
                      <option value="Rare">{t('rarity.Rare')}</option>
                      <option value="Legendary">{t('rarity.Legendary')}</option>
                    </select>

                    {shopTab === 'buy' && (
                      <button 
                        onClick={refreshShop}
                        className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-[#E4E3E0] rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    )}
                  </div>
                )}
              </div>

              {shopTab === 'trade' ? (
                <Suspense fallback={<div className="flex items-center justify-center py-20"><RefreshCw className="w-12 h-12 animate-spin text-[#141414]" /></div>}>
                  <TradeView 
                    collection={collection} 
                    onUpdateCollection={setCollection} 
                    playSound={playSound}
                  />
                </Suspense>
              ) : shopTab === 'buy' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {shopCards.filter(p => {
                    const translatedName = t('pokemon.' + p.id).toLowerCase();
                    const matchesSearch = translatedName.includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm);
                    const matchesType = typeFilter === 'All' || p.types.includes(typeFilter);
                    const matchesRarity = rarityFilter === 'All' || p.rarity === rarityFilter;
                    return matchesSearch && matchesType && matchesRarity;
                  }).map((p, i) => (
                    <motion.div 
                      key={`${i}-${p.id}`}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-3xl p-6 border-2 border-[#141414] shadow-xl flex flex-col items-center"
                    >
                      <div className="w-full flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            p.rarity === 'Legendary' ? 'bg-purple-100 text-purple-600' : 
                            p.rarity === 'Rare' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t('rarity.' + p.rarity)}
                          </span>
                          <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest ml-1">
                            {t('shop.owned', { count: collection.cards[p.id] || 0 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-600 font-bold">
                          <Zap className="w-4 h-4 fill-yellow-500" />
                          <span>{getPrice(p.rarity, false)}</span>
                        </div>
                      </div>
                      <img 
                        src={p.image} 
                        className="w-40 h-40 object-contain mb-4 drop-shadow-2xl" 
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
                      <h3 className="text-2xl font-bold tracking-tight mb-1 uppercase">{t('pokemon.' + p.id)}</h3>
                      <div className="flex gap-2 mb-6">
                        {p.types.map(t_type => <TypeBadge key={t_type} type={t_type} />)}
                      </div>
                      <button 
                        onClick={() => buyCard(p)}
                        disabled={!collection.isInfiniteCoins && collection.coins < getPrice(p.rarity, false)}
                        className="w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase tracking-widest text-xs disabled:opacity-30 hover:bg-emerald-600 transition-colors"
                      >
                        {(collection.isInfiniteCoins || collection.coins >= getPrice(p.rarity, false)) ? t('shop.buy_card') : t('shop.no_coins')}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : shopTab === 'items' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {SHOP_ITEMS.map((item) => (
                    <motion.div 
                      key={item.id}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-3xl p-8 border-2 border-[#141414] shadow-xl flex flex-col items-center text-center"
                    >
                      <div className="w-full flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[8px] font-bold uppercase tracking-widest">
                          {item.type}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-600 font-bold">
                          <Zap className="w-4 h-4 fill-yellow-500" />
                          <span>{item.price}</span>
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                        {item.icon}
                      </div>
                      
                      <h3 className="text-2xl font-bold tracking-tight mb-2 uppercase">{t('item.' + item.id + '.name')}</h3>
                      <p className="text-xs opacity-60 mb-8 max-w-[200px]">{t('item.' + item.id + '.desc')}</p>
                      
                      <div className="w-full mt-auto">
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-4">
                          {t('shop.in_bag', { count: collection.inventory[item.id] || 0 })}
                        </div>
                        <button 
                          onClick={() => buyItem(item)}
                          disabled={!collection.isInfiniteCoins && collection.coins < item.price}
                          className="w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase tracking-widest text-xs disabled:opacity-30 hover:bg-emerald-600 transition-colors"
                        >
                          {(collection.isInfiniteCoins || collection.coins >= item.price) ? t('shop.buy_item') : t('shop.no_coins')}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar flex-nowrap pb-2">
                    {[1, 2, 3, 4].map((gen) => {
                      const isUnlocked = (collection.unlockedRegions || [1]).includes(gen);
                      return (
                        <button
                          key={gen}
                          disabled={!isUnlocked}
                          onClick={() => {
                            setActiveShopGen(gen);
                            playSound('click');
                          }}
                          className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 whitespace-nowrap ${
                            activeShopGen === gen 
                              ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-lg' 
                              : isUnlocked
                                ? 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]/30'
                                : 'bg-[#141414]/5 text-[#141414]/30 border-transparent cursor-not-allowed'
                          }`}
                        >
                          {t(`region.${gen}`)}
                          {!isUnlocked && <Lock size={12} />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredPokemon.filter(p => p.collected && p.generation === activeShopGen).map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl border border-[#141414] p-2 flex flex-col shadow-sm group relative overflow-hidden"
                      >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-mono opacity-40">#{p.id.toString().padStart(3, '0')}</span>
                        <div className="flex items-center gap-1 text-yellow-600 font-bold text-[10px]">
                          <Zap className="w-2 h-2 fill-yellow-500" />
                          <span>{getPrice(p.rarity, true)}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-center relative">
                        <img 
                          src={p.image} 
                          alt={t('pokemon.' + p.id)} 
                          className="w-full h-full object-contain drop-shadow-md"
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
                      </div>

                      <div className="mt-2 text-center flex flex-col items-center">
                        <p className="text-[10px] font-bold truncate text-[#141414]">
                          {t('pokemon.' + p.id).toUpperCase()}
                        </p>
                        <div className="flex flex-col items-center w-full mt-1">
                          <span className="text-[8px] font-mono bg-[#141414] text-[#E4E3E0] px-1.5 rounded-full">
                            x{p.count}
                          </span>
                          
                          {EVOLUTION_MAP[p.id] && (
                            <div className="w-full mt-1.5 px-1">
                              <div className="w-full h-1 bg-[#141414]/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(Math.min(p.count, getEvolveRequirement(p)) / getEvolveRequirement(p)) * 100}%` }}
                                  className={`h-full ${p.count >= getEvolveRequirement(p) ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'bg-[#141414]/40'}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => sellCard(p)}
                        className="mt-2 w-full py-1.5 bg-red-600 text-white rounded-lg text-[8px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                      >
                        {t('shop.sell_button')}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
          ) : view === 'guide' ? (
            <Suspense fallback={<div className="flex items-center justify-center py-20"><RefreshCw className="w-12 h-12 animate-spin text-[#141414]" /></div>}>
              <GuideView collection={collection} />
            </Suspense>
          ) : view === 'map' ? (
            <Suspense fallback={<div className="flex items-center justify-center py-20"><RefreshCw className="w-12 h-12 animate-spin text-[#141414]" /></div>}>
              <MapView 
                collection={collection} 
                onSwitchRegion={handleSwitchRegion} 
              />
            </Suspense>
          ) : (
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
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#E4E3E0] via-transparent to-[#E4E3E0]" />
              </div>

              <div className="relative z-10 w-full flex flex-col items-center px-4">
                <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-8 md:mb-12 landscape:flex-row landscape:mb-4">
                <button 
                  onClick={() => setView('collection')}
                  className="flex items-center gap-2 text-[#141414] hover:opacity-60 transition-opacity font-bold uppercase tracking-widest text-xs sm:text-sm"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> {t('battle.quit')}
                </button>
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => setIsAutoBattle(!isAutoBattle)}
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold uppercase tracking-widest text-[8px] sm:text-xs transition-all ${
                      isAutoBattle 
                        ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                        : 'bg-[#141414] text-[#E4E3E0] hover:bg-slate-800'
                    }`}
                  >
                    {isAutoBattle ? t('battle.auto_on') : t('battle.auto_off')}
                  </button>
                  <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-[#141414] rounded-full text-[8px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 sm:gap-2">
                    <span>{battleState.selectedArena.icon}</span>
                    {t(`arena.${battleState.selectedArena.id}.name`)}
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-4 sm:gap-8 md:gap-12 items-start">
                {/* Player Side */}
                <div className="flex flex-col items-center gap-3 sm:gap-6">
                  {/* Bench / Waiting Area */}
                  <div className="w-full h-10 sm:h-16 flex justify-center gap-1 sm:gap-2 mb-1">
                    {battleState.playerTeam.map((p, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          scale: i === battleState.currentPlayerIndex ? 1.1 : 1,
                          opacity: i < battleState.currentPlayerIndex ? 0.5 : 1,
                          borderColor: i === battleState.currentPlayerIndex ? '#ef4444' : '#141414'
                        }}
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden shadow-sm relative ${i === battleState.currentPlayerIndex ? 'ring-2 ring-red-500/20' : ''}`}
                      >
                        <img src={p.image} className="w-6 h-6 sm:w-10 sm:h-10 object-contain" referrerPolicy="no-referrer" />
                        {i < battleState.currentPlayerIndex && (
                          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                            <X className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="w-full h-16 sm:h-24 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-[#141414] shadow-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-[8px] sm:text-sm uppercase tracking-widest">{t('battle.player_team')}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Heart className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
                        <span className="font-mono font-bold text-[10px] sm:text-base">
                          {battleState.playerHp[battleState.currentPlayerIndex]} / {battleState.playerTeam[battleState.currentPlayerIndex]?.hp}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-green-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(battleState.playerHp[battleState.currentPlayerIndex] / (battleState.playerTeam[battleState.currentPlayerIndex]?.hp || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="h-[200px] sm:h-[400px] landscape:h-[250px] flex items-center justify-center relative w-full">
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
                          className="relative scale-50 sm:scale-100 landscape:scale-60"
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
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-red-600 font-black text-4xl sm:text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                              >
                                -{battleState.damageNumber.value}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
                    {battleState.playerTeam[battleState.currentPlayerIndex]?.moves.map((move, idx) => (
                      <button
                        key={idx}
                        disabled={battleState.turn !== 'player' || battleState.isFinished}
                        onClick={() => handleAttack(move)}
                        className="p-2 sm:p-4 bg-[#141414] text-[#E4E3E0] rounded-lg sm:rounded-xl font-bold flex flex-col items-center gap-0.5 sm:gap-1 hover:bg-slate-800 disabled:opacity-50 transition-all group relative overflow-hidden"
                      >
                        <span className="text-[8px] sm:text-xs relative z-10">{t('move.' + move.name)}</span>
                        <span className="text-[7px] sm:text-[10px] font-mono opacity-60 relative z-10">{t('detail.dmg')}: {move.damage} | {t(`type.${move.type}`)}</span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opponent Side */}
                <div className="flex flex-col items-center gap-3 sm:gap-6">
                  {/* Bench / Waiting Area */}
                  <div className="w-full h-10 sm:h-16 flex justify-center gap-1 sm:gap-2 mb-1">
                    {battleState.opponentTeam.map((p, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          scale: i === battleState.currentOpponentIndex ? 1.1 : 1,
                          opacity: i < battleState.currentOpponentIndex ? 0.5 : 1,
                          borderColor: i === battleState.currentOpponentIndex ? '#ef4444' : '#141414'
                        }}
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden shadow-sm relative ${i === battleState.currentOpponentIndex ? 'ring-2 ring-red-500/20' : ''}`}
                      >
                        <img src={p.image} className="w-6 h-6 sm:w-10 sm:h-10 object-contain" referrerPolicy="no-referrer" />
                        {i < battleState.currentOpponentIndex && (
                          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                            <X className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="w-full h-16 sm:h-24 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-[#141414] shadow-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-[8px] sm:text-sm uppercase tracking-widest">
                          {battleState.currentGym ? t('battle.leader', { leader: battleState.currentGym.leader }) : t('battle.opponent_team')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Heart className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
                        <span className="font-mono font-bold text-[10px] sm:text-base">
                          {battleState.opponentHp[battleState.currentOpponentIndex]} / {battleState.opponentTeam[battleState.currentOpponentIndex]?.hp}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-red-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(battleState.opponentHp[battleState.currentOpponentIndex] / (battleState.opponentTeam[battleState.currentOpponentIndex]?.hp || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-[200px] sm:h-[400px] landscape:h-[250px] flex items-center justify-center relative w-full">
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
                          className="relative scale-50 sm:scale-100 landscape:scale-60"
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
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-red-600 font-black text-4xl sm:text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                              >
                                -{battleState.damageNumber.value}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
          <div className="w-full h-24 sm:h-32 bg-[#141414]/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 overflow-y-auto font-mono text-[8px] sm:text-[10px] space-y-1 border border-[#141414]/10">
            <p className="opacity-40 uppercase mb-1 sm:mb-2">{t('battle.logs')}</p>
            {battleState.logs.map((log, idx) => (
              <p key={idx} className={`border-l-2 pl-2 ${log.includes(t('battle.super_effective')) ? 'text-green-600 border-green-600 font-bold' : log.includes(t('battle.not_effective')) ? 'text-orange-600 border-orange-600' : 'border-[#141414]'}`}>{log}</p>
            ))}
          </div>
                </div>
              </div>
            </div>

              {battleState.isFinished && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-[100] overflow-y-auto p-4 sm:p-6 flex justify-center items-start sm:items-center"
                >
                  <div className="relative my-auto max-w-md w-full bg-white rounded-3xl p-8 border-4 border-[#141414] shadow-2xl text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${battleState.winner === 'player' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <Swords className="w-10 h-10" />
                    </div>
                    <h3 className="text-4xl font-bold tracking-tighter mb-2 italic serif uppercase">
                      {battleState.winner === 'player' ? t('battle.victory') : t('battle.defeat')}
                    </h3>
                    <p className="text-sm opacity-60 font-mono uppercase mb-8">
                      {battleState.winner === 'player' 
                        ? (battleState.currentGym 
                            ? t('battle.defeated_leader', { leader: battleState.currentGym.leader, badge: t(`gym.${battleState.currentGym.id}.badge`) })
                            : t('battle.defeated_opponent'))
                        : t('battle.team_defeated')}
                    </p>

                    {battleState.winner === 'player' && battleState.currentGym && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="mb-8 p-6 bg-yellow-50 rounded-3xl border-2 border-yellow-400 inline-block relative"
                      >
                        <div className="text-6xl mb-2">{battleState.currentGym.badgeIcon}</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-yellow-700">{t(`gym.${battleState.currentGym.id}.badge`)}</div>
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
                              <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[10px] font-bold mt-2 uppercase">{t(`pokemon.${p.id}`)}</span>
                            <div className={`w-2 h-2 rounded-full mt-1 ${
                              p.rarity === 'Legendary' ? 'bg-purple-500' : 
                              p.rarity === 'Rare' ? 'bg-blue-500' : 'bg-yellow-400'
                            }`} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        setView('collection');
                        setSelectedTeam([]);
                      }}
                      className="w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all"
                    >
                      {t('battle.returnToCollection')}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {currentSelectedPokemon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 bg-[#141414]/90 backdrop-blur-md flex justify-center items-start sm:items-center"
            onClick={() => setSelectedPokemon(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative my-auto max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center bg-[#141414] p-8 md:p-12 rounded-[2rem] border-2 border-[#E4E3E0]/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedPokemon(null)}
                className="absolute top-4 right-4 text-[#E4E3E0] hover:text-white transition-colors z-50"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="flex-shrink-0 relative">
                <AnimatePresence>
                  {isEvolving && (
                    <motion.div
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0],
                        scale: [1, 1.2, 1.2, 1.5],
                        filter: ["brightness(1)", "brightness(5)", "brightness(5)", "brightness(1)"]
                      }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0 z-[110] bg-white rounded-2xl pointer-events-none mix-blend-overlay"
                    />
                  )}
                </AnimatePresence>
                  <motion.div
                    animate={isEvolving ? {
                      scale: [1, 1.1, 0.9, 1.1, 1],
                      rotate: [0, 5, -5, 5, 0],
                      filter: ["brightness(1)", "brightness(2)", "brightness(1)"]
                    } : {}}
                    transition={{ duration: 1.5 }}
                  >
                    <Card 
                      pokemon={currentSelectedPokemon} 
                      isFlipped={true} 
                      size="large"
                      playSound={playSound}
                      isHealing={healingPokemonId === currentSelectedPokemon.id}
                      currentHp={collection.hpMap?.[currentSelectedPokemon.id] ?? currentSelectedPokemon.hp}
                    />
                  </motion.div>
              </div>

              <div className="flex-1 text-[#E4E3E0]">
                <div className="mb-8">
                  <span className="text-xs font-mono opacity-50 uppercase tracking-widest">{t('detail.pokedexEntry')} #{currentSelectedPokemon.id.toString().padStart(3, '0')}</span>
                  <h2 className="text-6xl font-bold tracking-tighter italic serif mt-2">{t(`pokemon.${currentSelectedPokemon.id}`)}</h2>
                  <div className="flex gap-2 mt-4">
                    {currentSelectedPokemon.types.map(tType => <TypeBadge key={tType} type={tType} />)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
                  <div className="border-l border-[#E4E3E0]/20 pl-4">
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{t('detail.hpStat')}</p>
                    <p className="text-xl font-bold mt-1 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" /> 
                      <span className={((collection.hpMap?.[currentSelectedPokemon.id] ?? currentSelectedPokemon.hp) < currentSelectedPokemon.hp) ? 'text-red-400' : ''}>
                        {collection.hpMap?.[currentSelectedPokemon.id] ?? currentSelectedPokemon.hp}
                      </span>
                      <span className="opacity-30">/ {currentSelectedPokemon.hp}</span>
                    </p>
                  </div>
                  <div className="border-l border-[#E4E3E0]/20 pl-4">
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{t('detail.defense')}</p>
                    <p className="text-xl font-bold mt-1 flex items-center gap-2">
                      <Swords className="w-5 h-5 text-slate-400" /> {currentSelectedPokemon.defense}
                    </p>
                  </div>
                  <div className="border-l border-[#E4E3E0]/20 pl-4">
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{t('detail.speed')}</p>
                    <p className="text-xl font-bold mt-1 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" /> {currentSelectedPokemon.speed}
                    </p>
                  </div>
                  {collection.transferUses?.[currentSelectedPokemon.id] !== undefined && (
                    <div className="border-l border-[#E4E3E0]/20 pl-4">
                      <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{t('team.transfer_status')}</p>
                      <p className="text-xl font-bold mt-1 flex items-center gap-2 text-blue-400">
                        <Zap className="w-5 h-5" />
                        {collection.transferUses[currentSelectedPokemon.id] === -1 
                          ? t('team.transfer_permanent') 
                          : collection.transferUses[currentSelectedPokemon.id]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-4">{t('detail.availableMoves')}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {currentSelectedPokemon.moves.map((move, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold tracking-widest">{t('move.' + move.name)}</span>
                          <span className="text-[10px] opacity-40 uppercase">{t('type.' + move.type)} {t('detail.moveType')}</span>
                        </div>
                        <span className="text-xl font-mono font-bold text-red-400">{move.damage} {t('detail.dmg')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-4">{t('detail.yourInventory')}</p>
                  <div className="flex flex-wrap gap-2">
                    {SHOP_ITEMS.map(item => {
                      const count = collection.inventory[item.id] || 0;
                      if (count <= 0) return null;
                      return (
                        <button
                          key={item.id}
                          onClick={() => useItem(item.id, currentSelectedPokemon)}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 transition-all group"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold uppercase tracking-tight">{t(`item.${item.id}.name`)}</span>
                            <span className="text-[8px] opacity-50">{t('detail.have')}: {count}</span>
                          </div>
                        </button>
                      );
                    })}
                    {Object.values(collection.inventory as Record<string, number>).every(v => v <= 0) && (
                      <p className="text-[10px] opacity-30 italic">{t('detail.noItems')}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {EVOLUTION_MAP[currentSelectedPokemon.id] && (() => {
                    const nextIdOrIds = EVOLUTION_MAP[currentSelectedPokemon.id];
                    const nextIds = Array.isArray(nextIdOrIds) ? nextIdOrIds : [nextIdOrIds];
                    const unlockedNextIds = nextIds.filter(id => (collection.unlockedRegions || [1]).includes(getGeneration(id)));
                    const isLocked = unlockedNextIds.length === 0;
                    
                    return (
                      <button 
                        onClick={() => {
                          if (isLocked) {
                            setToast({ message: t('detail.evolve_locked'), type: 'error' });
                            return;
                          }
                          handleEvolve(currentSelectedPokemon);
                        }}
                        className={`w-full py-4 rounded-full font-bold transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg ${
                          isLocked 
                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" /> 
                        {isLocked 
                          ? t('detail.mysterious_evolution') 
                          : t('detail.evolve', { count: getEvolveRequirement(currentSelectedPokemon) })}
                      </button>
                    );
                  })()}
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        sellCard(currentSelectedPokemon);
                        if (!collection.cards[currentSelectedPokemon.id] || collection.cards[currentSelectedPokemon.id] <= 1) {
                          setSelectedPokemon(null);
                        }
                      }}
                      className="flex-1 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> {t('detail.sell', { price: getPrice(currentSelectedPokemon.rarity, true) })}
                    </button>
                    <button 
                      onClick={() => {
                        const isSameRegion = currentSelectedPokemon.generation === (collection.currentRegion || 1);
                        const transferUses = collection.transferUses?.[currentSelectedPokemon.id] || 0;
                        const isTransferred = transferUses > 0 || transferUses === -1;
                        const canUse = isSameRegion || isTransferred;

                        if (!canUse) {
                          setToast({ message: t('team.region_locked'), type: 'error' });
                          return;
                        }

                        setSelectedTeam([currentSelectedPokemon]);
                        setView('select-team');
                        setSelectedPokemon(null);
                      }}
                      className={`flex-1 py-4 rounded-full font-bold transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                        (currentSelectedPokemon.generation === (collection.currentRegion || 1) || (collection.transferUses?.[currentSelectedPokemon.id] || 0) !== 0)
                          ? 'bg-[#E4E3E0] text-[#141414] hover:bg-white'
                          : 'bg-[#E4E3E0]/20 text-[#E4E3E0]/40 cursor-not-allowed'
                      }`}
                    >
                      <Swords className="w-4 h-4" /> {t('detail.startBattle')}
                    </button>
                    <button 
                      onClick={() => setSelectedPokemon(null)}
                      className="flex-1 py-4 border border-[#E4E3E0]/20 rounded-full font-bold hover:bg-[#E4E3E0]/10 transition-all uppercase tracking-widest text-xs"
                    >
                      {t('detail.close')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Floating Auto Battle Toggle for Mobile Battle View */}
      <AnimatePresence>
        {view === 'battle' && !battleState.isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 100 }}
            className="fixed bottom-6 right-6 z-[500] md:hidden"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoBattle(!isAutoBattle);
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                isAutoBattle 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-[#141414] text-[#E4E3E0]'
              }`}
            >
              <Zap className={`w-6 h-6 ${isAutoBattle ? 'fill-white' : ''}`} />
            </button>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#141414] text-[#E4E3E0] text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg">
              {isAutoBattle ? t('battle.auto_on') : t('battle.auto_off')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-[#141414] p-8 mt-12 text-center">
        <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
          {t('footer.built_with')}
        </p>
      </footer>

      {/* Developer Panel */}
      <AnimatePresence>
        {isDevPanelOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDevPanelOpen(false)}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl border-4 border-[#141414] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="p-8 border-b-4 border-[#141414] bg-blue-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold uppercase tracking-tighter italic serif">{t('dev.title')}</h2>
                </div>
                <button onClick={() => setIsDevPanelOpen(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Infinite Coins Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase tracking-widest text-sm">{t('dev.infinite_coins')}</h3>
                      <p className="text-[10px] opacity-60 font-mono">TOGGLE UNLIMITED CURRENCY</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setCollection(prev => ({ ...prev, isInfiniteCoins: !prev.isInfiniteCoins }));
                      playSound('click');
                    }}
                    className={`w-14 h-8 rounded-full transition-all relative ${collection.isInfiniteCoins ? 'bg-blue-500' : 'bg-slate-300'}`}
                  >
                    <motion.div 
                      animate={{ x: collection.isInfiniteCoins ? 24 : 4 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>

                {/* Jump to Region */}
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(regionId => (
                      <div key={regionId} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold uppercase tracking-widest text-xs">{t(`region.${regionId}`)}</h4>
                          <button
                            onClick={() => {
                              handleJumpToRegion(regionId);
                              setIsDevPanelOpen(false);
                            }}
                            className={`px-4 py-1.5 rounded-full border-2 font-bold text-[8px] uppercase tracking-widest transition-all ${
                              collection.currentRegion === regionId
                                ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                                : 'bg-white text-[#141414] border-slate-100 hover:border-blue-300'
                            }`}
                          >
                            {t('dev.jump_to_region')}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => clearRegionCards(regionId)}
                            className="py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-[8px] uppercase tracking-widest hover:bg-red-100 transition-all"
                          >
                            {t('dev.clear_region')}
                          </button>
                          <button
                            onClick={() => fillRegionCards(regionId)}
                            className="py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-[8px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
                          >
                            {t('dev.fill_region')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reset All Settings */}
                  <div className="pt-4 border-t-2 border-slate-100">
                    <button
                      onClick={resetAllSettings}
                      className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <RefreshCw className="w-5 h-5" />
                      {t('dev.reset_all')}
                    </button>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 border-2 ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <Zap className="w-4 h-4 fill-white" /> : <X className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles for 3D Flip */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
