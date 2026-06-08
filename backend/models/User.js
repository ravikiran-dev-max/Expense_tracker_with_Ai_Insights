import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Represents user account credentials and settings (budget limits, profile avatars).
 */
const userSchema = new mongoose.Schema(
  {
    // The username displayed in dashboard greeting panels
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    // The unique login email address (validated with regex)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },
    // Hashed password string (minlength 6 characters)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    // Profile avatar image URL (local file path or Cloudinary HTTPS link)
    avatar: {
      type: String,
      default: '',
    },
    // User-configured monthly expense budget limit in Indian Rupees (₹)
    monthlyBudget: {
      type: Number,
      default: 0, // 0 represents that no budget limit has been configured
    },
  },
  {
    // Automatically creates createdAt and updatedAt columns
    timestamps: true,
  }
);

// Mongoose Pre-Save Middleware: Automatically encrypt passwords before saving to MongoDB
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified (e.g. signup or password update)
  if (!this.isModified('password')) {
    return next();
  }
  
  // Generate bcrypt salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Custom Instance Method: Matches plaintext password with hashed database password
 * @param {string} enteredPassword - plaintext password candidate
 * @returns {Promise<boolean>} True if matched, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
