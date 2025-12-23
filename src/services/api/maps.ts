// Map API Service for fetching maps and waypoints

import { gw2Api } from './gw2Api'
import { db } from '../db/indexedDB'
import { CACHE_TTL } from '../cache/cacheManager'
import type { MapResponse, ContinentFloorResponse } from '@/types/gw2'
import type { Map } from '@/services/db/schema'

export interface Waypoint {
  id: number
  name: string
  coord: [number, number]
  mapId: number
  mapName: string
  floor: number
}

export class MapService {
  // Fetch all maps from API or cache
  async getAllMaps(forceRefresh = false): Promise<Map[]> {
    // Check IndexedDB first if not forcing refresh
    if (!forceRefresh) {
      const cached = await db.maps.toArray()
      if (cached.length > 0) {
        return cached
      }
    }

    // Fetch from API
    const mapsData = await gw2Api.get<MapResponse[]>('/maps', {
      params: { ids: 'all' },
      cache: {
        key: 'maps:all',
        ttl: CACHE_TTL.MAPS,
      },
      deduplicate: true,
    })

    // Transform API response to our schema
    const maps: Map[] = mapsData.map((m) => ({
      id: m.id,
      name: m.name,
      minLevel: m.min_level,
      maxLevel: m.max_level,
      defaultFloor: m.default_floor,
      type: m.type,
      floors: m.floors,
      regionId: m.region_id,
      regionName: m.region_name,
      continentId: m.continent_id,
      continentName: m.continent_name,
      mapRect: m.map_rect as number[][],
      continentRect: m.continent_rect as number[][],
    }))

    // Store in IndexedDB
    await db.maps.bulkPut(maps)

    return maps
  }

  // Fetch waypoints from continent floor data
  async getWaypoints(continentId = 1, floorId = 1): Promise<Waypoint[]> {
    const cacheKey = `waypoints:${continentId}:${floorId}`

    // Check cache first
    const cached = await db.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as Waypoint[]
    }

    // Fetch floor data from API
    const floorData = await gw2Api.get<ContinentFloorResponse>(
      `/continents/${continentId}/floors/${floorId}`,
      {
        cache: {
          key: cacheKey,
          ttl: CACHE_TTL.MAPS,
        },
      }
    )

    const waypoints: Waypoint[] = []

    // Extract waypoints from regions
    Object.values(floorData.regions).forEach((region) => {
      Object.entries(region.maps).forEach(([mapId, mapData]) => {
        if (mapData.points_of_interest) {
          mapData.points_of_interest
            .filter((poi) => poi.type === 'waypoint')
            .forEach((poi) => {
              waypoints.push({
                id: poi.id,
                name: poi.name,
                coord: poi.coord,
                mapId: parseInt(mapId),
                mapName: mapData.name,
                floor: poi.floor,
              })
            })
        }
      })
    })

    // Cache waypoints
    await db.cache.put({
      key: cacheKey,
      data: waypoints,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL.MAPS,
    })

    return waypoints
  }

  // Search waypoints by name
  async searchWaypoints(query: string, continentId = 1, floorId = 1): Promise<Waypoint[]> {
    const waypoints = await this.getWaypoints(continentId, floorId)

    if (!query.trim()) {
      return waypoints
    }

    const searchLower = query.toLowerCase()
    return waypoints.filter(
      (wp) =>
        wp.name.toLowerCase().includes(searchLower) ||
        wp.mapName.toLowerCase().includes(searchLower)
    )
  }

  // Get maps by type (e.g., "Public", "Instance", "Tutorial")
  async getMapsByType(type: string): Promise<Map[]> {
    const maps = await db.maps.toArray()
    return maps.filter((m) => m.type === type)
  }

  // Get maps by region
  async getMapsByRegion(regionId: number): Promise<Map[]> {
    return db.maps.where('regionId').equals(regionId).toArray()
  }

  // Get maps by continent
  async getMapsByContinent(continentId: number): Promise<Map[]> {
    return db.maps.where('continentId').equals(continentId).toArray()
  }
}

// Export singleton instance
export const mapService = new MapService()
