import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useMasteryStore } from '@/stores/masteryStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Star, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// User colors for progress indicators
const USER_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-cyan-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
]

export function Dashboard() {
  const users = useUserStore((state) => state.users)
  const selectedUserIds = useUserStore((state) => state.selectedUserIds)

  const achievements = useAchievementStore((state) => state.achievements)
  const userAchievements = useAchievementStore((state) => state.userAchievements)
  const loadAchievements = useAchievementStore((state) => state.loadAchievements)

  const masteries = useMasteryStore((state) => state.masteries)
  const userMasteries = useMasteryStore((state) => state.userMasteries)
  const loadMasteries = useMasteryStore((state) => state.loadMasteries)

  // Load data on mount
  useEffect(() => {
    if (achievements.length === 0) loadAchievements()
    if (masteries.length === 0) loadMasteries()
  }, [achievements.length, masteries.length, loadAchievements, loadMasteries])

  // Calculate user statistics
  const userStats = selectedUserIds.map((userId) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return null

    const userAchs = userAchievements.get(userId) || []
    const completedCount = userAchs.filter((a) => a.done).length
    const totalAP = userAchs
      .filter((a) => a.done)
      .reduce((sum, userAch) => {
        const ach = achievements.find((a) => a.id === userAch.achievementId)
        if (!ach?.tiers) return sum
        // Get the highest tier AP
        const maxTierAP = Math.max(...ach.tiers.map((t) => t.points))
        return sum + maxTierAP
      }, 0)

    const userMasts = userMasteries.get(userId) || []
    const unlockedMasteries = userMasts.length

    return {
      user,
      completedCount,
      totalAP,
      unlockedMasteries,
      percentage: achievements.length > 0 ? (completedCount / achievements.length) * 100 : 0,
    }
  }).filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Guild Wars 2 progress
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedUserIds.length} selected for tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available to track
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masteries</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masteries.length}</div>
            <p className="text-xs text-muted-foreground">
              Across 5 regions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Progress */}
      {userStats.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {userStats.map((stat, idx) => {
            if (!stat) return null
            const colorClass = USER_COLORS[idx % USER_COLORS.length]

            return (
              <Card key={stat.user.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    {stat.user.name}
                  </CardTitle>
                  <CardDescription>{stat.user.accountName || 'Account'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Achievements */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Achievements</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {stat.completedCount.toLocaleString()} / {achievements.length.toLocaleString()}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stat.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Achievement Points */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Achievement Points</span>
                    </div>
                    <div className="font-semibold">{stat.totalAP.toLocaleString()} AP</div>
                  </div>

                  {/* Masteries */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Masteries Unlocked</span>
                    </div>
                    <div className="font-semibold">
                      {stat.unlockedMasteries} / {masteries.length}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Overall Progress</span>
                      <span>{stat.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} transition-all`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Add your first GW2 API key to start tracking achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              1. Go to Settings<br />
              2. Click "Add User"<br />
              3. Enter a name and your GW2 API key<br />
              4. Start tracking!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
