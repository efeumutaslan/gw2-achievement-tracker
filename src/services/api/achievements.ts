// Achievement API Service for fetching achievements and user progress

import { gw2Api } from './gw2Api'
import { db } from '../db/indexedDB'
import { CACHE_TTL } from '../cache/cacheManager'
import type { AchievementResponse, AccountAchievementResponse } from '@/types/gw2'
import type { Achievement, UserAchievement } from '@/services/db/schema'

export class AchievementService {
  // Fetch all achievements from API or cache
  async getAllAchievements(forceRefresh = false): Promise<Achievement[]> {
    // Check IndexedDB first if not forcing refresh
    if (!forceRefresh) {
      const cached = await db.achievements.toArray()
      if (cached.length > 0) {
        return cached
      }
    }

    // Fetch from API
    const achievementsData = await gw2Api.get<AchievementResponse[]>('/achievements', {
      params: { ids: 'all' },
      cache: {
        key: 'achievements:all',
        ttl: CACHE_TTL.ACHIEVEMENTS,
      },
      deduplicate: true,
    })

    // Transform API response to our schema
    const achievements: Achievement[] = achievementsData.map((ach) => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      requirement: ach.requirement,
      type: ach.type,
      flags: ach.flags,
      tiers: ach.tiers,
      prerequisites: ach.prerequisites,
      rewards: ach.rewards,
      icon: ach.icon,
      categories: [], // Will be populated when we fetch categories
    }))

    // Store in IndexedDB
    await db.achievements.bulkPut(achievements)

    return achievements
  }

  // Fetch user achievement progress
  async getUserAchievements(
    userId: string,
    apiKey: string,
    forceRefresh = false
  ): Promise<UserAchievement[]> {
    // Check if we have recent data (< 5 minutes old)
    if (!forceRefresh) {
      const cached = await db.userAchievements.where('userId').equals(userId).toArray()

      if (cached.length > 0) {
        const latestUpdate = Math.max(...cached.map((a) => a.lastUpdated))
        if (Date.now() - latestUpdate < CACHE_TTL.USER_PROGRESS) {
          return cached
        }
      }
    }

    // Fetch from API
    const progress = await gw2Api.get<AccountAchievementResponse[]>('/account/achievements', {
      apiKey,
      cache: {
        key: `achievements:user:${userId}`,
        ttl: CACHE_TTL.USER_PROGRESS,
      },
    })

    // Transform to UserAchievement format
    const userAchievements: UserAchievement[] = progress.map((p) => ({
      id: `${userId}-${p.id}`,
      userId,
      achievementId: p.id,
      done: p.done,
      current: p.current,
      max: p.max,
      bits: p.bits,
      repeated: p.repeated,
      unlocked: p.unlocked,
      lastUpdated: Date.now(),
    }))

    // Store in IndexedDB
    await db.userAchievements.bulkPut(userAchievements)

    return userAchievements
  }

  // Sync all users' achievement progress
  async syncAllUsers(): Promise<void> {
    const users = await db.users.toArray()

    const syncPromises = users.map((user) =>
      this.getUserAchievements(user.id, user.apiKey, true).catch((error) => {
        console.error(`Failed to sync user ${user.name}:`, error)
        return [] // Return empty array on error to not break Promise.all
      })
    )

    await Promise.all(syncPromises)

    // Update last synced timestamp for all users
    const now = Date.now()
    await Promise.all(users.map((user) => db.users.update(user.id, { lastSynced: now })))
  }

  // Get achievements that are incomplete for ALL selected users
  async getCommonIncompleteAchievements(userIds: string[]): Promise<Achievement[]> {
    if (userIds.length === 0) {
      return []
    }

    // Get all achievements
    const allAchievements = await db.achievements.toArray()

    // Get user achievements for all selected users
    const userAchievementsMap = new Map<string, UserAchievement[]>()
    for (const userId of userIds) {
      const userAchs = await db.userAchievements.where('userId').equals(userId).toArray()
      userAchievementsMap.set(userId, userAchs)
    }

    // Filter achievements where ALL users have not completed
    const commonIncomplete = allAchievements.filter((achievement) => {
      return userIds.every((userId) => {
        const userAchs = userAchievementsMap.get(userId) || []
        const userAch = userAchs.find((ua) => ua.achievementId === achievement.id)

        // If user doesn't have this achievement record, or it's not done, include it
        return !userAch || !userAch.done
      })
    })

    return commonIncomplete
  }

  // Get user's completed achievements
  async getUserCompletedAchievements(userId: string): Promise<UserAchievement[]> {
    return db.getUserCompletedAchievements(userId)
  }

  // Get user's incomplete achievements
  async getUserIncompleteAchievements(userId: string): Promise<UserAchievement[]> {
    return db.getUserIncompleteAchievements(userId)
  }

  // Get achievement by ID
  async getAchievementById(achievementId: number): Promise<Achievement | undefined> {
    return db.achievements.get(achievementId)
  }

  // Get user achievement progress for specific achievement
  async getUserAchievementProgress(
    userId: string,
    achievementId: number
  ): Promise<UserAchievement | undefined> {
    return db.userAchievements.get(`${userId}-${achievementId}`)
  }
}

// Export singleton instance
export const achievementService = new AchievementService()
