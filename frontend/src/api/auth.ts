/**
 * Authentication API hooks using TanStack Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// Types
export interface SetupRequest {
  family_name: string;
  timezone: string;
  admin_display_name: string;
  admin_password: string;
}

export interface LoginRequest {
  display_name: string;
  password: string;
}

export interface PinLoginRequest {
  user_id: string;
  pin: string;
}

export interface User {
  id: string;
  display_name: string;
  role: 'admin' | 'co_admin' | 'teen' | 'child' | 'guest';
  color_hex: string;
  ui_mode: 'standard' | 'child' | 'kiosk';
  avatar_type: string;
  avatar_value: string;
  family_id: string;
}

export interface PublicUser {
  id: string;
  display_name: string;
  avatar_type: string;
  avatar_value: string;
  color_hex: string;
}

export interface SetupStatusResponse {
  setup_complete: boolean;
}

// Query hooks
export const useSetupStatus = () => {
  return useQuery<SetupStatusResponse>({
    queryKey: ['setup-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/auth/setup/status');
      return data;
    },
  });
};

export const useMe = () => {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/auth/me');
      return data;
    },
    retry: false,
  });
};

export const usePublicUsers = () => {
  return useQuery<PublicUser[]>({
    queryKey: ['public-users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/users/public');
      return data;
    },
  });
};

// Mutation hooks
export const useSetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, SetupRequest>({
    mutationFn: async (setupData) => {
      const { data } = await apiClient.post('/api/auth/setup', setupData);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user);
      queryClient.invalidateQueries({ queryKey: ['setup-status'] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post('/api/auth/login', credentials);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user);
    },
  });
};

export const usePinLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, PinLoginRequest>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post('/api/auth/login/pin', credentials);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error>({
    mutationFn: async () => {
      await apiClient.post('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
    },
  });
};
