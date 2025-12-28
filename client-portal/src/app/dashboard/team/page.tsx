'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { Users, UserPlus, Mail, Shield, Trash2, Loader2 } from 'lucide-react'
import { useUsers, useDeleteUser } from '@/hooks/use-users'
import { toast } from 'sonner'

export default function TeamPage() {
  const { data: users, isLoading } = useUsers()
  const deleteUser = useDeleteUser()

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${userName}?`)) return
    
    try {
      await deleteUser.mutateAsync(userId)
      toast.success('Usuário removido com sucesso')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover usuário')
    }
  }

  return (
    <>
      <PageHeader 
        title="Team" 
        description="Manage your team members and their permissions"
      >
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </PageHeader>
      <div className="p-6 lg:p-8 space-y-8">

      {/* Team Usage */}
      <Card className="glass">
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <div className="space-y-4">
        {users?.map((member) => (
          <Card key={member.user_id} className="glass">
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
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {member.role !== 'super_admin' && member.role !== 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(member.user_id, member.name)}
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
      </div>
    </>
  )
}
