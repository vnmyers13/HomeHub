/**
 * Users API hooks using TanStack Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { User } from './auth';

export interface CreateUserRequest {
  display_name: string;
  role: 'admin' | 'co_admin' | 'teen' | 'child' | 'guest';
  color_hex?: string;
  ui_mode?: 'standard' | 'child' | 'kiosk';
  avatar_type?: string;
  avatar_value?: string;
  pin?: string;
  password?: string;
}

export interface UpdateUserRequest {
  display_name?: string;
  role?: 'admin' | 'co_admin' | 'teen' | 'child' | 'guest';
  color_hex?: string;
  ui_mode?: 'standard' | 'child' | 'kiosk';
  avatar_type?: string;
  avatar_value?: string;
  pin?: string;
  password?: string;
}

// Query hooks
export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/users');
      return data;
    },
  });
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, CreateUserRequest>({
    mutationFn: async (userData) => {
      const { data } = await apiClient.post('/api/users', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['public-users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, { id: string; data: UpdateUserRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['public-users'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await apiClient.delete(`/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['public-users'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ url: string }, Error, { userId: string; file: File }>({
    mutationFn: async ({ userId, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post(`/api/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['public-users'] });
    },
  });
};
