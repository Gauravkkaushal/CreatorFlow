import mongoose, { Schema, Document, Model } from 'mongoose'

export type ContentStatus = 'idea' | 'draft' | 'approved' | 'scheduled' | 'published'
export type ContentType = 'video' | 'livestream' | 'short'

export interface IContentIdea extends Document {
  userId: mongoose.Types.ObjectId
  channelId?: string
  title: string
  description?: string
  contentType: ContentType
  status: ContentStatus
  titleSuggestions: string[]
  outline: string[]
  draftDescription?: string
  keywords: string[]
  tags: string[]
  sourceTopicName?: string
  sourceAnalysisId?: mongoose.Types.ObjectId
  sourceCommentIds: string[]
  scheduledDate?: Date
  publishedUrl?: string
  notes?: string
  isDemo: boolean
  createdAt: Date
  updatedAt: Date
}

const ContentIdeaSchema = new Schema<IContentIdea>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channelId: { type: String, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    contentType: {
      type: String,
      enum: ['video', 'livestream', 'short'],
      default: 'video',
    },
    status: {
      type: String,
      enum: ['idea', 'draft', 'approved', 'scheduled', 'published'],
      default: 'idea',
      index: true,
    },
    titleSuggestions: [{ type: String }],
    outline: [{ type: String }],
    draftDescription: { type: String },
    keywords: [{ type: String }],
    tags: [{ type: String }],
    sourceTopicName: { type: String },
    sourceAnalysisId: { type: Schema.Types.ObjectId, ref: 'AudienceAnalysis' },
    sourceCommentIds: [{ type: String }],
    scheduledDate: { type: Date },
    publishedUrl: { type: String },
    notes: { type: String },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
)

ContentIdeaSchema.index({ userId: 1, status: 1, createdAt: -1 })
ContentIdeaSchema.index({ userId: 1, contentType: 1 })

const ContentIdea: Model<IContentIdea> =
  mongoose.models.ContentIdea ??
  mongoose.model<IContentIdea>('ContentIdea', ContentIdeaSchema)

export default ContentIdea
