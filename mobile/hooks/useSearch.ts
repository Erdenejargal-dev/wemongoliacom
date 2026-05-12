import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiList, SearchResult } from '@/types/api';

export function useSearch(q: string, type?: string) {
  return useQuery<ApiList<SearchResult>>({
    queryKey: ['search', q, type],
    queryFn: () =>
      api.get('/search', { params: { q, type, limit: 20 } }).then((r) => r.data),
    enabled: q.trim().length > 1,
  });
}
