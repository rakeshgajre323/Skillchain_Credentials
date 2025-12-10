import mongoose from 'mongoose';

/**
 * Connects to the MongoDB Database.
 * NOTE: Ensure MONGO_URI is defined in your backend/.env file
 */
const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGO_URI;

    if (!connString) {
      console.warn("⚠️ MONGO_URI is not defined in environment variables. DB features will fail.");
      return;
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