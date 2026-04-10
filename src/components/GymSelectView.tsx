import React from 'react';
import { motion } from 'motion/react';
import { Swords, Info } from 'lucide-react';
import { Gym } from '../types';
import { TypeBadge } from './Common';
import { useLanguage } from '../contexts/LanguageContext';

interface GymSelectViewProps {
  gyms: Gym[];
  challengeGym: (gym: Gym) => void;
}

export const GymSelectView: React.FC<GymSelectViewProps> = ({
  gyms,
  challengeGym
}) => {
  const { t } = useLanguage();

  return (
    <motion.div 
      key="gym-select"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-white p-10 rounded-3xl border-4 border-[#141414] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-6xl font-bold tracking-tighter italic serif uppercase mb-2">{t('gym.title')}</h2>
          <p className="text-sm opacity-60 font-mono uppercase tracking-widest leading-relaxed max-w-md">
            {t('gym.desc')}
          </p>
        </div>

        <div className="relative z-10">
          <div className="px-8 py-6 bg-[#141414] text-[#E4E3E0] rounded-3xl flex items-center gap-4 shadow-2xl border-2 border-white/10">
            <Swords className="w-8 h-8 text-red-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs opacity-50 uppercase font-bold tracking-widest leading-none mb-1">{t('gym.total_badges')}</span>
              <span className="text-4xl font-black tracking-tighter leading-none">0 / 8</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gyms.map((gym) => (
          <motion.div
            key={gym.id}
            whileHover={{ y: -10 }}
            className="group relative bg-white rounded-3xl border-4 border-[#141414] overflow-hidden shadow-xl flex flex-col"
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src={gym.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-6">
                <h3 className="text-white text-3xl font-black tracking-tighter uppercase italic serif">{t('gym.' + gym.id + '.name')}</h3>
                <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest">{t('battle.leader', { leader: t('gym.' + gym.id + '.leader') })}</p>
              </div>
              <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-[#141414]">
                {gym.badgeIcon}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{t('gym.primary_type')}</span>
                  <TypeBadge type={gym.type} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{t('gym.difficulty')}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < gym.difficulty ? 'bg-red-500' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Info className="w-4 h-4 text-[#141414] mt-0.5 opacity-40" />
                  <p className="text-[10px] font-mono leading-relaxed opacity-60 uppercase">
                    {t('gym.reward_desc', { badge: t('gym.' + gym.id + '.badge') })}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => challengeGym(gym)}
                className="mt-auto w-full py-5 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
              >
                <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {t('gym.challenge')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
