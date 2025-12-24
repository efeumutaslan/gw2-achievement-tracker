// Mastery API Service for fetching masteries and user progress

import { gw2Api } from './gw2Api'
import { db } from '../db/indexedDB'
import { CACHE_TTL } from '../cache/cacheManager'
import type { MasteryResponse, AccountMasteriesResponse } from '@/types/gw2'
import type { Mastery, UserMastery } from '@/services/db/schema'

export class MasteryService {
  // Fetch all masteries from API or cache
  async getAllMasteries(forceRefresh = false): Promise<Mastery[]> {
    // Check IndexedDB first if not forcing refresh
    if (!forceRefresh) {
      const cached = await db.masteries.toArray()
      if (cached.length > 0) {
        return cached
      }
    }

    // Step 1: Fetch all mastery IDs
    const masteryIds = await gw2Api.get<number[]>('/masteries', {
      cache: {
        key: 'masteries:ids',
        ttl: CACHE_TTL.MASTERIES,
      },
      deduplicate: true,
    })

    // Step 2: Fetch mastery details (masteries are few, can fetch all at once)
    const masteriesData = await gw2Api.get<MasteryResponse[]>('/masteries', {
      params: { ids: masteryIds.join(',') },
      cache: {
        key: 'masteries:all',
        ttl: CACHE_TTL.MASTERIES,
      },
      deduplicate: true,
    })

    // Transform API response to our schema
    const masteries: Mastery[] = masteriesData.map((m) => ({
      id: m.id,
      name: m.name,
      requirement: m.requirement,
      order: m.order,
      background: m.background,
      region: m.region,
      levels: m.levels.map((level) => ({
        name: level.name,
        description: level.description,
        instruction: level.instruction,
        icon: level.icon,
        pointCost: level.point_cost,
        expCost: level.exp_cost,
      })),
    }))

    // Store in IndexedDB
    await db.masteries.bulkPut(masteries)

    return masteries
  }

  // Fetch user mastery progress
  async getUserMasteries(
    userId: string,
    apiKey: string,
    forceRefresh = false
  ): Promise<UserMastery[]> {
    // Check if we have recent data (< 15 minutes old)
    if (!forceRefresh) {
      const cached = await db.userMasteries.where('userId').equals(userId).toArray()

      if (cached.length > 0) {
        const latestUpdate = Math.max(...cached.map((m) => m.lastUpdated))
        if (Date.now() - latestUpdate < CACHE_TTL.USER_MASTERIES) {
          return cached
        }
      }
    }

    // Fetch from API - use /account/masteries for level info
    const masteryData = await gw2Api.get<AccountMasteriesResponse[]>('/account/masteries', {
      apiKey,
      cache: {
        key: `masteries:user:${userId}`,
        ttl: CACHE_TTL.USER_MASTERIES,
      },
    })

    // Debug: Log the response
    console.log('Mastery API response for user', userId, ':', masteryData)

    // Validate response is an array
    if (!Array.isArray(masteryData)) {
      console.error('Invalid mastery data response:', masteryData)
      throw new Error('Invalid mastery data: expected array, got ' + typeof masteryData)
    }

    // Transform to UserMastery format
    // Note: GW2 API level is 0-indexed (0 = first level unlocked)
    // We add 1 to make it 1-indexed for easier display
    const userMasteries: UserMastery[] = masteryData.map((mastery) => ({
      id: `${userId}-${mastery.id}`,
      userId,
      masteryId: mastery.id,
      level: mastery.level + 1, // Convert from 0-indexed to 1-indexed
      lastUpdated: Date.now(),
    }))

    // Store in IndexedDB
    await db.userMasteries.bulkPut(userMasteries)

    return userMasteries
  }

  // Sync all users' mastery progress
  async syncAllUsers(): Promise<void> {
    const users = await db.users.toArray()

    const syncPromises = users.map((user) =>
      this.getUserMasteries(user.id, user.apiKey, true).catch((error) => {
        console.error(`Failed to sync masteries for user ${user.name}:`, error)
        return []
      })
    )

    await Promise.all(syncPromises)
  }

  // Get masteries by region
  async getMasteriesByRegion(region: string): Promise<Mastery[]> {
    return db.masteries.where('region').equals(region).toArray()
  }

  // Get user's unlocked masteries
  async getUserUnlockedMasteries(userId: string): Promise<UserMastery[]> {
    return db.userMasteries.where('userId').equals(userId).toArray()
  }
}

// Export singleton instance
export const masteryService = new MasteryService()
