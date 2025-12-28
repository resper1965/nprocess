import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface User {
  user_id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'user' | 'viewer' | 'auditor' | 'finops_manager'
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
  last_login_at?: string
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await adminApi.get('/v1/admin/users')
      return response.data as User[]
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string; role: string }) => {
      const response = await adminApi.post('/v1/admin/users', data)
      return response.data as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const response = await adminApi.patch(`/v1/admin/users/${userId}`, data)
      return response.data as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string) => {
      await adminApi.delete(`/v1/admin/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

