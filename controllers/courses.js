const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@desc     Get all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public
const getCourses = asyncHandler(async (req, res, next) => {
    let query;

    query = req.params.bootcampId
        ? Course.find({ bootcamp: req.params.bootcampId })
        : Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})

//@desc     Get single course
//@route    GET /api/v1/courses/:courseId
//@access   Public
const getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404);

    res.status(200).json({
        success: true,
        data: course
    })
})

//@desc     Add course
//@route    POST /api/v1/bootcamps/:bootcampsId/courses
//@access   Private
const addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404);

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
})

module.exports = {
    getCourses,
    getCourse,
    addCourse
}