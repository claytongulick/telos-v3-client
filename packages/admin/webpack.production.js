/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
let merge = require('webpack-merge');
let common = require('./webpack.config');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map'
})