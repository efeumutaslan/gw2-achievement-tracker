import { useMasteryStore } from '@/stores/masteryStore'
import { useUserStore } from '@/stores/userStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Lock } from 'lucide-react'
import type { Mastery } from '@/services/db/schema'

interface MasteryTreeProps {
  masteries: Mastery[]
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

export function MasteryTree({ masteries, selectedUserIds }: MasteryTreeProps) {
  const getUserProgress = useMasteryStore((state) => state.getUserProgress)
  const users = useUserStore((state) => state.users)

  // Sort masteries by order
  const sortedMasteries = [...masteries].sort((a, b) => a.order - b.order)

  if (sortedMasteries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No masteries found in this region.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sortedMasteries.map((mastery) => {
        return (
          <Card key={mastery.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6">
              {/* Mastery Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">{mastery.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{mastery.requirement}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {mastery.region}
                    </Badge>
                  </div>
                </div>

                {/* User Progress Summary */}
                <div className="flex flex-col gap-1 min-w-fit">
                  {selectedUserIds.map((userId, idx) => {
                    const user = users.find((u) => u.id === userId)
                    const progress = getUserProgress(userId, mastery.id)

                    if (!user) return null

                    const colorClass = USER_COLORS[idx % USER_COLORS.length]
                    const isUnlocked = !!progress

                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-2 text-sm"
                        title={`${user.name}: ${isUnlocked ? 'Unlocked' : 'Locked'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                        <span className="text-xs truncate max-w-[120px]">{user.name}</span>
                        {isUnlocked ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mastery Levels */}
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Mastery Levels:</h4>
                <div className="grid grid-cols-1 gap-3">
                  {mastery.levels.map((level, levelIdx) => (
                    <div
                      key={levelIdx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      {/* Level Icon */}
                      {level.icon && (
                        <img
                          src={level.icon}
                          alt={level.name}
                          className="w-12 h-12 rounded"
                          loading="lazy"
                        />
                      )}

                      {/* Level Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Level {levelIdx + 1}
                          </Badge>
                          <h5 className="font-medium text-sm">{level.name}</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {level.description}
                        </p>
                        {level.instruction && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {level.instruction}
                          </p>
                        )}

                        {/* Costs */}
                        <div className="flex items-center gap-3 mt-2">
                          {level.pointCost > 0 && (
                            <span className="text-xs">
                              <span className="font-medium">Points:</span> {level.pointCost}
                            </span>
                          )}
                          {level.expCost > 0 && (
                            <span className="text-xs">
                              <span className="font-medium">XP:</span>{' '}
                              {level.expCost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* User Progress for this Level */}
                      <div className="flex flex-col gap-1">
                        {selectedUserIds.map((userId, idx) => {
                          const user = users.find((u) => u.id === userId)
                          const progress = getUserProgress(userId, mastery.id)

                          if (!user) return null

                          const colorClass = USER_COLORS[idx % USER_COLORS.length]
                          // Check if user has unlocked this level
                          // Since GW2 API only provides unlocked status, not individual level progress
                          // We assume if mastery is unlocked, level 1 is unlocked
                          const isLevelUnlocked = progress && progress.level >= levelIdx + 1

                          return (
                            <div
                              key={userId}
                              className="flex items-center gap-1"
                              title={`${user.name}: Level ${levelIdx + 1} ${isLevelUnlocked ? 'Unlocked' : 'Locked'}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
                              {isLevelUnlocked ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
