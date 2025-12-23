// Mastery Store for managing masteries and user progress

import { create } from 'zustand'
import { masteryService } from '@/services/api/mastery'
import type { Mastery, UserMastery } from '@/services/db/schema'

interface MasteryFilters {
  search: string
  region: string // 'all' | 'Tyria' | 'Maguuma' | 'Desert' | 'Tundra' | 'Jade'
  showCommonIncomplete: boolean
}

interface MasteryState {
  masteries: Mastery[]
  userMasteries: Map<string, UserMastery[]> // userId -> masteries
  filters: MasteryFilters
  isLoading: boolean
  isSyncing: boolean
  error: string | null

  // Actions
  loadMasteries: (forceRefresh?: boolean) => Promise<void>
  loadUserMasteries: (userId: string, apiKey: string, forceRefresh?: boolean) => Promise<void>
  syncAllUsers: () => Promise<void>
  setFilter: <K extends keyof MasteryFilters>(
    key: K,
    value: MasteryFilters[K]
  ) => void
  clearFilters: () => void
  getFilteredMasteries: (selectedUserIds: string[]) => Mastery[]
  getUserProgress: (userId: string, masteryId: number) => UserMastery | undefined
  getMasteriesByRegion: (region: string) => Mastery[]
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  masteries: [],
  userMasteries: new Map(),
  filters: {
    search: '',
    region: 'all',
    showCommonIncomplete: false,
  },
  isLoading: false,
  isSyncing: false,
  error: null,

  loadMasteries: async (forceRefresh = false) => {
    set({ isLoading: true, error: null })
    try {
      const masteries = await masteryService.getAllMasteries(forceRefresh)
      set({ masteries, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load masteries'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to load masteries:', error)
    }
  },

  loadUserMasteries: async (userId, apiKey, forceRefresh = false) => {
    try {
      const userMasts = await masteryService.getUserMasteries(userId, apiKey, forceRefresh)

      set((state) => {
        const newMap = new Map(state.userMasteries)
        newMap.set(userId, userMasts)
        return { userMasteries: newMap }
      })
    } catch (error) {
      console.error(`Failed to load masteries for user ${userId}:`, error)
    }
  },

  syncAllUsers: async () => {
    set({ isSyncing: true, error: null })
    try {
      await masteryService.syncAllUsers()

      // Reload all user masteries from IndexedDB
      const { users } = await import('./userStore').then(m => ({ users: m.useUserStore.getState().users }))

      for (const user of users) {
        const userMasts = await masteryService.getUserMasteries(user.id, user.apiKey, false)
        set((state) => {
          const newMap = new Map(state.userMasteries)
          newMap.set(user.id, userMasts)
          return { userMasteries: newMap }
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
        region: 'all',
        showCommonIncomplete: false,
      },
    })
  },

  getFilteredMasteries: (selectedUserIds) => {
    const { masteries, filters, userMasteries } = get()

    let filtered = [...masteries]

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (mastery) =>
          mastery.name.toLowerCase().includes(searchLower) ||
          mastery.requirement.toLowerCase().includes(searchLower) ||
          mastery.region.toLowerCase().includes(searchLower)
      )
    }

    // Apply region filter
    if (filters.region !== 'all') {
      filtered = filtered.filter((mastery) => mastery.region === filters.region)
    }

    // Apply common incomplete filter
    if (filters.showCommonIncomplete && selectedUserIds.length > 0) {
      filtered = filtered.filter((mastery) => {
        // Check if ALL selected users have NOT unlocked this mastery
        return selectedUserIds.every((userId) => {
          const userMasts = userMasteries.get(userId)
          if (!userMasts) return true // Not unlocked = incomplete

          const userMast = userMasts.find((um) => um.masteryId === mastery.id)
          return !userMast // Not found means not unlocked
        })
      })
    }

    return filtered
  },

  getUserProgress: (userId, masteryId) => {
    const userMasteries = get().userMasteries.get(userId)
    if (!userMasteries) return undefined
    return userMasteries.find((um) => um.masteryId === masteryId)
  },

  getMasteriesByRegion: (region) => {
    const { masteries } = get()
    if (region === 'all') return masteries
    return masteries.filter((m) => m.region === region)
  },
}))
