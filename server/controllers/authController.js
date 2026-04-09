// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('express-async-handler');

// Helper to generate access & refresh tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'access_secret', {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });

  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

  return { accessToken, refreshToken };
};

// Helper to send token response attached to cookies
const sendTokenResponse = async (user, statusCode, res, message) => {
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Cookie options
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

  // Remove password and refreshToken from response
  user.password = undefined;
  user.refreshToken = undefined;

  return apiResponse(res, statusCode, true, { user }, message);
};

/**
 * @desc    Register a user
 * @route   POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res, next) => {
  console.log(`[AUTH] Register attempt for email: ${req.body.email}`);
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return apiResponse(res, 400, false, null, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  return sendTokenResponse(user, 201, res, 'Registration successful');
});

/**
 * @desc    Login user
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return apiResponse(res, 400, false, null, 'Please provide an email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return apiResponse(res, 401, false, null, 'Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return apiResponse(res, 401, false, null, 'Invalid credentials');
  }

  return sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Get current logged in user
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  return apiResponse(res, 200, true, { user }, 'User details retrieved successfully');
});

/**
 * @desc    Logout user
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  return apiResponse(res, 200, true, {}, 'User logged out successfully');
});

/**
 * @desc    Refresh access token
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return apiResponse(res, 401, false, null, 'Not authorized, session missing.');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return apiResponse(res, 401, false, null, 'Invalid or expired session');
    }

    return sendTokenResponse(user, 200, res, 'Token refreshed successfully');
  } catch (err) {
    return apiResponse(res, 401, false, null, 'Session refresh failed', err.message);
  }
});
