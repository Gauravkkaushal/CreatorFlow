import mongoose, { Schema, Document, Model } from 'mongoose'

const AudienceTopicSchema = new Schema({
  name: { type: String, required: true },
  summary: { type: String, required: true },
  commentCount: { type: Number, default: 0 },
  representativeComments: [{ type: String }],
  commonQuestions: [{ type: String }],
  painPoints: [{ type: String }],
  suggestedIdeas: [{ type: String }],
  priorityScore: { type: Number, min: 0, max: 100, default: 0 },
  scoreExplanation: { type: String },
  commentIds: [{ type: String }],
})

export interface IAudienceTopic {
  name: string
  summary: string
  commentCount: number
  representativeComments: string[]
  commonQuestions: string[]
  painPoints: string[]
  suggestedIdeas: string[]
  priorityScore: number
  scoreExplanation?: string
  commentIds: string[]
}

export interface IAudienceAnalysis extends Document {
  userId: mongoose.Types.ObjectId
  channelId: string
  videoId?: string
  videoTitle?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  commentsAnalyzed: number
  totalComments: number
  topics: IAudienceTopic[]
  error?: string
  startedAt?: Date
  completedAt?: Date
  isDemo: boolean
  createdAt: Date
  updatedAt: Date
}

const AudienceAnalysisSchema = new Schema<IAudienceAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channelId: { type: String, required: true, index: true },
    videoId: { type: String, index: true },
    videoTitle: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    commentsAnalyzed: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    topics: [AudienceTopicSchema],
    error: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
)

AudienceAnalysisSchema.index({ userId: 1, channelId: 1, createdAt: -1 })

const AudienceAnalysis: Model<IAudienceAnalysis> =
  mongoose.models.AudienceAnalysis ??
  mongoose.model<IAudienceAnalysis>('AudienceAnalysis', AudienceAnalysisSchema)

export default AudienceAnalysis
