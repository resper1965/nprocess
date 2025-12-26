'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Mail, Shield, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
}

export default function TeamPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/team')
        // const data = await response.json()
        // setTeamMembers(data)

        // For now, show current user only
        if (user) {
          setTeamMembers([
            {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: 'Owner',
              status: 'active',
              joinedAt: new Date().toISOString().split('T')[0],
            }
          ])
        }
      } catch (err) {
        console.error('Failed to load team members:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTeamMembers()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your team members and their permissions
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Team Usage */}
      <Card glass>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  3 / 3 Team Members
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Starter plan allows 3 team members
                </p>
              </div>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              Upgrade for more members
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <Card key={member.id} glass>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant="glass" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Joined {member.joinedAt}
                    </p>
                  </div>
                  {member.role !== 'Owner' && (
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
