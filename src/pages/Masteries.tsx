import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useMasteryStore } from '@/stores/masteryStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Search, Loader2 } from 'lucide-react'
import { MasteryTree } from '@/components/masteries/MasteryTree'

const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'Tyria', label: 'Central Tyria' },
  { value: 'Maguuma', label: 'Heart of Maguuma' },
  { value: 'Desert', label: 'Crystal Desert' },
  { value: 'Tundra', label: 'Icebrood Saga' },
  { value: 'Jade', label: 'Cantha' },
]

export function Masteries() {
  const users = useUserStore((state) => state.users)
  const selectedUserIds = useUserStore((state) => state.selectedUserIds)

  const {
    masteries,
    filters,
    isLoading,
    isSyncing,
    loadMasteries,
    loadUserMasteries,
    syncAllUsers,
    setFilter,
    getFilteredMasteries,
    getMasteriesByRegion,
  } = useMasteryStore()

  const [searchTerm, setSearchTerm] = useState('')

  // Load masteries on mount
  useEffect(() => {
    const init = async () => {
      // Load all masteries if not loaded
      if (masteries.length === 0) {
        await loadMasteries()
      }

      // Load user masteries for all users
      for (const user of users) {
        await loadUserMasteries(user.id, user.apiKey)
      }
    }

    init()
  }, [masteries.length, users, loadMasteries, loadUserMasteries])

  // Update search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilter])

  const handleSync = async () => {
    await syncAllUsers()
  }

  const handleRegionChange = (region: string) => {
    setFilter('region', region)
  }

  const filteredMasteries = getFilteredMasteries(selectedUserIds)

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Masteries</h1>
          <p className="text-muted-foreground">Track mastery progress across all users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Users Yet</CardTitle>
            <CardDescription>Add users in Settings to start tracking masteries</CardDescription>
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
          <h1 className="text-3xl font-bold">Masteries</h1>
          <p className="text-muted-foreground">
            Tracking {masteries.length} masteries for {selectedUserIds.length}{' '}
            {selectedUserIds.length === 1 ? 'user' : 'users'}
          </p>
        </div>

        <Button onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sync All
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
              placeholder="Search masteries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Common Incomplete Filter */}
          {selectedUserIds.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant={filters.showCommonIncomplete ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('showCommonIncomplete', !filters.showCommonIncomplete)}
              >
                {filters.showCommonIncomplete ? '✓' : ''} Show Common Incomplete
              </Button>
              <span className="text-xs text-muted-foreground">
                Show masteries that none of the selected users have unlocked
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Region Tabs */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading masteries...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={filters.region} onValueChange={handleRegionChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {REGIONS.map((region) => (
              <TabsTrigger key={region.value} value={region.value}>
                {region.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {REGIONS.map((region) => (
            <TabsContent key={region.value} value={region.value} className="mt-6">
              <MasteryTree
                masteries={
                  region.value === 'all'
                    ? filteredMasteries
                    : getMasteriesByRegion(region.value).filter((m) =>
                        filteredMasteries.some((fm) => fm.id === m.id)
                      )
                }
                selectedUserIds={selectedUserIds}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Results Info */}
      {!isLoading && filteredMasteries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No masteries found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
