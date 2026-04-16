import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, Zap, Package, LayoutGrid } from 'lucide-react';
import { Pokemon, CollectionState, Rarity, Item } from '../types';
import { TypeBadge } from './Common';
import { SHOP_ITEMS } from '../constants/items';
import { useLanguage } from '../contexts/LanguageContext';
import { TradeView } from './TradeView';
import { ArrowLeftRight } from 'lucide-react';

interface ShopViewProps {
  coins: number;
  collection: CollectionState;
  allPokemon: Pokemon[];
  buyCard: (p: Pokemon) => void;
  buyItem: (item: Item) => void;
  refreshShop: () => void;
  getPrice: (rarity: Rarity, isSelling?: boolean) => number;
  onUpdateCollection: (newCollection: CollectionState) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  coins,
  collection,
  allPokemon,
  buyCard,
  buyItem,
  refreshShop,
  getPrice,
  onUpdateCollection
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'items' | 'trade'>('items');
  const { t } = useLanguage();

  return (
    <motion.div 
      key="shop"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-white p-10 rounded-3xl border-4 border-[#141414] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-6xl font-bold tracking-tighter italic serif uppercase mb-2">{t('shop.title')}</h2>
          <p className="text-sm opacity-60 font-mono uppercase tracking-widest leading-relaxed max-w-md">
            {t('shop.desc')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center md:items-end gap-4">
          <div className="px-8 py-6 bg-[#141414] text-[#E4E3E0] rounded-3xl flex items-center gap-4 shadow-2xl border-2 border-white/10">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs opacity-50 uppercase font-bold tracking-widest leading-none mb-1">{t('draw.balance')}</span>
              <span className="text-4xl font-black tracking-tighter leading-none">
                {collection.isInfiniteCoins ? '∞' : coins}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('items')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'items' ? 'bg-[#141414] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <Package className="w-4 h-4" /> {t('shop.tab_items')}
            </button>
            <button 
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'cards' ? 'bg-[#141414] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <LayoutGrid className="w-4 h-4" /> {t('shop.tab_buy')}
            </button>
            <button 
              onClick={() => setActiveTab('trade')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'trade' ? 'bg-[#141414] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <ArrowLeftRight className="w-4 h-4" /> {t('nav.trade')}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold tracking-tight uppercase italic serif">{t('shop.featured')}</h3>
            <button 
              onClick={refreshShop}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> {t('shop.refresh')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allPokemon.filter(p => !p.collected).slice(0, 12).map((p) => {
              const price = getPrice(p.rarity);
              const canAfford = collection.isInfiniteCoins || coins >= price;
              const ownedCount = collection.cards[p.id] || 0;
              
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -10 }}
                  className={`group relative bg-white rounded-3xl p-6 border-2 transition-all shadow-sm flex flex-col items-center justify-between ${
                    p.rarity === 'Legendary' ? 'border-purple-200 bg-purple-50/30' : 
                    p.rarity === 'Rare' ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 hover:border-[#141414]/20'
                  }`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      p.rarity === 'Legendary' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 
                      p.rarity === 'Rare' ? 'bg-blue-500' : 'bg-yellow-400'
                    }`} />
                    <span className="text-[10px] font-mono font-bold opacity-30">#{p.id.toString().padStart(3, '0')}</span>
                  </div>

                  {ownedCount > 0 && (
                    <div className="absolute top-4 left-4 px-2 py-0.5 bg-[#141414] text-[#E4E3E0] rounded-full text-[8px] font-bold uppercase tracking-widest z-10">
                      {t('shop.owned', { count: ownedCount })}
                    </div>
                  )}

                  <div className="relative w-full aspect-square flex items-center justify-center mb-6">
                    <div className={`absolute inset-0 blur-3xl opacity-10 rounded-full ${
                      p.rarity === 'Legendary' ? 'bg-purple-500' : 
                      p.rarity === 'Rare' ? 'bg-blue-500' : 'bg-yellow-400'
                    }`} />
                    <img 
                      src={p.image} 
                      alt={p.name}
                      className="w-40 h-40 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
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

                  <div className="w-full text-center space-y-4">
                    <div>
                      <h4 className="font-bold text-xl uppercase tracking-tight mb-2">{t('pokemon.' + p.id)}</h4>
                      <div className="flex justify-center gap-2">
                        {p.types.map(t_type => <TypeBadge key={t_type} type={t_type} />)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-center gap-2 text-xl font-black tracking-tighter">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        {price}
                      </div>
                      <button 
                        onClick={() => buyCard(p)}
                        disabled={!canAfford}
                        className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                          canAfford 
                            ? 'bg-[#141414] text-[#E4E3E0] hover:bg-slate-800 shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Zap className={`w-4 h-4 ${canAfford ? 'fill-white' : ''}`} />
                        {canAfford ? t('shop.buy_card') : t('shop.no_coins')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'items' ? (
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight uppercase italic serif">{t('shop.essential')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SHOP_ITEMS.map((item) => {
              const canAfford = collection.isInfiniteCoins || coins >= item.price;
              const ownedCount = collection.inventory[item.id] || 0;
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -10 }}
                  className="group relative bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-[#141414]/20 transition-all shadow-sm flex flex-col items-center justify-between"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold opacity-30 uppercase tracking-widest">{t('type.' + item.type)}</span>
                  </div>

                  {ownedCount > 0 && (
                    <div className="absolute top-4 left-4 px-2 py-0.5 bg-[#141414] text-[#E4E3E0] rounded-full text-[8px] font-bold uppercase tracking-widest z-10">
                      {t('shop.in_bag', { count: ownedCount })}
                    </div>
                  )}

                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    {item.icon}
                  </div>

                  <div className="w-full text-center space-y-4">
                    <div>
                      <h4 className="font-bold text-xl uppercase tracking-tight mb-1">{t('item.' + item.id + '.name')}</h4>
                      <p className="text-xs opacity-60 leading-relaxed px-4">{t('item.' + item.id + '.desc')}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-center gap-2 text-xl font-black tracking-tighter">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        {item.price}
                      </div>
                      <button 
                        onClick={() => buyItem(item)}
                        disabled={!canAfford}
                        className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                          canAfford 
                            ? 'bg-[#141414] text-[#E4E3E0] hover:bg-slate-800 shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Zap className={`w-4 h-4 ${canAfford ? 'fill-white' : ''}`} />
                        {canAfford ? t('shop.buy_item') : t('shop.no_coins')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <TradeView 
          collection={collection} 
          onUpdateCollection={onUpdateCollection} 
        />
      )}
    </motion.div>
  );
};
