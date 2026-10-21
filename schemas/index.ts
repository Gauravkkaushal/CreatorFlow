import { z } from 'zod'

// ============================================================
// AI Output Schemas (for validating LLM responses)
// ============================================================

export const AudienceTopicSchema = z.object({
  name: z.string().min(1).max(200),
  summary: z.string().min(1).max(1000),
  commentCount: z.number().int().min(0),
  representativeComments: z.array(z.string()).max(5),
  commonQuestions: z.array(z.string()).max(10),
  painPoints: z.array(z.string()).max(10),
  suggestedIdeas: z.array(z.string()).max(5),
  priorityScore: z.number().min(0).max(100),
  scoreExplanation: z.string().min(1).max(500),
})

export const AnalysisOutputSchema = z.object({
  topics: z.array(AudienceTopicSchema).max(20),
  totalCommentsAnalyzed: z.number().int().min(0),
  analysisNotes: z.string().optional(),
})

export const ContentIdeaAISchema = z.object({
  title: z.string().min(1).max(200),
  titleSuggestions: z.array(z.string().max(200)).min(1).max(5),
  outline: z.array(z.string()).min(1).max(20),
  description: z.string().min(1).max(5000),
  keywords: z.array(z.string()).max(20),
  tags: z.array(z.string()).max(15),
  contentType: z.enum(['video', 'livestream', 'short']),
})

export const ContentIdeasAISchema = z.object({
  ideas: z.array(ContentIdeaAISchema).min(1).max(10),
})

export const LivestreamAgendaAISchema = z.object({
  title: z.string().min(1).max(200),
  sections: z.array(
    z.object({
      title: z.string(),
      duration: z.number().int().min(1), // minutes
      notes: z.string(),
    })
  ).min(1).max(15),
  totalDuration: z.number().int().min(1),
  suggestedQuestions: z.array(z.string()).max(10),
})

// ============================================================
// API Request Schemas
// ============================================================

export const StartAnalysisSchema = z.object({
  channelId: z.string().min(1),
  videoId: z.string().optional(),
  maxComments: z.number().int().min(1).max(500).default(200),
})

export const CreateContentIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  contentType: z.enum(['video', 'livestream', 'short']).default('video'),
  description: z.string().max(1000).optional(),
  sourceTopicName: z.string().optional(),
  sourceAnalysisId: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateContentIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['idea', 'draft', 'approved', 'scheduled', 'published']).optional(),
  titleSuggestions: z.array(z.string().max(200)).optional(),
  outline: z.array(z.string()).optional(),
  draftDescription: z.string().max(5000).optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
})

export const CreateStreamTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().optional(),
  language: z.string().default('en'),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).default('public'),
  tags: z.array(z.string().max(50)).max(15).default([]),
  isDefault: z.boolean().default(false),
})

export const CreateBroadcastSchema = z.object({
  channelId: z.string().min(1),
  templateId: z.string().optional(),
  contentIdeaId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  scheduledStartTime: z.string().datetime(),
  timezone: z.string().default('UTC'),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).default('public'),
  category: z.string().optional(),
  agenda: z.array(z.string()).max(20).default([]),
})

export const UpdateVideoMetadataSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().max(500)).max(500).optional(),
  categoryId: z.string().optional(),
  privacyStatus: z.enum(['public', 'private', 'unlisted']).optional(),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type AudienceTopicOutput = z.infer<typeof AudienceTopicSchema>
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>
export type ContentIdeaAIOutput = z.infer<typeof ContentIdeaAISchema>
export type LivestreamAgendaOutput = z.infer<typeof LivestreamAgendaAISchema>
