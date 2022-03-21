const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
const getBootcamps = asyncHandler(async (req, res, next) => {
    const reqQuery = { ...req.query };

    let query;

    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((field) => delete reqQuery[field]);

    const queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => '$' + match);
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    if (req.query.select) {
        const selectedFields = req.query.select.split(',').join(' ');
        query = query.select(selectedFields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const bootcamps = await query;

    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
});

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public
const getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private
const createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Update bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
const updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
const deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));

    bootcamp.remove();

    res.status(200).json({ success: true, data: {} });
});

//@desc     Get bootcamps by radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Public
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const [loc] = await geocoder.geocode(zipcode);
    const latitude = loc.latitude;
    const longitude = loc.longitude;

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
    });

    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

module.exports = {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius
}
