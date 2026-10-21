import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  description: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    description: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

ActivityLogSchema.index({ userId: 1, createdAt: -1 })
// Auto-expire logs after 90 days
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ??
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog
