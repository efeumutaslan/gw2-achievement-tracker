import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Map } from '@/services/db/schema'

interface MapCardProps {
  map: Map
  selectedUserIds: string[]
}

export function MapCard({ map }: MapCardProps) {
  return (
    <Card className="m-2 hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Map Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">{map.name}</h3>
              <Badge variant="outline" className="text-xs">
                Lv {map.minLevel}-{map.maxLevel}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Type */}
              <Badge variant="secondary" className="text-xs">
                {map.type}
              </Badge>

              {/* Region */}
              {map.regionName && (
                <Badge variant="outline" className="text-xs">
                  {map.regionName}
                </Badge>
              )}

              {/* Continent */}
              {map.continentName && (
                <Badge variant="outline" className="text-xs">
                  {map.continentName}
                </Badge>
              )}

              {/* Floors */}
              {map.floors.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {map.floors.length} floors
                </span>
              )}
            </div>
          </div>

          {/* Map ID */}
          <div className="text-xs text-muted-foreground">
            ID: {map.id}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
