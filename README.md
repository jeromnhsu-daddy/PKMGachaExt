# Pokémon Gacha!!

A nostalgic card drawing and collection game where you can collect all 493 Pokémon from the first four generations. Build your team, battle gym leaders, trade with friends, and complete your Pokédex!

![App Screenshot](https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=1200&h=600)

## ✨ Features

- **Card Drawing System**: Spend coins to draw random Pokémon cards. Experience the thrill of finding Rare and Legendary Pokémon with special visual effects.
- **Real-Time Card Trading**: Exchange cards with other players using secure 6-digit trade codes. Powered by **Firebase Firestore** for real-time synchronization.
- **Cross-Generational Evolutions**: A sophisticated evolution system that supports cross-gen forms (e.g., Scyther to Scizor) and "Mysterious Evolutions" for locked regions.
- **Multi-Region Exploration**: Journey through Kanto, Johto, Hoenn, and Sinnoh. Unlock new regions by completing your collection.
- **Complete Collection Tracker**: A beautiful grid view of all 493 Pokémon. Track your progress, view detailed stats, and filter by generation, type, or rarity.
- **Battle System**:
  - **Standard Battles**: Test your team against random opponents in various arenas.
  - **Gym Challenges**: Battle the 8 classic Gym Leaders of each region to earn badges and rewards.
  - **Auto-Battle Mode**: Toggle auto-battle for faster gameplay.
- **RPG Elements**:
  - **HP Recovery**: Pokémon heal slowly over time when not in battle.
  - **Evolution**: Use Evolution Candy or duplicate cards to evolve your Pokémon.
  - **Stat Boosts**: Use items like Protein and Iron to permanently increase stats.
- **In-Game Shop**: Purchase healing items, rare candies, and transfer balls to move Pokémon between regions.
- **Developer Panel**: Password-protected developer tools (`19790822`) for testing, region jumping, and infinite coins.
- **Multi-language Support**: Full support for English and Traditional Chinese (繁體中文).
- **Sound Effects**: Immersive audio synthesis for hits, victories, evolutions, and UI interactions.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Backend/Real-time**: Firebase (Firestore & Authentication)
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Analytics**: Google Analytics 4
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase Project (for trading features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pokemon-tgc-collector
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a `firebase-applet-config.json` in the root directory with your Firebase credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## 📂 Project Structure

```text
├── src/
│   ├── components/       # UI components (TradeView, ShopView, BattleView, etc.)
│   ├── contexts/         # React Contexts (LanguageContext)
│   ├── data/             # Pokémon data by generation
│   ├── lib/              # Library configurations (Firebase)
│   ├── types.ts          # TypeScript interfaces and types
│   ├── App.tsx           # Main application logic and routing
│   ├── i18n.ts           # Translation strings
│   └── main.tsx          # Application entry point
├── firestore.rules       # Firebase security rules
├── firebase-blueprint.json # Database schema definition
└── package.json          # Dependencies and scripts
```

## 🎮 How to Play

1. **Draw Cards**: Start by drawing cards from the main screen. Each draw costs 100 coins.
2. **Explore Regions**: Switch between Kanto, Johto, Hoenn, and Sinnoh via the Map.
3. **Trade**: Use the "Trade" tab in the Shop to generate codes and exchange cards with friends.
4. **Battle**: Challenge Gym Leaders to earn badges. Collect all 8 in a region to unlock the next!
5. **Evolve**: Collect enough duplicate cards or use Evolution Candy to reach higher evolution stages.

## 📄 License

This project is licensed under the Apache-2.0 License.

---

*Disclaimer: This is a fan project and is not affiliated with Nintendo, Creatures, Game Freak, or The Pokémon Company.*
