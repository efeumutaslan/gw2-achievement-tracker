import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useMapStore } from '@/stores/mapStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Search, Loader2, Map as MapIcon } from 'lucide-react'
import { MapList } from '@/components/maps/MapList'
import { WaypointSearch } from '@/components/maps/WaypointSearch'

const MAP_TYPES = ['all', 'Public', 'Instance', 'Tutorial', 'Center', 'JumpPuzzle']
const CONTINENTS: Array<{ id: number | 'all'; name: string }> = [
  { id: 'all', name: 'All Continents' },
  { id: 1, name: 'Tyria' },
  { id: 2, name: 'Mists' },
]

export function Maps() {
  const users = useUserStore((state) => state.users)
  const selectedUserIds = useUserStore((state) => state.selectedUserIds)

  const {
    maps,
    waypoints,
    filters,
    isLoading,
    isLoadingWaypoints,
    loadMaps,
    loadWaypoints,
    setFilter,
    getFilteredMaps,
    getFilteredWaypoints,
  } = useMapStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('maps')

  // Load maps on mount
  useEffect(() => {
    const init = async () => {
      if (maps.length === 0) {
        await loadMaps()
      }
    }

    init()
  }, [maps.length, loadMaps])

  // Load waypoints when switching to waypoints tab
  useEffect(() => {
    if (activeTab === 'waypoints' && waypoints.length === 0) {
      loadWaypoints()
    }
  }, [activeTab, waypoints.length, loadWaypoints])

  // Update search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilter])

  const handleRefresh = async () => {
    await loadMaps(true)
    if (activeTab === 'waypoints') {
      await loadWaypoints()
    }
  }

  const filteredMaps = getFilteredMaps()
  const filteredWaypoints = getFilteredWaypoints()

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Maps & Waypoints</h1>
          <p className="text-muted-foreground">Explore Tyria and track your progress</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Users Yet</CardTitle>
            <CardDescription>Add users in Settings to start tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Go to Settings page and add your GW2 API keys to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maps & Waypoints</h1>
          <p className="text-muted-foreground">
            {activeTab === 'maps'
              ? `Exploring ${maps.length} maps across Tyria`
              : `Searching through ${waypoints.length} waypoints`}
          </p>
        </div>

        <Button onClick={handleRefresh} disabled={isLoading || isLoadingWaypoints}>
          {isLoading || isLoadingWaypoints ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === 'maps' ? 'Search maps...' : 'Search waypoints...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Map-specific filters */}
          {activeTab === 'maps' && (
            <>
              {/* Type Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <MapIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Type:</span>
                {MAP_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={filters.type === type ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('type', type)}
                  >
                    {type === 'all' ? 'All' : type}
                  </Badge>
                ))}
              </div>

              {/* Continent Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Continent:</span>
                {CONTINENTS.map((continent) => (
                  <Badge
                    key={continent.id}
                    variant={filters.continent === continent.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('continent', continent.id)}
                  >
                    {continent.name}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="maps">Maps ({maps.length})</TabsTrigger>
          <TabsTrigger value="waypoints">Waypoints ({waypoints.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="maps" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading maps...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <MapList maps={filteredMaps} selectedUserIds={selectedUserIds} />
          )}
        </TabsContent>

        <TabsContent value="waypoints" className="mt-6">
          {isLoadingWaypoints ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading waypoints...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <WaypointSearch waypoints={filteredWaypoints} selectedUserIds={selectedUserIds} />
          )}
        </TabsContent>
      </Tabs>

      {/* Results Info */}
      {!isLoading && activeTab === 'maps' && filteredMaps.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No maps found matching your filters.</p>
          </CardContent>
        </Card>
      )}

      {!isLoadingWaypoints && activeTab === 'waypoints' && filteredWaypoints.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No waypoints found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
