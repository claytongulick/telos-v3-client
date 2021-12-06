/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 config.js

 This is the main configuration file. It provides a series of default configuration options that
 can be overridden based on the environment.

 @author Clay Gulick
 @email clay@ratiosoftware.com

**/

let path = require('path');
let fs = require('fs');

//grab the default config
let default_config = require('./default');
let env = process.env.NODE_ENV || 'local';

//determine the current environment and include the proper config file
//first check to see if a config file exists for the current NODE_ENV
let err = fs.accessSync(path.join(__dirname, `${env}.js`), fs.R_OK);
if(err) {
    console.error(`Error loading environment config for: ${env} ${err}`);
    throw err;
}

let config_path = path.join(__dirname, env);

//get the environment config
let environment_config = require(config_path);

//override defaults with the environment config
let config = Object.assign(default_config, environment_config);
config.env = env;

//override default webapp config with app specific configs
let app_names = Object.keys(config.webapps);
for(let app_name of app_names) {
    let app_config = config.webapps[app_name];
    app_config = Object.assign({}, config.webapp_default, app_config);
    //overwrite the app config with the full set of defaults
    config.webapps[app_name] = app_config;
}

module.exports = config;


