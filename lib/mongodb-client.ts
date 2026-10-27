// MongoDB client promise for NextAuth adapter
// This file exports a promise (not the connection itself) as required by @auth/mongodb-adapter

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? ''
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  // In demo mode or build analysis, MONGODB_URI is absent.
  // We return a rejected promise so any attempted runtime usage fails cleanly
  // rather than crashing top-level module evaluation during `next build`.
  const missingError = new Error(
    'MONGODB_URI environment variable is not set. ' +
    'Set it in .env.local or set DEMO_MODE=true to run without a database.'
  )
  clientPromise = Promise.reject(missingError)
  // Prevent unhandled promise rejection warnings in environments where adapter is not invoked
  clientPromise.catch(() => {})
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
