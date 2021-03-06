const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

//@desc     Get reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:id/reviews
//@access   Public
const getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.id) {
        const reviews = await Review.find({ bootcamp: req.params.id });

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

//@desc     Add Review
//@route    POST /api/v1/bootcamps/:id/reviews
//@access   Private
const addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.id;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) return next(new ErrorResponse(`No bootcamp with the id of ${req.params.id}`, 404));

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    })
});

//@desc     Update Review
//@route    PUT /api/v1/reviews/:id
//@access   Private
const updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review.`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators: true
    })

    res.status(201).json({
        success: true,
        data: review
    })
});

//@desc     Delete Review
//@route    PUT /api/v1/reviews/:id
//@access   Private
const deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this review.`, 401));
    }

    await review.remove();

    res.status(201).json({
        success: true,
        data: {}
    })
});

module.exports = {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
};
