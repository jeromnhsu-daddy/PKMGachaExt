import React from 'react';
import { motion } from 'motion/react';
import { Map as MapIcon, Lock, CheckCircle, ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CollectionState } from '../types';
import { ALL_POKEMON } from '../constants';

interface MapViewProps {
  collection: CollectionState;
  onSwitchRegion: (regionId: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({ collection, onSwitchRegion }) => {
  const { t } = useLanguage();
  const currentRegion = collection.currentRegion || 1;
  const unlockedRegions = collection.unlockedRegions || [1];

  const regions = [
    { id: 1, name: t('region.1'), color: 'from-green-500 to-emerald-600', icon: '🍃' },
    { id: 2, name: t('region.2'), color: 'from-blue-500 to-indigo-600', icon: '💧' },
    { id: 3, name: t('region.3'), color: 'from-red-500 to-orange-600', icon: '🔥' },
    { id: 4, name: t('region.4'), color: 'from-purple-500 to-pink-600', icon: '✨' },
  ];

  const getRegionProgress = (regionId: number) => {
    const regionPokemon = ALL_POKEMON.filter(p => {
      if (regionId === 1) return p.id <= 151;
      if (regionId === 2) return p.id > 151 && p.id <= 251;
      if (regionId === 3) return p.id > 251 && p.id <= 386;
      if (regionId === 4) return p.id > 386 && p.id <= 493;
      return false;
    });
    
    const collectedCount = regionPokemon.filter(p => collection.cards[p.id]).length;
    const totalCount = regionPokemon.length;
    const percentage = Math.floor((collectedCount / totalCount) * 100);
    
    return { collectedCount, totalCount, percentage };
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
          <Globe size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('nav.map')}</h2>
          <p className="text-gray-500 text-sm">{t('app.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regions.map((region) => {
          const isUnlocked = unlockedRegions.includes(region.id);
          const isCurrent = currentRegion === region.id;
          const { collectedCount, totalCount, percentage } = getRegionProgress(region.id);
          const isComplete = percentage === 100;

          return (
            <motion.div
              key={region.id}
              whileHover={isUnlocked ? { y: -5 } : {}}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                isCurrent 
                  ? 'border-blue-500 shadow-lg shadow-blue-100' 
                  : isUnlocked 
                    ? 'border-gray-200 hover:border-blue-300' 
                    : 'border-gray-100 opacity-80'
              }`}
            >
              <div className={`h-24 bg-gradient-to-br ${region.color} flex items-center justify-center text-4xl`}>
                {region.icon}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="text-white" size={32} />
                  </div>
                )}
              </div>

              <div className="p-5 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {region.name}
                      {isComplete && <CheckCircle size={18} className="text-green-500" />}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isCurrent ? t('region.current') : isUnlocked ? t('region.unlocked') : t('region.locked')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{percentage}%</span>
                    <p className="text-xs text-gray-400">{collectedCount} / {totalCount}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full bg-gradient-to-r ${region.color}`}
                  />
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onSwitchRegion(region.id)}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isCurrent ? t('region.current') : (
                      <>
                        {t('region.switch')}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 text-center italic">
                      {t('region.unlock_condition')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
