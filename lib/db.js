import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log(`[${new Date().toISOString()}] MongoDB already connected`);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`[${new Date().toISOString()}] MongoDB connected successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MongoDB connection error: ${error.message}`);
    throw error;
  }
}
