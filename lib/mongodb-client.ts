// MongoDB client promise for NextAuth adapter
// This file exports a promise (not the connection itself) as required by @auth/mongodb-adapter

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? ''
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  // Return a dummy promise in demo mode — the adapter won't be used
  clientPromise = Promise.resolve(null as unknown as MongoClient)
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
