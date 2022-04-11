const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

//@desc     Get reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@access   Public
const getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

//@desc     Get single Review
//@route    GET /api/v1/reviews/:id
//@access   Public
const getReview = asyncHandler(async (req, res, next) => {
    const review = await Review
        .findById(req.params.id)
        .populate({ path: 'bootcamp', select: 'name description' });
        
    if (!review) next(new ErrorResponse(`No review with the id of ${req.params.id}`), 404);

    res.status(200).json({
        success: true,
        data: review
    })
});

module.exports = {
    getReviews,
    getReview
};
