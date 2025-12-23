import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from 'lucide-react'
import type { Waypoint } from '@/services/api/maps'

interface WaypointSearchProps {
  waypoints: Waypoint[]
  selectedUserIds: string[]
}

export function WaypointSearch({ waypoints }: WaypointSearchProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtual scrolling for performance
  const virtualizer = useVirtualizer({
    count: waypoints.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  if (waypoints.length === 0) {
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
          const waypoint = waypoints[virtualItem.index]
          return (
            <div
              key={waypoint.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Card className="m-2 hover:bg-accent/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    {/* Waypoint Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{waypoint.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {waypoint.mapName}
                        </p>
                      </div>
                    </div>

                    {/* Coordinates & Map Info */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Map {waypoint.mapId}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        [{waypoint.coord[0].toFixed(0)}, {waypoint.coord[1].toFixed(0)}]
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
