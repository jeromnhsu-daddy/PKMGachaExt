import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, 
  Plus, 
  Download, 
  History, 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle,
  LogIn,
  RefreshCw,
  X,
  ArrowRight,
  Search,
  Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { auth, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  onSnapshot, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { CollectionState } from '../types';
import { getBasePokemon, getGeneration } from '../data/pokemon';
import { getPokemonImage } from '../constants';

interface TradeViewProps {
  collection: CollectionState;
  onUpdateCollection: (newCollection: CollectionState) => void;
  playSound?: (sound: string) => void;
}

interface TradeOffer {
  id: string;
  code: string;
  senderId: string;
  senderEmail: string;
  pokemonId: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: any;
  receiverId?: string;
}

export const TradeView: React.FC<TradeViewProps> = ({ collection: userInventory, onUpdateCollection, playSound }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'receive' | 'history'>('create');
  
  // Create Trade State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [rarityFilter, setRarityFilter] = useState('All');
  const [activeGen, setActiveGen] = useState(1);

  const allTypes = ['All', 'Grass', 'Fire', 'Water', 'Electric', 'Psychic', 'Fighting', 'Poison', 'Ground', 'Flying', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Normal', 'Ice', 'Steel', 'Dark', 'Fairy'];

  // Receive Trade State
  const [inputCode, setInputCode] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);
  const [receiveSuccess, setReceiveSuccess] = useState<string | null>(null);

  // History State
  const [trades, setTrades] = useState<TradeOffer[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'trades'),
      where('senderId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TradeOffer[];
      setTrades(tradeData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const generateTradeCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateTrade = async () => {
    if (!user || !selectedCardId) return;
    
    const pokemonId = Number(selectedCardId);
    const count = userInventory.cards[pokemonId] || 0;
    if (count <= 0) return;

    setIsCreating(true);
    const code = generateTradeCode();

    try {
      await addDoc(collection(db, 'trades'), {
        code,
        senderId: user.uid,
        senderEmail: user.email,
        pokemonId: pokemonId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Remove card from local inventory
      const newCards = { ...userInventory.cards };
      if (newCards[pokemonId] > 1) {
        newCards[pokemonId]--;
      } else {
        delete newCards[pokemonId];
      }
      onUpdateCollection({ ...userInventory, cards: newCards });
      
      setGeneratedCode(code);
      setSelectedCardId(null);
    } catch (error) {
      console.error("Failed to create trade:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleReceiveTrade = async () => {
    if (!user || inputCode.length !== 6) return;

    setIsReceiving(true);
    setReceiveError(null);
    setReceiveSuccess(null);

    try {
      const q = query(
        collection(db, 'trades'),
        where('code', '==', inputCode),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setReceiveError(t('trade.receive.invalid'));
        return;
      }

      const tradeDoc = snapshot.docs[0];
      const tradeData = tradeDoc.data() as TradeOffer;

      if (tradeData.senderId === user.uid) {
        setReceiveError(t('trade.receive.own'));
        return;
      }

      // Update trade status in Firestore
      await updateDoc(doc(db, 'trades', tradeDoc.id), {
        status: 'completed',
        receiverId: user.uid,
        completedAt: serverTimestamp()
      });

      // Add card to local inventory
      const basePokemon = getBasePokemon(tradeData.pokemonId);
      if (basePokemon) {
        const newCards = { ...userInventory.cards };
        newCards[tradeData.pokemonId] = (newCards[tradeData.pokemonId] || 0) + 1;

        onUpdateCollection({
          ...userInventory,
          cards: newCards
        });

        setReceiveSuccess(t('trade.receive.success').replace('{name}', t(`pokemon.${tradeData.pokemonId}`)));
        setInputCode('');
      }
    } catch (error) {
      console.error("Failed to receive trade:", error);
      setReceiveError("An error occurred during the trade.");
    } finally {
      setIsReceiving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2.5rem] border-2 border-[#141414] shadow-2xl text-center">
        <LogIn className="w-16 h-16 text-purple-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold tracking-tighter italic serif uppercase mb-4">{t('trade.login_required')}</h2>
        <button
          onClick={handleLogin}
          className="w-full py-4 bg-[#141414] text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          {t('trade.login_button')}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-12 px-6"
    >
      <div className="text-center mb-12">
        <p className="text-sm opacity-60 font-mono uppercase tracking-widest mb-8">{t('trade.subtitle')}</p>

        <div className="flex justify-center gap-4 overflow-x-auto no-scrollbar pb-2 max-w-full">
          {[
            { id: 'create', icon: <Plus className="w-4 h-4" />, label: t('trade.create.title') },
            { id: 'receive', icon: <Download className="w-4 h-4" />, label: t('trade.receive.title') },
            { id: 'history', icon: <History className="w-4 h-4" />, label: t('trade.history.title') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-white text-[#141414] border-2 border-[#141414] hover:bg-purple-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-[#141414] shadow-2xl p-10 min-h-[400px]">
        {activeTab === 'create' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h3 className="text-3xl font-bold tracking-tighter italic serif uppercase">{t('trade.create.title')}</h3>
                <p className="text-sm opacity-60 mt-1">{t('trade.create.desc')}</p>
              </div>
              
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
              </div>

              {generatedCode && (
                <div className="bg-purple-50 border-2 border-purple-600 px-6 py-3 rounded-2xl flex items-center gap-4 animate-bounce">
                  <span className="text-2xl font-mono font-bold text-purple-600 tracking-[0.5em]">{generatedCode}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                    }}
                    className="p-2 hover:bg-purple-200 rounded-full transition-colors"
                  >
                    <Copy className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar flex-nowrap pb-2">
              {[1, 2, 3, 4].map((gen) => {
                const isUnlocked = (userInventory.unlockedRegions || [1]).includes(gen);
                return (
                  <button
                    key={gen}
                    disabled={!isUnlocked}
                    onClick={() => {
                      setActiveGen(gen);
                      if (playSound) playSound('click');
                    }}
                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 whitespace-nowrap ${
                      activeGen === gen 
                        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-lg' 
                        : isUnlocked
                          ? 'bg-white text-[#141414] border-[#141414]/10 hover:border-purple-300'
                          : 'bg-[#141414]/5 text-[#141414]/30 border-transparent cursor-not-allowed'
                    }`}
                  >
                    {t(`region.${gen}`)}
                    {!isUnlocked && <Lock size={12} />}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-2">
              {Object.entries(userInventory.cards)
                .filter(([idStr]) => {
                  const id = Number(idStr);
                  const pokemon = getBasePokemon(id);
                  if (!pokemon) return false;
                  
                  const translatedName = t('pokemon.' + id).toLowerCase();
                  const matchesSearch = translatedName.includes(searchTerm.toLowerCase()) || pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || id.toString().includes(searchTerm);
                  const matchesType = typeFilter === 'All' || pokemon.types.includes(typeFilter);
                  const matchesRarity = rarityFilter === 'All' || pokemon.rarity === rarityFilter;
                  const matchesGen = getGeneration(id) === activeGen;
                  
                  return matchesSearch && matchesType && matchesRarity && matchesGen;
                })
                .map(([idStr, count]) => {
                const id = Number(idStr);
                const pokemon = getBasePokemon(id);
                const isSelected = selectedCardId === id.toString();
                const cardCount = count as number;
                if (cardCount <= 0) return null;
                
                return (
                  <motion.div
                    key={id}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      setSelectedCardId(isSelected ? null : id.toString());
                      setGeneratedCode(null);
                      if (playSound) playSound('click');
                    }}
                    className={`relative p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#141414] bg-[#141414]/5 shadow-md' 
                        : 'border-transparent hover:bg-[#141414]/5'
                    }`}
                  >
                    <div className="aspect-square relative mb-2">
                      <img 
                        src={getPokemonImage(id)}
                        alt={pokemon?.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 bg-[#141414] text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                        x{cardCount}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white p-1 rounded-full shadow-lg">
                          <Check className="w-2 h-2" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold truncate uppercase">{t(`pokemon.${id}`)}</p>
                  </motion.div>
                );
              })}
            </div>

            <button
              disabled={!selectedCardId || isCreating}
              onClick={handleCreateTrade}
              className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-lg transition-all flex items-center justify-center gap-3 ${
                selectedCardId && !isCreating
                  ? 'bg-purple-600 text-white hover:scale-[1.02] shadow-xl'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isCreating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <QrCode className="w-6 h-6" />}
              {t('trade.create.button')}
            </button>
          </div>
        )}

        {activeTab === 'receive' && (
          <div className="max-w-md mx-auto py-10 space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold tracking-tighter italic serif uppercase">{t('trade.receive.title')}</h3>
              <p className="text-sm opacity-60 mt-1">{t('trade.receive.desc')}</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder={t('trade.receive.placeholder')}
                className="w-full py-6 text-center text-4xl font-mono font-bold tracking-[0.5em] border-2 border-[#141414] rounded-3xl focus:ring-4 focus:ring-purple-200 transition-all outline-none"
              />

              <AnimatePresence mode="wait">
                {receiveError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {receiveError}
                  </motion.div>
                )}
                {receiveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold"
                  >
                    <Check className="w-5 h-5" />
                    {receiveSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={inputCode.length !== 6 || isReceiving}
                onClick={handleReceiveTrade}
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-lg transition-all flex items-center justify-center gap-3 ${
                  inputCode.length === 6 && !isReceiving
                    ? 'bg-purple-600 text-white hover:scale-[1.02] shadow-xl'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isReceiving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                {t('trade.receive.button')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-3xl font-bold tracking-tighter italic serif uppercase">{t('trade.history.title')}</h3>
            
            <div className="space-y-4">
              {trades.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <History className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest">{t('trade.history.empty')}</p>
                </div>
              ) : (
                trades.map(trade => {
                  const pokemon = getBasePokemon(trade.pokemonId);
                  return (
                    <div key={trade.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border-2 border-[#141414]/5">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl border-2 border-[#141414]/5 flex items-center justify-center">
                          <img 
                            src={getPokemonImage(trade.pokemonId)}
                            alt={pokemon?.name}
                            className="w-12 h-12 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-lg">{t(`pokemon.${trade.pokemonId}`)}</h4>
                            <span className="text-[10px] font-mono bg-[#141414] text-white px-2 py-0.5 rounded uppercase tracking-widest">
                              {trade.code}
                            </span>
                          </div>
                          <p className="text-xs opacity-50 font-mono">
                            {trade.createdAt?.toDate().toLocaleString() || 'Just now'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          trade.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          trade.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {t(`trade.status.${trade.status}`)}
                        </span>
                        {trade.status === 'pending' && (
                          <button 
                            onClick={async () => {
                              await updateDoc(doc(db, 'trades', trade.id), { status: 'cancelled' });
                              // Give card back to user
                              const newCards = { ...userInventory.cards };
                              newCards[trade.pokemonId] = (newCards[trade.pokemonId] || 0) + 1;
                              onUpdateCollection({
                                ...userInventory,
                                cards: newCards
                              });
                            }}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-400 hover:text-red-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
