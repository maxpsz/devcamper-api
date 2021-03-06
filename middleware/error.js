const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    console.log(err);

    if (err.name === 'CastError') {
        const message = typeof(err.value) === 'string'
            ? `Resource not found with the id of ${err.value}`
            : 'Resource not found';
            
        error = new ErrorResponse(message, 404);
    }

    if (err.code === 11000) {
        const message = `Duplicated field value`;
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
