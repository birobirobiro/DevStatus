'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, useEffect } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60 * 24, // 24 hours - logos don't change often
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
            retry: 2,
            retryDelay: 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  );

  // Expor queryClient globalmente para uso em hooks
  useEffect(() => {
    (window as any).queryClient = queryClient;
  }, [queryClient]);

  const [persister] = useState(() => 
    createSyncStoragePersister({
      storage: typeof window !== 'undefined' ? window.localStorage : null as any,
      key: 'devstatus-query-cache',
    })
  );

  // Prevent hydration mismatch by not rendering PersistQueryClientProvider on server
  if (!isClient) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
