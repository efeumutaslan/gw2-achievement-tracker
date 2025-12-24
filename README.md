# Guild Wars 2 Achievement Tracker

Multi-user Guild Wars 2 achievement tracking application that allows you to track progress for 1-10 users simultaneously, compare achievements, and find common incomplete content.

## Features

### ✅ Implemented (All Phases Complete!)

- **Multi-User API Key Management** (Phase 1-2)
  - Add up to 10 GW2 API keys
  - Custom names for each user
  - Secure local storage in IndexedDB
  - API key validation
  - User management (add, remove)

- **Core Infrastructure** (Phase 1-3)
  - GW2 API client with rate limiting (600 req/min)
  - Automatic retry with exponential backoff
  - Request deduplication
  - IndexedDB storage for offline support
  - Cache management with TTL
  - TypeScript for type safety
  - Vercel serverless proxy for CORS

- **Achievement Tracking** (Phase 3-4)
  - 7000+ achievements from GW2 API
  - Virtual scrolling for performance
  - Expandable cards with detailed tier progress
  - Search with 300ms debounce
  - Status filters (completed, in-progress, not started)
  - Common incomplete achievements finder
  - Multi-user progress comparison
  - Dynamic sizing for expanded cards

- **Mastery Tracking** (Phase 5)
  - Track masteries across 5 regions
    * Central Tyria
    * Heart of Maguuma
    * Crystal Desert
    * Icebrood Saga
    * Cantha
  - Detailed level-by-level progress
  - User unlock status visualization
  - Region-based filtering

- **Maps & Waypoints** (Phase 6)
  - Browse 1000+ maps across Tyria
  - Filter by type (Public, Instance, Tutorial, etc.)
  - Filter by continent (Tyria, Mists)
  - Search through waypoints
  - Waypoint coordinates display
  - Virtual scrolling for performance

- **Dashboard** (Phase 7)
  - Overview cards (total users, achievements, masteries, maps)
  - Per-user statistics:
    * Achievement completion count and percentage
    * Total Achievement Points (AP) calculation
    * Masteries unlocked count
    * Color-coded progress bars
  - Automatic data loading
  - Responsive grid layout

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Data Storage**: IndexedDB (via Dexie.js)
- **UI Library**: Shadcn UI + Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Virtual Scrolling**: @tanstack/react-virtual

## Prerequisites

⚠️ **Important**: You need Node.js version **20.19+** or **22.12+** to run this project.

Check your Node.js version:
```bash
node --version
```

