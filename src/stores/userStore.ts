// User Store for managing API keys and user selection

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/services/db/indexedDB'
import { accountService } from '@/services/api/account'
import type { User } from '@/services/db/schema'

interface UserState {
  users: User[]
  selectedUserIds: string[]
  isLoading: boolean
  error: string | null

  // Actions
  addUser: (name: string, apiKey: string) => Promise<void>
  removeUser: (userId: string) => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  loadUsers: () => Promise<void>
  selectUser: (userId: string) => void
  deselectUser: (userId: string) => void
  selectAllUsers: () => void
  clearSelection: () => void
  setError: (error: string | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      selectedUserIds: [],
      isLoading: false,
      error: null,

      addUser: async (name, apiKey) => {
        set({ isLoading: true, error: null })
        try {
          // Validate API key and get account info
          const { account, token } = await accountService.getAccountWithTokenInfo(apiKey)

          // Check if API key already exists
          const existingUsers = await db.users.toArray()
          if (existingUsers.some((u) => u.apiKey === apiKey)) {
            throw new Error('This API key is already added')
          }

          // Check if we've reached the limit (10 users)
          if (existingUsers.length >= 10) {
            throw new Error('Maximum of 10 users allowed')
          }

          // Create user object
          const user: User = {
            id: crypto.randomUUID(),
            name,
            apiKey,
            accountName: account.name,
            accountId: account.id,
            permissions: token.permissions,
            createdAt: Date.now(),
          }

          // Save to IndexedDB
          await db.users.add(user)

          // Update state
          set((state) => ({
            users: [...state.users, user],
            selectedUserIds: [...state.selectedUserIds, user.id],
            isLoading: false,
          }))
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to add user. Check API key.'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      removeUser: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          // Remove user from IndexedDB
          await db.users.delete(userId)

          // Remove all user-specific data
          await db.clearUserData(userId)

          // Clear cache for this user
          const user = get().users.find((u) => u.id === userId)
          if (user) {
            await db.cache
              .filter((entry) => entry.key.includes(user.apiKey))
              .delete()
          }

          // Update state
          set((state) => ({
            users: state.users.filter((u) => u.id !== userId),
            selectedUserIds: state.selectedUserIds.filter((id) => id !== userId),
            isLoading: false,
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove user'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      updateUser: async (userId, updates) => {
        set({ isLoading: true, error: null })
        try {
          // Update in IndexedDB
          await db.users.update(userId, updates)

          // Update state
          set((state) => ({
            users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
            isLoading: false,
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      loadUsers: async () => {
        set({ isLoading: true, error: null })
        try {
          const users = await db.users.toArray()
          set({
            users,
            selectedUserIds: users.map((u) => u.id),
            isLoading: false,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load users'
          set({ error: errorMessage, isLoading: false })
        }
      },

      selectUser: (userId) => {
        set((state) => {
          // Only add if not already selected
          if (!state.selectedUserIds.includes(userId)) {
            return {
              selectedUserIds: [...state.selectedUserIds, userId],
            }
          }
          return state
        })
      },

      deselectUser: (userId) => {
        set((state) => ({
          selectedUserIds: state.selectedUserIds.filter((id) => id !== userId),
        }))
      },

      selectAllUsers: () => {
        set((state) => ({
          selectedUserIds: state.users.map((u) => u.id),
        }))
      },

      clearSelection: () => {
        set({ selectedUserIds: [] })
      },

      setError: (error) => {
        set({ error })
      },
    }),
    {
      name: 'user-store',
      // Only persist selected user IDs
      partialize: (state) => ({ selectedUserIds: state.selectedUserIds }),
    }
  )
)
