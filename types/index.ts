// Core TypeScript types for CreatorFlow AI

export interface User {
  _id: string
  email: string
  name: string
  image?: string
  googleId: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface ConnectedChannel {
  _id: string
  userId: string
  channelId: string
  channelTitle: string
  channelDescription?: string
  thumbnailUrl?: string
  subscriberCount?: number
  videoCount?: number
  accessToken?: string // encrypted
  refreshToken?: string // encrypted
  tokenExpiresAt?: Date
  scopes: string[]
  status: 'active' | 'expired' | 'revoked' | 'error'
  connectedAt: Date
  updatedAt: Date
}

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  privacyStatus: 'public' | 'private' | 'unlisted'
  viewCount?: number
  likeCount?: number
  commentCount?: number
  tags?: string[]
  categoryId?: string
  duration?: string
}

export interface YouTubeComment {
  id: string
  videoId: string
  text: string
  authorName: string
  authorChannelId?: string
  likeCount: number
  publishedAt: string
  updatedAt?: string
}

export interface AudienceTopic {
  _id: string
  analysisId: string
  name: string
  summary: string
  commentCount: number
  representativeComments: string[]
  commonQuestions: string[]
  painPoints: string[]
  suggestedIdeas: string[]
  priorityScore: number
  scoreExplanation: string
  commentIds: string[]
  createdAt: Date
}

export interface AudienceAnalysis {
  _id: string
  userId: string
  channelId: string
  videoId?: string
  videoTitle?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  commentsAnalyzed: number
  topics: AudienceTopic[]
  error?: string
  startedAt: Date
  completedAt?: Date
  createdAt: Date
}

export type ContentStatus = 'idea' | 'draft' | 'approved' | 'scheduled' | 'published'
export type ContentType = 'video' | 'livestream' | 'short'

export interface ContentIdea {
  _id: string
  userId: string
  channelId?: string
  title: string
  description?: string
  contentType: ContentType
  status: ContentStatus
  titleSuggestions: string[]
  outline?: string[]
  draftDescription?: string
  keywords?: string[]
  tags?: string[]
  sourceTopicId?: string
  sourceAnalysisId?: string
  sourceCommentIds?: string[]
  scheduledDate?: Date
  publishedUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface StreamTemplate {
  _id: string
  userId: string
  channelId?: string
  name: string
  title: string
  description: string
  category?: string
  language?: string
  privacyStatus: 'public' | 'private' | 'unlisted'
  tags?: string[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledBroadcast {
  _id: string
  userId: string
  channelId: string
  templateId?: string
  contentIdeaId?: string
  title: string
  description: string
  scheduledStartTime: Date
  timezone: string
  privacyStatus: 'public' | 'private' | 'unlisted'
  category?: string
  youtubebroadcastId?: string
  youtubeStreamId?: string
  youtubeBoundStreamId?: string
  status: 'local' | 'scheduled' | 'live' | 'complete' | 'cancelled' | 'error'
  agenda?: string[]
  isDemo: boolean
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface CalendarEvent {
  _id: string
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  timezone: string
  type: ContentType
  status: ContentStatus
  contentIdeaId?: string
  broadcastId?: string
  color?: string
  isDemo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  _id: string
  userId: string
  action: string
  description: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// AI Output types
export interface AITopicOutput {
  name: string
  summary: string
  commentCount: number
  representativeComments: string[]
  commonQuestions: string[]
  painPoints: string[]
  suggestedIdeas: string[]
  priorityScore: number
  scoreExplanation: string
}

export interface AIContentIdeaOutput {
  title: string
  titleSuggestions: string[]
  outline: string[]
  description: string
  keywords: string[]
  tags: string[]
  contentType: ContentType
}

export interface AILivestreamAgendaOutput {
  title: string
  sections: {
    title: string
    duration: number
    notes: string
  }[]
  totalDuration: number
  suggestedQuestions: string[]
}

// Dashboard types
export interface DashboardStats {
  totalCommentsAnalyzed: number
  totalTopicsIdentified: number
  savedContentIdeas: number
  upcomingLivestreams: number
  connectedChannels: number
  isDemo: boolean
}
