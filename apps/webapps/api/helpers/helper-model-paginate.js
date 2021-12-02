/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
/**
 * @module helpers/model_paginate
 */

/**
 * Paginate a mongoose model based on params
 * @param q The query to paginate
 * @param pageNumber The page number to retrieve
 * @param resultsPerPage The number of results per page
 * @param options A set of options for how to project the query
 * @param callback Callback to execute when query is complete
 */
function paginate(options, callback) { //q, pageNumber, resultsPerPage, callback, options) {
    options = options || {};
    var q = options.q || {};
    var page = options.page || 1;
    var page_size = (options.page_size ? parseInt(options.page_size) : 100);
    var fields = options.fields || null;
    var populate = options.populate || null;
    var sort = options.sort || null;
    var skip = ((page - 1) * page_size);
    var model = this;
    var query = model.find(q);

    if (fields !== null) {
        query = query.select(options.fields);
    }

    if (populate !== null) {
        query.populate(populate);
    }


    query = query.skip(skip).limit(page_size);
    if (sort !== null) {
        query.sort(sort);
    }

    if(!callback) {
        return query;
    }

    query.exec(
        function (err, data) {
            callback(err, data);
        }
    );
}

/**
 * Parse paginations options from a request. Returned options object will be ready for consumption
 * by the paginate mongoose schema plugin
 * 
 * NOTE: Express has deprecated the req.param() method of getting at things. We need to decide
 * if we are supporting this with anything besides GET requests.
 * @param req
 */
function optionsFromRequest(req) {
    var q = req.param('q') || '{}';
    var fields, sort;
    if(req.query.fields)
        fields = JSON.parse(req.param('fields'));
     if(req.query.sort)
        sort= JSON.parse(req.param('sort'));


    return {
        q: JSON.parse(q),
        page: req.query.page,
        page_size:  req.query.page_size,
        fields: fields,
        populate: req.query.populate,
        sort: sort
    }
}

module.exports = {
    plugin: function(schema) {
        schema.statics.paginate = paginate;
    },
    optionsFromRequest: optionsFromRequest
}