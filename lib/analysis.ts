import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import AudienceAnalysis from '@/models/AudienceAnalysis'

/** Latest completed audience analysis for a user, or null if none (or no database). */
export async function getLatestAnalysis(userId?: string) {
  // Users who signed in before MONGODB_URI was set have a non-ObjectId id
  if (!userId || !mongoose.isValidObjectId(userId) || !(await connectDB())) return null
  return AudienceAnalysis.findOne({ userId, status: 'completed' }).sort({ createdAt: -1 }).lean()
}
