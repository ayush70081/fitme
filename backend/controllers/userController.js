const User = require('../models/User');

/**
 * Update user profile
 * @route PUT /api/user/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    // Debug logging
    console.log('Profile update request:', {
      userId,
      hasUserId: !!userId,
      updateDataKeys: Object.keys(updateData),
      updateData
    });

    // Remove sensitive fields that shouldn't be updated here
    delete updateData.password;
    delete updateData.email;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Check if username is being updated and if it's available
    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    console.log('Attempting to update user with data:', updateData);

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...updateData,
        profileCompleted: true // Mark profile as completed after update
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Profile updated successfully for user:', updatedUser._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Profile update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        value: err.value,
        kind: err.kind,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already taken`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Profile update failed. Please try again.'
    });
  }
};

/**
 * Delete user account
 * @route DELETE /api/user/account
 * @access Private
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    // Find user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password before deletion
    if (password) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Account deletion failed. Please try again.'
    });
  }
};

/**
 * Get user statistics
 * @route GET /api/user/stats
 * @access Private
 */
const getUserStats = async (req, res) => {
  try {
    const user = req.user;

    // Calculate BMI if height and weight are available
    let bmi = null;
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100;
      bmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr = null;
    if (user.height && user.weight && user.age && user.gender) {
      if (user.gender === 'male') {
        bmr = Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5);
      } else if (user.gender === 'female') {
        bmr = Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age - 161);
      }
    }

    // TDEE calculation simplified without activity level
    let tdee = bmr ? Math.round(bmr * 1.2) : null;

    // Calculate account age
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          accountAge: accountAge,
          profileCompleteness: user.isProfileComplete() ? 100 : 60,
          bmi: bmi ? parseFloat(bmi) : null,
          bmr: bmr,
          tdee: tdee,
          age: user.age,
          fitnessGoalsCount: user.fitnessGoals ? user.fitnessGoals.length : 0,
          totalWorkouts: user.totalWorkouts || 0,
          caloriesBurned: user.caloriesBurned || 0,
          avgWorkout: user.avgWorkout || 0,
          longestStreak: user.longestStreak || 0,
          currentStreak: user.currentStreak || 0,
          achievements: user.achievements || 0
        }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

/**
 * Update user email
 * @route PUT /api/user/email
 * @access Private
 */
const updateEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { newEmail, password } = req.body;

    // Find user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ 
      email: newEmail,
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    // Update email
    user.email = newEmail;
    user.isEmailVerified = false; // Reset email verification status
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email updated successfully',
      data: {
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Email update error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Email update failed. Please try again.'
    });
  }
};

/**
 * Get user preferences
 * @route GET /api/user/preferences
 * @access Private
 */
const getPreferences = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        preferences: {
          fitnessGoals: user.fitnessGoals,
          profileCompleted: user.profileCompleted
        }
      }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences'
    });
  }
};

/**
 * Update user profile photo
 * @route PUT /api/user/profile-photo
 * @access Private
 */
const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    const { profilePhoto } = req.body;

    console.log('Profile photo update request for user:', userId);

    if (!profilePhoto) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo data is required'
      });
    }

    // Validate data URI format
    const dataUriRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!dataUriRegex.test(profilePhoto)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please use JPEG, PNG, GIF, or WebP'
      });
    }

    // Check file size
    const base64Data = profilePhoto.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image data'
      });
    }

    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (sizeInBytes > maxSizeInBytes) {
      return res.status(400).json({
        success: false,
        message: `Image must be under ${maxSizeInMB}MB. Current size: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Update user profile photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Profile photo updated successfully for user:', updatedUser._id);

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: { 
        user: updatedUser,
        photoSize: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
      }
    });

  } catch (error) {
    console.error('Profile photo update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile photo data',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Profile photo update failed. Please try again.'
    });
  }
};

/**
 * Delete user profile photo
 * @route DELETE /api/user/profile-photo
 * @access Private
 */
const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('Profile photo delete request for user:', userId);

    // Remove profile photo from user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { profilePhoto: 1 } },
      { 
        new: true,
        runValidators: false // Skip validation when removing field
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Profile photo deleted successfully for user:', updatedUser._id);

    res.status(200).json({
      success: true,
      message: 'Profile photo deleted successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Profile photo delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile photo deletion failed. Please try again.'
    });
  }
};

module.exports = {
  updateProfile,
  deleteAccount,
  getUserStats,
  updateEmail,
  getPreferences,
  updateProfilePhoto,
  deleteProfilePhoto
}; 