// Self-hosted fonts (no third-party requests). See Design.Font in tokens.ts.
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/jost/600.css';
import '@fontsource/libre-caslon-display/400.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { App } from '@/app/App';
import { ApiError } from '@/shared/api/client';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { LocationProvider } from '@/features/location/LocationProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { GlobalStyle } from '@/shared/styles/GlobalStyle';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      // Retry network blips, not 4xx answers.
      retry: (count, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && count < 2
    }
  }
});

/**
 * A data router, so pages can hold a navigation (`useBlocker`) to protect
 * unsaved work. One splat route renders the app's own `<Routes>` (React
 * Router's documented incremental-migration setup); providers sit inside it
 * because they use router hooks.
 */
const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <App />
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    )
  }
]);

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <GlobalStyle />
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
