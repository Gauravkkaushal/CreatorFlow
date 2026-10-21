import mongoose, { Schema, Document, Model } from 'mongoose'

export type BroadcastStatus = 'local' | 'scheduled' | 'live' | 'complete' | 'cancelled' | 'error'

export interface IScheduledBroadcast extends Document {
  userId: mongoose.Types.ObjectId
  channelId: string
  templateId?: mongoose.Types.ObjectId
  contentIdeaId?: mongoose.Types.ObjectId
  title: string
  description: string
  scheduledStartTime: Date
  timezone: string
  privacyStatus: 'public' | 'private' | 'unlisted'
  category?: string
  youtubeBroadcastId?: string
  youtubeStreamId?: string
  youtubeBoundStreamId?: string
  status: BroadcastStatus
  agenda: string[]
  isDemo: boolean
  errorMessage?: string
  retryCount: number
  lastSyncedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ScheduledBroadcastSchema = new Schema<IScheduledBroadcast>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channelId: { type: String, required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'StreamTemplate' },
    contentIdeaId: { type: Schema.Types.ObjectId, ref: 'ContentIdea' },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    scheduledStartTime: { type: Date, required: true, index: true },
    timezone: { type: String, required: true, default: 'UTC' },
    privacyStatus: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },
    category: { type: String },
    youtubeBroadcastId: { type: String, sparse: true, index: true },
    youtubeStreamId: { type: String },
    youtubeBoundStreamId: { type: String },
    status: {
      type: String,
      enum: ['local', 'scheduled', 'live', 'complete', 'cancelled', 'error'],
      default: 'local',
      index: true,
    },
    agenda: [{ type: String }],
    isDemo: { type: Boolean, default: false },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
)

ScheduledBroadcastSchema.index({ userId: 1, status: 1, scheduledStartTime: 1 })
// Prevent duplicate YouTube broadcasts
ScheduledBroadcastSchema.index(
  { userId: 1, youtubeBroadcastId: 1 },
  { unique: true, sparse: true }
)

const ScheduledBroadcast: Model<IScheduledBroadcast> =
  mongoose.models.ScheduledBroadcast ??
  mongoose.model<IScheduledBroadcast>('ScheduledBroadcast', ScheduledBroadcastSchema)

export default ScheduledBroadcast
