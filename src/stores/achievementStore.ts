// Achievement Store for managing achievements and user progress

import { create } from 'zustand'
import { achievementService } from '@/services/api/achievements'
import type { Achievement, UserAchievement } from '@/services/db/schema'

interface AchievementFilters {
  search: string
  categories: number[]
  status: 'all' | 'completed' | 'in-progress' | 'not-started'
  showCommonIncomplete: boolean
}

interface AchievementState {
  achievements: Achievement[]
  userAchievements: Map<string, UserAchievement[]> // userId -> achievements
  filters: AchievementFilters
  isLoading: boolean
  isSyncing: boolean
  error: string | null

  // Actions
  loadAchievements: (forceRefresh?: boolean) => Promise<void>
  loadUserAchievements: (userId: string, apiKey: string, forceRefresh?: boolean) => Promise<void>
  syncAllUsers: () => Promise<void>
  setFilter: <K extends keyof AchievementFilters>(
    key: K,
    value: AchievementFilters[K]
  ) => void
  clearFilters: () => void
  getFilteredAchievements: (selectedUserIds: string[]) => Achievement[]
  getUserProgress: (userId: string, achievementId: number) => UserAchievement | undefined
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  userAchievements: new Map(),
  filters: {
    search: '',
    categories: [],
    status: 'all',
    showCommonIncomplete: false,
  },
  isLoading: false,
  isSyncing: false,
  error: null,

  loadAchievements: async (forceRefresh = false) => {
    set({ isLoading: true, error: null })
    try {
      const achievements = await achievementService.getAllAchievements(forceRefresh)
      set({ achievements, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load achievements'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to load achievements:', error)
    }
  },

  loadUserAchievements: async (userId, apiKey, forceRefresh = false) => {
    try {
      const userAchis = await achievementService.getUserAchievements(userId, apiKey, forceRefresh)

      set((state) => {
        const newMap = new Map(state.userAchievements)
        newMap.set(userId, userAchis)
        return { userAchievements: newMap }
      })
    } catch (error) {
      console.error(`Failed to load achievements for user ${userId}:`, error)
    }
  },

  syncAllUsers: async () => {
    set({ isSyncing: true, error: null })
    try {
      await achievementService.syncAllUsers()

      // Reload all user achievements from IndexedDB
      const { users } = await import('./userStore').then(m => ({ users: m.useUserStore.getState().users }))

      for (const user of users) {
        const userAchis = await achievementService.getUserAchievements(user.id, user.apiKey, false)
        set((state) => {
          const newMap = new Map(state.userAchievements)
          newMap.set(user.id, userAchis)
          return { userAchievements: newMap }
        })
      }

      set({ isSyncing: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync users'
      set({ error: errorMessage, isSyncing: false })
      console.error('Failed to sync all users:', error)
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        categories: [],
        status: 'all',
        showCommonIncomplete: false,
      },
    })
  },

  getFilteredAchievements: (selectedUserIds) => {
    const { achievements, filters, userAchievements } = get()

    let filtered = [...achievements]

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (ach) =>
          ach.name.toLowerCase().includes(searchLower) ||
          ach.description.toLowerCase().includes(searchLower) ||
          ach.requirement.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((ach) =>
        ach.categories?.some((c) => filters.categories.includes(c))
      )
    }

    // Apply status filter
    if (filters.status !== 'all' && selectedUserIds.length > 0) {
      filtered = filtered.filter((ach) => {
        // Check status across all selected users
        const statuses = selectedUserIds.map((userId) => {
          const userAchs = userAchievements.get(userId)
          if (!userAchs) return 'not-started'

          const userAch = userAchs.find((ua) => ua.achievementId === ach.id)
          if (!userAch) return 'not-started'
          if (userAch.done) return 'completed'
          if (userAch.current && userAch.current > 0) return 'in-progress'
          return 'not-started'
        })

        // For "all users" filtering
        if (filters.status === 'completed') {
          return statuses.every((s) => s === 'completed')
        } else if (filters.status === 'in-progress') {
          return statuses.some((s) => s === 'in-progress')
        } else if (filters.status === 'not-started') {
          return statuses.every((s) => s === 'not-started')
        }

        return true
      })
    }

    // Apply common incomplete filter
    if (filters.showCommonIncomplete && selectedUserIds.length > 0) {
      filtered = filtered.filter((ach) => {
        // Check if ALL selected users have NOT completed this achievement
        return selectedUserIds.every((userId) => {
          const userAchs = userAchievements.get(userId)
          if (!userAchs) return true // Not started = incomplete

          const userAch = userAchs.find((ua) => ua.achievementId === ach.id)
          return !userAch || !userAch.done
        })
      })
    }

    return filtered
  },

  getUserProgress: (userId, achievementId) => {
    const userAchievements = get().userAchievements.get(userId)
    if (!userAchievements) return undefined
    return userAchievements.find((ua) => ua.achievementId === achievementId)
  },
}))
