const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');

const generateToken = (userId, deviceToken) => {
  return jwt.sign({ userId, deviceToken }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        const deviceToken = crypto.randomBytes(16).toString('hex');
        user.currentDeviceToken = deviceToken;
        await user.save();

        const token = generateToken(user._id, deviceToken);

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
          board: user.board,
          className: user.className,
          payRates: user.payRates,
          token,
        });
      }
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, board, className, mobileNumber } = req.body;
    if (!email || !password || !mobileNumber) {
      return res.status(400).json({ message: 'Email, password and mobile number are required' });
    }
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      mobileNumber,
      password,
      role: role || 'Student',
      board,
      className,
    });

    if (user) {
      const deviceToken = crypto.randomBytes(16).toString('hex');
      user.currentDeviceToken = deviceToken;
      await user.save();

      // Create PersonalSession document if user board is 1-on-1
      if (board === '1-on-1') {
        const PersonalSession = require('../models/PersonalSession');
        const session = new PersonalSession({
          studentId: user._id,
          status: 'pending',
          paymentStatus: 'pending'
        });
        await session.save();
      }

      const token = generateToken(user._id, deviceToken);

      // Send Welcome Email asynchronously
      sendEmail({
        to: user.email,
        subject: 'Welcome to Mye3 e-Tuitions!',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #002147;">Welcome to Mye3 e-Tuitions, ${user.name}! 🎉</h2>
            <p>We are thrilled to have you join our learning community.</p>
            <p>You can now explore our courses, book classes, and start your journey with the best teachers.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Mye3 e-Tuitions Team</strong></p>
          </div>
        `
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        board: user.board,
        className: user.className,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    if (req.user) {
      req.user.currentDeviceToken = null;
      await req.user.save();
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        board: user.board,
        className: user.className,
        payRates: user.payRates,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
        board: updatedUser.board,
        className: updatedUser.className,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'https://mye3etuitions.com';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #002147;">Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #002147; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 10 minutes.</p>
        <br/>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best Regards,</p>
        <p><strong>Mye3 e-Tuitions Team</strong></p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.currentDeviceToken = null;

    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword };
