import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IConnectedChannel extends Document {
  userId: mongoose.Types.ObjectId
  channelId: string
  channelTitle: string
  channelDescription?: string
  thumbnailUrl?: string
  subscriberCount?: number
  videoCount?: number
  // Tokens stored encrypted
  encryptedAccessToken?: string
  encryptedRefreshToken?: string
  tokenExpiresAt?: Date
  scopes: string[]
  status: 'active' | 'expired' | 'revoked' | 'error'
  connectedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ConnectedChannelSchema = new Schema<IConnectedChannel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channelId: { type: String, required: true, index: true },
    channelTitle: { type: String, required: true },
    channelDescription: { type: String },
    thumbnailUrl: { type: String },
    subscriberCount: { type: Number },
    videoCount: { type: Number },
    encryptedAccessToken: { type: String },
    encryptedRefreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    scopes: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked', 'error'],
      default: 'active',
    },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

ConnectedChannelSchema.index({ userId: 1, channelId: 1 }, { unique: true })

const ConnectedChannel: Model<IConnectedChannel> =
  mongoose.models.ConnectedChannel ??
  mongoose.model<IConnectedChannel>('ConnectedChannel', ConnectedChannelSchema)

export default ConnectedChannel
