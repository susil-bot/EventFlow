import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import React, {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext
} from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { LocationProvider } from '@/features/location/LocationProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';

type Options = RenderOptions & {
  route?: string;
  /** Pages visited before `route`, so Back has somewhere to go. */
  history?: string[];
  withAuth?: boolean;
  /** Prefill the query cache, e.g. with a signed-in session. */
  seed?: (client: QueryClient) => void;
};

/** Lets `rerender` swap the UI without recreating the router. */
const UiContext = createContext<ReactNode>(null);
const CurrentUi = () => <>{useContext(UiContext)}</>;

/**
 * Renders with a data router (like the app, so `useBlocker` works), query
 * client and toasts (and optionally auth).
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
    history = [],
    withAuth = false,
    seed,
    ...options
  }: Options = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  seed?.(queryClient);
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <ToastProvider>
            {withAuth ? (
              <AuthProvider>
                <LocationProvider>
                  <CurrentUi />
                </LocationProvider>
              </AuthProvider>
            ) : (
              <CurrentUi />
            )}
          </ToastProvider>
        )
      }
    ],
    { initialEntries: [...history, route] }
  );
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <UiContext.Provider value={children}>
        <RouterProvider router={router} />
      </UiContext.Provider>
    </QueryClientProvider>
  );
  return {
    queryClient,
    router,
    ...render(ui, { wrapper: Wrapper, ...options })
  };
};
