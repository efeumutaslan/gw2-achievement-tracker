import { useAchievementStore } from '@/stores/achievementStore'
import { useUserStore } from '@/stores/userStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import type { Achievement } from '@/services/db/schema'

interface AchievementCardProps {
  achievement: Achievement
  selectedUserIds: string[]
}

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

export function AchievementCard({ achievement, selectedUserIds }: AchievementCardProps) {
  const getUserProgress = useAchievementStore((state) => state.getUserProgress)
  const users = useUserStore((state) => state.users)

  return (
    <Card className="m-2 hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Achievement Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {achievement.description}
            </p>

            {/* Requirement */}
            {achievement.requirement && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Requirement:</span> {achievement.requirement}
              </p>
            )}

            {/* Tiers */}
            {achievement.tiers && achievement.tiers.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="text-xs font-medium">Tiers:</span>
                {achievement.tiers.map((tier, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tier.count} = {tier.points}AP
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* User Progress Indicators */}
          <div className="flex flex-col gap-1 min-w-fit">
            {selectedUserIds.map((userId, idx) => {
              const user = users.find((u) => u.id === userId)
              const progress = getUserProgress(userId, achievement.id)

              if (!user) return null

              const colorClass = USER_COLORS[idx % USER_COLORS.length]

              let status: 'completed' | 'in-progress' | 'not-started' = 'not-started'
              let progressText = ''

              if (progress) {
                if (progress.done) {
                  status = 'completed'
                  progressText = 'Complete'
                } else if (progress.current && progress.max) {
                  status = 'in-progress'
                  progressText = `${progress.current}/${progress.max}`
                } else if (progress.current) {
                  status = 'in-progress'
                  progressText = `${progress.current}`
                }
              }

              return (
                <div
                  key={userId}
                  className="flex items-center gap-2 text-sm"
                  title={`${user.name}: ${status}`}
                >
                  <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                  <span className="text-xs truncate max-w-[120px]">{user.name}</span>
                  {status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {status === 'in-progress' && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">{progressText}</span>
                    </div>
                  )}
                  {status === 'not-started' && (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Achievement Type */}
        {achievement.type && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {achievement.type}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
