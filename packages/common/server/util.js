/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
/**
 * Wrap an express route function so that it works with promises asymc/await.
 * When an exception is raised in the promise, the next arg is called with the error (.catch(args[2])) 
 * The purpose of this is so that raised exceptions in async functions are automatically forwarded to next
 * instead of having to do try/catch for each one
 * @param {*} fn 
 */
function wrap(fn) {
    return (req, res, next) => {
        fn(req, res, next)
            .catch(
                (err) => {
                    console.error(`${err.code} ${err.message} ${err.stack}`);
                    return next(err);
                }
            );
        }
}

module.exports = {
    wrap: wrap
}