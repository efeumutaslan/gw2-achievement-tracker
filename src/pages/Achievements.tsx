import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Filter, Loader2 } from 'lucide-react'
import { AchievementList } from '@/components/achievements/AchievementList'

export function Achievements() {
  const users = useUserStore((state) => state.users)
  const selectedUserIds = useUserStore((state) => state.selectedUserIds)

  const {
    achievements,
    filters,
    isLoading,
    isSyncing,
    loadAchievements,
    loadUserAchievements,
    syncAllUsers,
    setFilter,
    getFilteredAchievements,
  } = useAchievementStore()

  const [searchTerm, setSearchTerm] = useState('')

  // Load achievements on mount
  useEffect(() => {
    const init = async () => {
      // Load all achievements if not loaded
      if (achievements.length === 0) {
        await loadAchievements()
      }

      // Load user achievements for all users
      for (const user of users) {
        await loadUserAchievements(user.id, user.apiKey)
      }
    }

    init()
  }, [achievements.length, users, loadAchievements, loadUserAchievements])

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

  const filteredAchievements = getFilteredAchievements(selectedUserIds)

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Track achievement progress across all users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Users Yet</CardTitle>
            <CardDescription>Add users in Settings to start tracking achievements</CardDescription>
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
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">
            Tracking {achievements.length.toLocaleString()} achievements for {selectedUserIds.length}{' '}
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
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Status:</span>
            {(['all', 'completed', 'in-progress', 'not-started'] as const).map((status) => (
              <Badge
                key={status}
                variant={filters.status === status ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('status', status)}
              >
                {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status === 'not-started' ? 'Not Started' : 'Completed'}
              </Badge>
            ))}
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
                Show achievements that none of the selected users have completed
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading achievements...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AchievementList
          achievements={filteredAchievements}
          selectedUserIds={selectedUserIds}
        />
      )}

      {/* Results Info */}
      {!isLoading && filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No achievements found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
