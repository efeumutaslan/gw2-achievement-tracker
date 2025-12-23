import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { AchievementCard } from './AchievementCard'
import type { Achievement } from '@/services/db/schema'

interface AchievementListProps {
  achievements: Achievement[]
  selectedUserIds: string[]
}

export function AchievementList({ achievements, selectedUserIds }: AchievementListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtual scrolling for performance with 7000+ achievements
  const virtualizer = useVirtualizer({
    count: achievements.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Estimated height of each achievement card
    overscan: 5, // Render 5 extra items above/below viewport
  })

  if (achievements.length === 0) {
    return null
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto rounded-lg border bg-card"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const achievement = achievements[virtualItem.index]
          return (
            <div
              key={achievement.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <AchievementCard
                achievement={achievement}
                selectedUserIds={selectedUserIds}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
