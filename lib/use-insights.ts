'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LiveInsights } from '@/app/api/audience/insights/route'

export async function apiCall<T>(input: string, init?: RequestInit): Promise<T> {
  const json = await (await fetch(input, init)).json()
  if (!json.success) throw new Error(json.error ?? 'Request failed')
  return json.data
}

/** Latest saved audience analysis (null until the first sync). Live mode only. */
export function useInsights(enabled = true) {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => apiCall<LiveInsights | null>('/api/audience/insights'),
    enabled,
  })
}

/** Fetch new comments, analyze them, then refresh the insights. */
export function useAnalyzeComments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiCall<{ message: string }>('/api/channel/sync', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insights'] }),
  })
}
