'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/lib/use-insights'
import type { ContentStatus, ContentType } from '@/types'

/** A saved content idea as returned by /api/ideas. */
export interface Idea {
  _id: string
  title: string
  contentType: ContentType
  status: ContentStatus
  description?: string
  outline: string[]
  keywords: string[]
  draftDescription?: string
  hook?: string
  cta?: string
  notes?: string
  sourceTopicName?: string
  scheduledDate?: string | null
  createdAt: string
}

export type IdeaInput = Partial<Omit<Idea, '_id' | 'createdAt'>> & { title: string }
export type IdeaUpdate = Partial<Omit<Idea, '_id' | 'createdAt'>> & { id: string }

const KEY = ['ideas']
const json = (body: unknown) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

/** All saved ideas. Live mode only. */
export function useIdeas(enabled = true) {
  return useQuery({ queryKey: KEY, queryFn: () => apiCall<Idea[]>('/api/ideas'), enabled })
}

export function useCreateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: IdeaInput) => apiCall<Idea>('/api/ideas', { method: 'POST', ...json(input) }),
    onSuccess: (idea) => queryClient.setQueryData<Idea[]>(KEY, (ideas = []) => [idea, ...ideas]),
  })
}

/** Updates apply to the UI immediately (drag and drop) and roll back if the save fails. */
export function useUpdateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (update: IdeaUpdate) => apiCall<Idea>('/api/ideas', { method: 'PATCH', ...json(update) }),
    onMutate: async ({ id, ...fields }) => {
      await queryClient.cancelQueries({ queryKey: KEY })
      const previous = queryClient.getQueryData<Idea[]>(KEY)
      queryClient.setQueryData<Idea[]>(KEY, (ideas = []) => ideas.map((idea) => (idea._id === id ? { ...idea, ...fields } : idea)))
      return { previous }
    },
    onError: (_err, _update, context) => queryClient.setQueryData(KEY, context?.previous),
    onSuccess: (idea) => queryClient.setQueryData<Idea[]>(KEY, (ideas = []) => ideas.map((i) => (i._id === idea._id ? idea : i))),
  })
}
