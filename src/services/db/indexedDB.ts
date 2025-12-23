// IndexedDB wrapper using Dexie.js for GW2 Achievement Tracker

import Dexie, { type EntityTable } from 'dexie'
import type {
  User,
  Achievement,
  UserAchievement,
  Mastery,
  UserMastery,
  Map,
  UserMapProgress,
  CacheEntry,
} from './schema'

// Database class extending Dexie
export class GW2Database extends Dexie {
  // Declare tables with their types
  users!: EntityTable<User, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  userAchievements!: EntityTable<UserAchievement, 'id'>
  masteries!: EntityTable<Mastery, 'id'>
  userMasteries!: EntityTable<UserMastery, 'id'>
  maps!: EntityTable<Map, 'id'>
  userMapProgress!: EntityTable<UserMapProgress, 'id'>
  cache!: EntityTable<CacheEntry, 'key'>

  constructor() {
    super('GW2AchievementTracker')

    // Define database schema with indexes
    // Syntax: 'primaryKey, index1, index2, *multiEntry, [compound+index]'
    this.version(1).stores({
      // Users table
      // Primary key: id
      // Indexes: name, accountId
      users: 'id, name, accountId',

      // Achievements table
      // Primary key: id
      // Indexes: name, type, *categories (multi-entry for array)
      achievements: 'id, name, type, *categories',

      // User Achievements table
      // Primary key: id (userId-achievementId)
      // Indexes: userId, achievementId, done, [userId+done] (compound)
      userAchievements: 'id, userId, achievementId, done, [userId+done]',

      // Masteries table
      // Primary key: id
      // Indexes: region
      masteries: 'id, region',

      // User Masteries table
      // Primary key: id (userId-masteryId)
      // Indexes: userId, masteryId
      userMasteries: 'id, userId, masteryId',

      // Maps table
      // Primary key: id
      // Indexes: name, regionId, continentId
      maps: 'id, name, regionId, continentId',

      // User Map Progress table
      // Primary key: id (userId-mapId)
      // Indexes: userId, mapId, completed
      userMapProgress: 'id, userId, mapId, completed',

      // Cache table
      // Primary key: key
      // Indexes: expiresAt (for cleanup)
      cache: 'key, expiresAt',
    })
  }

  // Helper method to clear all user-specific data
  async clearUserData(userId: string): Promise<void> {
    await Promise.all([
      this.userAchievements.where('userId').equals(userId).delete(),
      this.userMasteries.where('userId').equals(userId).delete(),
      this.userMapProgress.where('userId').equals(userId).delete(),
    ])
  }

  // Helper method to clear expired cache entries
  async clearExpiredCache(): Promise<void> {
    const now = Date.now()
    await this.cache.where('expiresAt').below(now).delete()
  }

  // Helper method to clear all cache
  async clearAllCache(): Promise<void> {
    await this.cache.clear()
  }

  // Helper method to get all users
  async getAllUsers(): Promise<User[]> {
    return this.users.toArray()
  }

  // Helper method to get user by ID
  async getUserById(userId: string): Promise<User | undefined> {
    return this.users.get(userId)
  }

  // Helper method to get achievements by category
  async getAchievementsByCategory(categoryId: number): Promise<Achievement[]> {
    return this.achievements.where('categories').equals(categoryId).toArray()
  }

  // Helper method to get user's completed achievements
  async getUserCompletedAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievements.where('[userId+done]').equals([userId, true]).toArray()
  }

  // Helper method to get user's incomplete achievements
  async getUserIncompleteAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievements.where('[userId+done]').equals([userId, false]).toArray()
  }
}

// Create and export database instance
export const db = new GW2Database()

// Enable automatic cache cleanup on startup
db.on('ready', async () => {
  await db.clearExpiredCache()
})
