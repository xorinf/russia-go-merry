// Import Mongoose to interact with MongoDB
import mongoose from 'mongoose';

// Async function to handle the database connection
const connectDB = async () => {
  try {
    // Connect using the URI from environment variables with a 5-second timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    // Log a success message with the connected host name
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    // Log the error message if the connection fails
    console.error(`MongoDB connection error: ${error.message}`);
    
    // Exit the Node.js process with a failure code (1) to prevent the app from running without a DB
    process.exit(1); 
  }
};

// Export the function to be called in your main server file (e.g., server.js or index.js)
export default connectDB;
