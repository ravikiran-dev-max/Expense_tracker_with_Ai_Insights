import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Connects to MongoDB database using Mongoose.
 * Automatically resolves Windows DNS lookup issues for Atlas connection strings.
 */
const connectDB = async () => {
  try {
    // Read Mongo URI from environment variables or fall back to local MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense-tracker';

    // Node.js on Windows sometimes fails to resolve mongodb+srv URIs because dns.getServers()
    // only returns local DNS settings. We explicitly override the lookup servers if an Atlas string is used.
    if (mongoUri.startsWith('mongodb+srv://')) {
      const servers = dns.getServers();
      if (servers.length === 0 || (servers.length === 1 && servers[0] === '127.0.0.1')) {
        dns.setServers(['8.8.8.8', '1.1.1.1']); // Set fallback public DNS servers (Google / Cloudflare)
      }
    }

    // Connect to database
    const conn = await mongoose.connect(mongoUri);
    console.log("DataBase Connected");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure code if connection fails
  }
};

export default connectDB;
