// Map Store for managing maps and waypoints

import { create } from 'zustand'
import { mapService, type Waypoint } from '@/services/api/maps'
import type { Map } from '@/services/db/schema'

interface MapFilters {
  search: string
  type: string // 'all' | 'Public' | 'Instance' | 'Tutorial' | etc.
  continent: number | 'all'
  minLevel: number
  maxLevel: number
}

interface MapState {
  maps: Map[]
  waypoints: Waypoint[]
  filters: MapFilters
  isLoading: boolean
  isLoadingWaypoints: boolean
  error: string | null

  // Actions
  loadMaps: (forceRefresh?: boolean) => Promise<void>
  loadWaypoints: (continentId?: number, floorId?: number) => Promise<void>
  setFilter: <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => void
  clearFilters: () => void
  getFilteredMaps: () => Map[]
  getFilteredWaypoints: () => Waypoint[]
  searchWaypoints: (query: string) => Promise<void>
}

export const useMapStore = create<MapState>((set, get) => ({
  maps: [],
  waypoints: [],
  filters: {
    search: '',
    type: 'all',
    continent: 'all',
    minLevel: 0,
    maxLevel: 80,
  },
  isLoading: false,
  isLoadingWaypoints: false,
  error: null,

  loadMaps: async (forceRefresh = false) => {
    set({ isLoading: true, error: null })
    try {
      const maps = await mapService.getAllMaps(forceRefresh)
      set({ maps, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load maps'
      set({ error: errorMessage, isLoading: false })
      console.error('Failed to load maps:', error)
    }
  },

  loadWaypoints: async (continentId = 1, floorId = 1) => {
    set({ isLoadingWaypoints: true, error: null })
    try {
      const waypoints = await mapService.getWaypoints(continentId, floorId)
      set({ waypoints, isLoadingWaypoints: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load waypoints'
      set({ error: errorMessage, isLoadingWaypoints: false })
      console.error('Failed to load waypoints:', error)
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
        type: 'all',
        continent: 'all',
        minLevel: 0,
        maxLevel: 80,
      },
    })
  },

  getFilteredMaps: () => {
    const { maps, filters } = get()
    let filtered = [...maps]

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (map) =>
          map.name.toLowerCase().includes(searchLower) ||
          map.regionName?.toLowerCase().includes(searchLower) ||
          map.continentName?.toLowerCase().includes(searchLower)
      )
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((map) => map.type === filters.type)
    }

    // Apply continent filter
    if (filters.continent !== 'all') {
      filtered = filtered.filter((map) => map.continentId === filters.continent)
    }

    // Apply level range filter
    filtered = filtered.filter(
      (map) =>
        map.minLevel >= filters.minLevel &&
        map.maxLevel <= filters.maxLevel
    )

    return filtered
  },

  getFilteredWaypoints: () => {
    const { waypoints, filters } = get()

    if (!filters.search.trim()) {
      return waypoints
    }

    const searchLower = filters.search.toLowerCase()
    return waypoints.filter(
      (wp) =>
        wp.name.toLowerCase().includes(searchLower) ||
        wp.mapName.toLowerCase().includes(searchLower)
    )
  },

  searchWaypoints: async (query: string) => {
    set({ isLoadingWaypoints: true, error: null })
    try {
      const waypoints = await mapService.searchWaypoints(query)
      set({ waypoints, isLoadingWaypoints: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search waypoints'
      set({ error: errorMessage, isLoadingWaypoints: false })
      console.error('Failed to search waypoints:', error)
    }
  },
}))
