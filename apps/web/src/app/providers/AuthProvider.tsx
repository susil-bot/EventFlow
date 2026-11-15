import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo
} from 'react';
import { authApi } from '@/shared/api/endpoints';
import type { SignupRole, User } from '@/shared/api/types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    role: SignupRole;
  }) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const SESSION_QUERY_KEY = ['session'] as const;

/** Resolves the current session once; `null` means signed out. */
const fetchSession = (): Promise<User | null> => authApi.session();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: Infinity,
    retry: false
  });

  const setSession = useCallback(
    (user: User | null) => {
      // Drop cached data from any previous session before switching users.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0]
      });
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
    },
    [queryClient]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await authApi.login({ email, password });
      setSession(user);
      return user;
    },
    [setSession]
  );

  const signup = useCallback<AuthContextValue['signup']>(
    async (input) => {
      const user = await authApi.signup(input);
      setSession(user);
      return user;
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setSession(null);
  }, [setSession]);

  const value = useMemo(
    () => ({ user: data ?? null, isLoading, login, signup, logout }),
    [data, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
};
