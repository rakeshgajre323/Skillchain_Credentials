import mongoose from 'mongoose';

/**
 * Connects to the MongoDB Database.
 * NOTE: Ensure MONGO_URI is defined in your backend/.env file
 */
const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGO_URI;

    if (!connString) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(connString);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown database connection error');
    }
    (process as any).exit(1);
  }
};

export default connectDB;