If you need to upgrade, download the latest version from [nodejs.org](https://nodejs.org/)

## Quick Start

### 🚀 Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KULLANICI_ADINIZ/gw2-achievement-tracker)

**En kolay yol:** Vercel'e deploy edin ve hemen kullanmaya başlayın!

1. GitHub'da repository oluşturun
2. Kodu GitHub'a push edin
3. [Vercel.com](https://vercel.com)'a gidin
4. "Add New Project" > GitHub repo'nuzu seçin
5. Deploy butonuna tıklayın
6. 2 dakika içinde hazır! 🎉

Detaylı deployment adımları için: [DEPLOYMENT.md](DEPLOYMENT.md)

### 💻 Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

**Not:** Local'de çalıştırmak için Node.js 20.19+ veya 22.12+ gerekli.

## How to Use

### Step 1: Get Your GW2 API Key

1. Visit [https://account.arena.net/applications](https://account.arena.net/applications)
2. Click "New Key"
3. Give it a name (e.g., "Achievement Tracker")
4. Select the following permissions (minimum required):
   - ✅ account
   - ✅ progression
   - ✅ characters
5. Click "Create API Key"
6. Copy the generated API key

### Step 2: Add Users

1. Navigate to **Settings** page
2. Enter a name for the user (e.g., "Efe", "Alice")
3. Paste the API key
4. Click "Add User"
5. Repeat for up to 10 users

### Step 3: Track Your Progress

**Dashboard**:
1. Navigate to **Dashboard** to see overall statistics
2. View completion percentages and Achievement Points per user
3. See total achievements, masteries, and maps available

**Achievements**:
1. Navigate to **Achievements** page
2. Browse all 7000+ achievements with virtual scrolling
3. Use search to find specific achievements
4. Filter by status (completed, in-progress, not-started)
5. Toggle "Show common incomplete" to find achievements none of your users have completed
6. Click any achievement to expand and see detailed tier-by-tier progress

**Masteries**:
1. Navigate to **Masteries** page
2. Switch between region tabs (Tyria, Maguuma, Desert, Tundra, Jade)
3. View level-by-level mastery progress
4. See which users have unlocked each mastery

**Maps & Waypoints**:
1. Navigate to **Maps** page
2. Browse maps or search waypoints
3. Filter by map type or continent
4. Find specific waypoints with coordinates

## Project Structure

```
gw2-achi-track/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── layout/         # Layout components
│   │   ├── achievements/   # Achievement components (coming soon)
│   │   └── users/          # User components (coming soon)
│   ├── stores/             # Zustand state management
│   │   ├── userStore.ts    # User/API key management
│   │   └── achievementStore.ts  # Achievement data
│   ├── services/           # API and data services
│   │   ├── api/
│   │   │   ├── gw2Api.ts          # GW2 API client
│   │   │   ├── achievements.ts    # Achievement endpoints
│   │   │   └── account.ts         # Account endpoints
│   │   ├── db/
│   │   │   ├── indexedDB.ts       # IndexedDB wrapper
│   │   │   └── schema.ts          # Database schema
│   │   └── cache/
│   │       └── cacheManager.ts    # Caching strategy
│   ├── types/              # TypeScript type definitions
│   │   └── gw2.ts          # GW2 API response types
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Achievements.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## API Rate Limiting

The GW2 API has the following rate limits:

- **Unauthenticated**: 300 requests/minute
- **Authenticated**: 600 requests/minute

This application implements:
- Token bucket algorithm for rate limiting
- Automatic request queuing
- Retry logic with exponential backoff on 429 errors
- Request deduplication to prevent duplicate calls

## Data Storage & Caching

### IndexedDB Stores

- **users**: API keys and account information
- **achievements**: Achievement definitions (cached 24h)
- **userAchievements**: User progress on achievements
- **cache**: General cache with TTL

### Caching Strategy

- **Static data** (achievements, masteries, maps): 24 hours
- **User progress**: 5 minutes
- **Account info**: 30 minutes
- Automatic cache cleanup on startup
- Offline support with stale cache fallback

## Security & Privacy

⚠️ **Important Security Notes**:

- API keys are stored **locally** in your browser's IndexedDB
- **No data is sent to any external server** (except GW2's official API)
- API keys are currently stored in **plain text** locally
- **Do not use this on shared computers**
- Consider using in a private/incognito window if on a shared device

## Development Phases

All 7 phases completed! 🎉

### ✅ Phase 1: Project Setup & Infrastructure
- ✅ Vite + React + TypeScript project
- ✅ Dependencies installed
- ✅ Shadcn UI + Tailwind CSS configured
- ✅ Project folder structure
- ✅ IndexedDB schema

### ✅ Phase 2: API Key Management
- ✅ User Zustand store
- ✅ GW2 API client with rate limiting
- ✅ Settings page with API key management UI
- ✅ Add/remove users functionality

### ✅ Phase 3: GW2 API Integration & Caching
- ✅ Cache manager with TTL
- ✅ Achievement service
- ✅ Account service
- ✅ Multi-user sync
- ✅ Vercel serverless proxy for CORS

### ✅ Phase 4: Achievement Tracking Core
- ✅ Achievement Zustand store
- ✅ Achievements page UI
- ✅ Filtering and search
- ✅ Virtual scrolling with dynamic sizing
- ✅ Multi-user comparison
- ✅ Expandable cards with tier details

### ✅ Phase 5: Mastery Tracking
- ✅ Mastery API service
- ✅ Mastery Zustand store
- ✅ Masteries page with region tabs
- ✅ Mastery tree visualization
- ✅ User progress indicators

### ✅ Phase 6: Map Completion & Waypoints
- ✅ Map API service
- ✅ Map Zustand store
- ✅ Maps page with filters
- ✅ Waypoint search component
- ✅ Virtual scrolling for maps

### ✅ Phase 7: Dashboard & Polish
- ✅ Dashboard with statistics
- ✅ Per-user progress cards
- ✅ Achievement Points calculation
- ✅ Progress bars and visualizations
- ✅ Final UI polish

## Troubleshooting

### "Node.js version too old" error

**Error**: `You are using Node.js X.X.X. Vite requires Node.js version 20.19+ or 22.12+`

**Solution**: Upgrade your Node.js to version 20.19+ or 22.12+
- Download from [nodejs.org](https://nodejs.org/)
- Use a version manager like [nvm](https://github.com/nvm-sh/nvm)

### API key validation fails

1. Check that your API key has the required permissions:
   - account
   - progression
   - characters
2. Make sure the API key is copied correctly (no extra spaces)
3. Try creating a new API key with all permissions

### Data not syncing

1. Check your internet connection
2. Look for errors in the browser console (F12)
3. Try manually refreshing with the "Sync Now" button
4. Check if you're being rate limited (wait a minute)

### IndexedDB errors

1. Clear browser data for this site
2. Try a different browser
3. Make sure you're not in private/incognito mode (some browsers disable IndexedDB)

## Contributing

This is a local-first application for personal use. Feel free to fork and modify for your own needs!

## Resources

- **GW2 API Documentation**: [https://wiki.guildwars2.com/wiki/API:Main](https://wiki.guildwars2.com/wiki/API:Main)
- **Get API Key**: [https://account.arena.net/applications](https://account.arena.net/applications)
- **React Documentation**: [https://react.dev](https://react.dev)
- **Zustand Documentation**: [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
- **Dexie.js Documentation**: [https://dexie.org](https://dexie.org)

## License

MIT

## Acknowledgments

- Guild Wars 2 API by ArenaNet
- Shadcn UI for beautiful components
- The React and TypeScript communities

---

**Note**: This application is not affiliated with ArenaNet or Guild Wars 2. Guild Wars 2 is a registered trademark of ArenaNet, LLC.
