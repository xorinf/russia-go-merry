// Import Mongoose to interact with MongoDB
import mongoose from 'mongoose';

// Cache connection in serverless environment
let cachedConnection = null;

// Async function to handle the database connection
const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing');
  }

  try {
    // Connect using the URI from environment variables with a 5-second timeout
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    // Log a success message with the connected host name
    console.log(`MongoDB Connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    // Log the error message if the connection fails
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

// Export the function to be called in your main server file (e.g., server.js or index.js)
export default connectDB;
