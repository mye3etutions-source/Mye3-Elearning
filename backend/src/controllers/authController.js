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
    const { name, email, password, role, board, className } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Student',
      board,
      className,
    });

    if (user) {
      const deviceToken = crypto.randomBytes(16).toString('hex');
      user.currentDeviceToken = deviceToken;
      await user.save();

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
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
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

module.exports = { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile };
