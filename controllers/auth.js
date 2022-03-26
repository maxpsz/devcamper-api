const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const { NODE_ENV, JWT_COOKIE_EXPIRE } = process.env;

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await User.create({ name, email, password, role });

    sendTokenResponse(user, 200, res);
});

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user) return next(new ErrorResponse('Invalid credentials', 401));

    const isMatch = await user.matchPassword(password);

    if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

    sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        secure: NODE_ENV === 'production',
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
};

module.exports = {
    register,
    login
};
