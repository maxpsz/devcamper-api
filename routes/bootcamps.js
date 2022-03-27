const express = require('express');

const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');
const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const courseRouter = require('./courses');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(protect, deleteBootcamp);

module.exports = router;
