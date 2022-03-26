const advancedResults = (model, populate) => async (req, res, next) => {
    const reqQuery = { ...req.query };

    let query;

    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((field) => delete reqQuery[field]);

    const queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => '$' + match);
    query = model.find(JSON.parse(queryStr));

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
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    const results = await query;

    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.advancedResults = {
        success: true,
        count: advancedResults.length,
        pagination,
        data: results
    };

    next();
};

module.exports = advancedResults;
