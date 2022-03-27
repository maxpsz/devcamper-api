const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

const { JWT_SECRET } = process.env;

const protect = asyncHandler(async (req, res, next) => {
    let token;

    const authorization = req.headers.authorization;

    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1];
    }

    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    if (!token) return next(new ErrorResponse('Not authorized to access this route', 401));

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

module.exports = {
    protect
};
