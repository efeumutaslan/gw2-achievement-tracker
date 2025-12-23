// Database schema type definitions for GW2 Achievement Tracker

export interface User {
  id: string; // UUID
  name: string; // Custom name (e.g., "Efe")
  apiKey: string; // API key (plain text for now, can be encrypted later)
  accountName?: string; // From /v2/account
  accountId?: string; // From /v2/account
  permissions?: string[]; // From /v2/tokeninfo
  createdAt: number; // Timestamp
  lastSynced?: number; // Last API sync timestamp
}

export interface Achievement {
  id: number; // Achievement ID
  name: string;
  description: string;
  requirement: string;
  type: string; // "Default", "ItemSet", etc.
  flags: string[]; // "Pvp", "CategoryDisplay", etc.
  tiers?: Array<{
    count: number;
    points: number;
  }>;
  prerequisites?: number[];
  rewards?: Array<{
    type: string;
    id?: number;
    count?: number;
  }>;
  icon?: string;
  categories?: number[]; // Category IDs
  // Full GW2 API achievement object
}

export interface UserAchievement {
  id: string; // userId-achievementId
  userId: string;
  achievementId: number;
  done: boolean;
  current?: number; // Current progress
  max?: number; // Max progress
  bits?: number[]; // For bit-based achievements
  repeated?: number; // For repeatable achievements
  unlocked?: boolean;
  lastUpdated: number; // Timestamp
}

export interface Mastery {
  id: number;
  name: string;
  requirement: string;
  order: number;
  background: string;
  region: string; // "Tyria", "Maguuma", "Desert", "Tundra", "Jade"
  levels: Array<{
    name: string;
    description: string;
    instruction: string;
    icon: string;
    pointCost: number;
    expCost: number;
  }>;
}

export interface UserMastery {
  id: string; // userId-masteryId
  userId: string;
  masteryId: number;
  level: number; // Current level unlocked
  lastUpdated: number;
}

export interface Map {
  id: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  defaultFloor: number;
  type: string;
  floors: number[];
  regionId?: number;
  regionName?: string;
  continentId?: number;
  continentName?: string;
  mapRect?: number[][];
  continentRect?: number[][];
  pointsOfInterest?: Array<{
    id: number;
    name: string;
    type: string; // "waypoint", "landmark", "vista", etc.
    coord: [number, number];
    floor: number;
  }>;
}

export interface UserMapProgress {
  id: string; // userId-mapId
  userId: string;
  mapId: number;
  completed: boolean;
  lastUpdated: number;
}

export interface CacheEntry {
  key: string; // Cache key (e.g., "achievements:all")
  data: unknown; // Cached data
  timestamp: number; // When cached
  expiresAt: number; // When to expire
}
