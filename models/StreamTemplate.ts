import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IStreamTemplate extends Document {
  userId: mongoose.Types.ObjectId
  channelId?: string
  name: string
  title: string
  description: string
  category?: string
  language: string
  privacyStatus: 'public' | 'private' | 'unlisted'
  tags: string[]
  isDefault: boolean
  isDemo: boolean
  createdAt: Date
  updatedAt: Date
}

const StreamTemplateSchema = new Schema<IStreamTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channelId: { type: String, index: true },
    name: { type: String, required: true, maxlength: 100 },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    category: { type: String },
    language: { type: String, default: 'en' },
    privacyStatus: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },
    tags: [{ type: String, maxlength: 50 }],
    isDefault: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
)

StreamTemplateSchema.index({ userId: 1, isDefault: 1 })

const StreamTemplate: Model<IStreamTemplate> =
  mongoose.models.StreamTemplate ??
  mongoose.model<IStreamTemplate>('StreamTemplate', StreamTemplateSchema)

export default StreamTemplate
