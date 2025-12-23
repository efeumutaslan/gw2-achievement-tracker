import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Achievements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Track achievement progress across all users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Achievement tracking will be implemented in the next phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will display all GW2 achievements with multi-user progress tracking,
            filtering, and comparison features.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
