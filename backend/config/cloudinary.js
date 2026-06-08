import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded (primarily for standalone scripts/testing)
dotenv.config();

// Check if all necessary Cloudinary credentials are provided in environment variables
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  // Configure the Cloudinary instance
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary SDK configured successfully.');
} else {
  console.log('Cloudinary configurations missing. Defaulting to local storage for file uploads.');
}

export { cloudinary, isCloudinaryConfigured };
