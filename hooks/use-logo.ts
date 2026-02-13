import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { LogoFetcher, LogoResult } from '@/services/logo-fetcher';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

export function useLogo(serviceName: string | undefined) {
  return useQuery<LogoResult | null>({
    queryKey: ['logo', serviceName],
    queryFn: async () => {
      if (!serviceName) return null;
      return await LogoFetcher.fetchLogo(serviceName);
    },
    enabled: !!serviceName,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 2,
    retryDelay: 300,
    refetchOnMount: false, // Don't refetch on every mount - logos don't change often
    refetchOnWindowFocus: false,
  });
}
