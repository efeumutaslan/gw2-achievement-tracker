import { useState } from 'react'
import { useAchievementStore } from '@/stores/achievementStore'
import { useUserStore } from '@/stores/userStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react'
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const getUserProgress = useAchievementStore((state) => state.getUserProgress)
  const users = useUserStore((state) => state.users)

  return (
    <>
      <Card className="m-2 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <CardContent className="p-4">
          {/* Main Achievement Info - Clickable */}
          <div className="flex items-start justify-between gap-4">
          {/* Achievement Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-lg truncate flex-1">{achievement.name}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {achievement.description}
            </p>

            {/* Requirement */}
            {achievement.requirement && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Requirement:</span> {achievement.requirement}
              </p>
            )}

            {/* Tiers Summary */}
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

            {/* Achievement Type */}
            {achievement.type && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {achievement.type}
                </Badge>
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
        </CardContent>
      </Card>

      {/* Achievement Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{achievement.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
              {achievement.requirement && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Requirement:</span> {achievement.requirement}
                </p>
              )}
            </div>

            {/* Achievement Type */}
            {achievement.type && (
              <div>
                <Badge variant="secondary" className="text-xs">
                  {achievement.type}
                </Badge>
              </div>
            )}

            {/* Details Content */}
            <div className="space-y-3">
            {/* Tier Details */}
            {achievement.tiers && achievement.tiers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Tier Progress:</h4>
                {achievement.tiers.map((tier, tierIdx) => (
                  <div key={tierIdx} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Tier {tierIdx + 1}
                        </Badge>
                        <span className="text-sm">
                          {tier.count} completions = {tier.points} AP
                        </span>
                      </div>
                    </div>

                    {/* User progress for this tier */}
                    <div className="space-y-1 mt-2">
                      {selectedUserIds.map((userId, idx) => {
                        const user = users.find((u) => u.id === userId)
                        const progress = getUserProgress(userId, achievement.id)

                        if (!user) return null

                        const colorClass = USER_COLORS[idx % USER_COLORS.length]

                        // Check if user completed this tier
                        const currentProgress = progress?.current || 0
                        const tierCompleted = currentProgress >= tier.count

                        return (
                          <div
                            key={userId}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                              <span className="truncate max-w-[120px]">{user.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {currentProgress}/{tier.count}
                              </span>
                              {tierCompleted ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Circle className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rewards */}
            {achievement.rewards && achievement.rewards.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Rewards:</h4>
                <div className="flex flex-wrap gap-1">
                  {achievement.rewards.map((reward, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {reward.type}
                      {reward.count && ` x${reward.count}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {achievement.prerequisites && achievement.prerequisites.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Prerequisites:</h4>
                <p className="text-xs text-muted-foreground">
                  Requires {achievement.prerequisites.length} other achievement(s)
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  )
}
