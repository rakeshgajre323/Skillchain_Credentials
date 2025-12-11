import mongoose from 'mongoose';

/**
 * Connects to the MongoDB Database.
 * NOTE: Ensure MONGO_URI is defined in your backend/.env file
 */
const connectDB = async (): Promise<void> => {
  try {
    // Fallback to local mongo instance if env var is missing
    const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillchain';

    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI not found in env. Attempting default local connection...");
    }

    const conn = await mongoose.connect(connString);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // We do NOT exit the process here. We log the error so the server can still start
    // and serve the /health endpoint for debugging.
    if (error instanceof Error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    } else {
      console.error('❌ Unknown database connection error');
    }
  }
};

export default connectDB;