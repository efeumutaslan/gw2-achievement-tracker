import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export function Settings() {
  const { users, addUser, removeUser, isLoading, error, setError } = useUserStore()

  const [newUserName, setNewUserName] = useState('')
  const [newUserApiKey, setNewUserApiKey] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserName.trim() || !newUserApiKey.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await addUser(newUserName.trim(), newUserApiKey.trim())
      // Success - clear form
      setNewUserName('')
      setNewUserApiKey('')
    } catch (err) {
      // Error is already set in the store
      console.error('Failed to add user:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (confirm('Are you sure you want to remove this user? All associated data will be deleted.')) {
      try {
        await removeUser(userId)
      } catch (err) {
        console.error('Failed to remove user:', err)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage API keys and user accounts
        </p>
      </div>

      {/* Add User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
          <CardDescription>
            Add a new GW2 account by providing an API key. Maximum 10 users allowed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Efe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  disabled={isAdding || users.length >= 10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX"
                  value={newUserApiKey}
                  onChange={(e) => setNewUserApiKey(e.target.value)}
                  disabled={isAdding || users.length >= 10}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isAdding || users.length >= 10}>
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add User
                  </>
                )}
              </Button>

              {users.length >= 10 && (
                <span className="text-sm text-muted-foreground">
                  Maximum users (10) reached
                </span>
              )}
            </div>
          </form>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">How to get your API key:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://account.arena.net/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://account.arena.net/applications</a></li>
              <li>Click "New Key"</li>
              <li>Give it a name and select the required permissions (account, progression, characters)</li>
              <li>Copy the generated API key and paste it above</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length}/10)</CardTitle>
          <CardDescription>
            Manage your configured GW2 accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users added yet. Add your first user above to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      {user.accountName && (
                        <Badge variant="secondary">
                          {user.accountName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {user.permissions && user.permissions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {user.permissions.length} permissions
                        </span>
                      )}
                      {user.createdAt && (
                        <span>
                          Added {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Privacy:</strong> Your API keys are stored locally in your browser's IndexedDB.
            They are never sent to any external server.
          </p>
          <p>
            <strong>Security:</strong> Do not use this application on shared computers.
            API keys are stored in plain text in your browser.
          </p>
          <p>
            <strong>Permissions:</strong> Your API key needs at least the following permissions:
            account, progression, characters.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
