import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}

// for db disconnection
mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected')
})

// for errors
mongoose.connection.on('error', err => {
  console.log("Failed to connect to the database", err)
})

// for connection
mongoose.connection.on('connected', () => {
  console.log('Database connected successfully')
})

export default dbConnect

