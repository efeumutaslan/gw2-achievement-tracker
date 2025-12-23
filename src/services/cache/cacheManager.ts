// Cache Manager for handling cached data with TTL

import { db, type GW2Database } from '../db/indexedDB'

// Cache TTL configuration (in milliseconds)
export const CACHE_TTL = {
  ACHIEVEMENTS: 24 * 60 * 60 * 1000, // 24 hours
  USER_PROGRESS: 5 * 60 * 1000, // 5 minutes
  MASTERIES: 24 * 60 * 60 * 1000, // 24 hours
  USER_MASTERIES: 15 * 60 * 1000, // 15 minutes
  MAPS: 24 * 60 * 60 * 1000, // 24 hours
  ACCOUNT_INFO: 30 * 60 * 1000, // 30 minutes
  TOKEN_INFO: 60 * 60 * 1000, // 1 hour
} as const

export class CacheManager {
  constructor(private database: GW2Database) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.database.cache.get(key)

      if (!entry) {
        return null
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await this.database.cache.delete(key)
        return null
      }

      return entry.data as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await this.database.cache.put({
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      })
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.database.cache.delete(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // Delete keys matching pattern
        const keys = await this.database.cache
          .filter((entry) => entry.key.startsWith(pattern))
          .primaryKeys()
        await this.database.cache.bulkDelete(keys)
      } else {
        // Clear all cache
        await this.database.cache.clear()
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  async cleanExpired(): Promise<void> {
    try {
      const now = Date.now()
      const expiredKeys = await this.database.cache.where('expiresAt').below(now).primaryKeys()
      await this.database.cache.bulkDelete(expiredKeys)
    } catch (error) {
      console.error('Cache cleanup error:', error)
    }
  }

  // Check if cache entry exists and is not expired
  async has(key: string): Promise<boolean> {
    const entry = await this.get(key)
    return entry !== null
  }

  // Get cache entry age in milliseconds
  async getAge(key: string): Promise<number | null> {
    try {
      const entry = await this.database.cache.get(key)
      if (!entry) {
        return null
      }
      return Date.now() - entry.timestamp
    } catch (error) {
      console.error('Cache getAge error:', error)
      return null
    }
  }

  // Check if cache is stale (< 10% TTL remaining)
  async isStale(key: string): Promise<boolean> {
    try {
      const entry = await this.database.cache.get(key)
      if (!entry) {
        return true
      }

      const ttl = entry.expiresAt - entry.timestamp
      const remaining = entry.expiresAt - Date.now()
      return remaining < ttl * 0.1
    } catch (error) {
      console.error('Cache isStale error:', error)
      return true
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager(db)
