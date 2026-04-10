import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const { t } = useLanguage();
  const colors: { [key: string]: string } = {
    Grass: "bg-emerald-500",
    Fire: "bg-orange-500",
    Water: "bg-blue-500",
    Electric: "bg-yellow-400",
    Psychic: "bg-pink-500",
    Fighting: "bg-red-700",
    Poison: "bg-purple-500",
    Ground: "bg-amber-600",
    Flying: "bg-indigo-400",
    Bug: "bg-lime-500",
    Rock: "bg-stone-500",
    Ghost: "bg-violet-700",
    Dragon: "bg-indigo-700",
    Normal: "bg-slate-400",
    Ice: "bg-cyan-300",
    Dark: "bg-slate-800",
    Steel: "bg-slate-500",
    Fairy: "bg-pink-300",
  };
  
  const types = type.split('/');
  
  return (
    <div className="flex gap-1">
      {types.map((t_type, i) => (
        <span key={i} className={`${colors[t_type] || 'bg-slate-400'} text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm`}>
          {t('type.' + t_type)}
        </span>
      ))}
    </div>
  );
};

export const PokeballIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M5 50 H95" stroke="currentColor" strokeWidth="8" />
    <circle cx="50" cy="50" r="15" fill="white" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M5 50 A45 45 0 0 1 95 50" fill="currentColor" opacity="0.2" />
  </svg>
);
