const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@desc     Get all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public
const getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

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
    });
});

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
    });
});

//@desc     Update course
//@route    PUT /api/v1/courses/:id
//@access   Private
const updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!course) next(new ErrorResponse(`No course found with the id of ${req.params.id}`), 404);

    res.status(200).json({
        success: true,
        data: course
    });
});

//@desc     Delete course
//@route    DELETE /api/v1/courses/:id
//@access   Private
const deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));

    course.remove();

    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
};
