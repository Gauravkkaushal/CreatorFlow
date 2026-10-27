// MongoDB client promise for NextAuth adapter
// This file exports a promise (not the connection itself) as required by @auth/mongodb-adapter

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? ''
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  if (process.env.DEMO_MODE !== 'true') {
    // In non-demo mode, a missing URI is a fatal configuration error.
    throw new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Set it in .env.local or set DEMO_MODE=true to run without a database.'
    )
  }
  // In demo mode the MongoDBAdapter is never attached (see lib/auth.ts),
  // so this promise is never consumed. We reject it to make any accidental
  // usage fail loudly rather than with a confusing null-dereference.
  clientPromise = Promise.reject(
    new Error('MongoDB client not available in demo mode.')
  )
} else if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise!
} else {
  // In production, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
