import jwt from 'jsonwebtoken';
import fs from 'fs';
import User from '../models/User.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

/**
 * Helper function to generate a JSON Web Token (JWT)
 * @param {string} id - The MongoDB User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  // Signs the user ID using the secret from environment variables (falls back to a default secret for local safety)
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwtsecret123', {
    expiresIn: '30d', // Token expires in 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate request body fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    // Check if user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user. Mongoose pre-save middleware will automatically hash the password.
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      // Respond with user details and a freshly minted JWT token
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          monthlyBudget: user.monthlyBudget,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Authenticate a user and return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Compare passwords using User schema method
    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          monthlyBudget: user.monthlyBudget,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user profile details
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by the authMiddleware protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          monthlyBudget: user.monthlyBudget,
        },
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile details (username, monthlyBudget)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update username if provided
      user.username = req.body.username || user.username;
      
      // Update budget if provided (check for undefined to support setting budget to 0)
      if (req.body.monthlyBudget !== undefined) {
        user.monthlyBudget = Number(req.body.monthlyBudget);
      }

      const updatedUser = await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          monthlyBudget: updatedUser.monthlyBudget,
        },
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user account password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old and new passwords' });
    }

    const user = await User.findById(req.user._id);

    // Verify current password and save the new password
    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword; // password will be hashed via Mongoose pre-save middleware
      await user.save();
      return res.json({ success: true, message: 'Password updated successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Upload user avatar image
 * @route   PUT /api/auth/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    // Verify file is attached (multer middleware processing check)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      // Clean up the uploaded local file if user is missing
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Default to saving avatar local path
    let avatarUrl = `/uploads/${req.file.filename}`;

    // If Cloudinary variables are configured, upload to Cloudinary and clean up disk
    if (isCloudinaryConfigured) {
      try {
        console.log('Cloudinary is enabled. Uploading local temp file to cloud...');
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'expense_tracker_avatars',
          transformation: [{ width: 150, height: 150, crop: 'thumb', gravity: 'face' }],
        });

        // Set avatarUrl to the secure URL returned by Cloudinary
        avatarUrl = result.secure_url;

        // Delete temporary file from local storage
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Failed to delete temporary local file:', err.message);
          } else {
            console.log('Temporary local upload file cleaned successfully.');
          }
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed. Falling back to local storage path:', cloudinaryError.message);
      }
    }

    // Update user avatar record in the database
    user.avatar = avatarUrl;
    await user.save();

    return res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    // Attempt local cleanup on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed cleanup of file on error:', e.message);
      }
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
};
