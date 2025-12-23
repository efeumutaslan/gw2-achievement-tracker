import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { MapCard } from './MapCard'
import type { Map } from '@/services/db/schema'

interface MapListProps {
  maps: Map[]
  selectedUserIds: string[]
}

export function MapList({ maps, selectedUserIds }: MapListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtual scrolling for performance with many maps
  const virtualizer = useVirtualizer({
    count: maps.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of each map card
    overscan: 5,
  })

  if (maps.length === 0) {
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
          const map = maps[virtualItem.index]
          return (
            <div
              key={map.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MapCard map={map} selectedUserIds={selectedUserIds} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
