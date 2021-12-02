/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const {Transform} = require('stream');
const jsonpointer = require('jsonpointer');


class CSVExport {
    static export(cursor, pointers, res) {
        let header_written = false;
        if(!pointers)
            throw new Error("Missing export spec for: " + model);
        let transformer = new Transform(
            {
                objectMode: true,
                transform(chunk, encoding, callback) {
                    try {
                        let object = chunk.toObject ? chunk.toObject({minimize: false, flattenMaps: true}) : chunk;
                        let row = '';
                        if(!header_written) {
                            row = `"${pointers.map(pointer => pointer.substring(1)).join('","')}"\n`;
                            this.push(row);
                            header_written = true;
                        }
                        row = `${pointers.map(pointer => CSVExport.transformValue(jsonpointer.get(object, pointer))).join(',')}\n`;
                        this.push(row);
                        callback();
                    }
                    catch(err) {
                        callback(err);
                    }
                }
            }
        );
        cursor.pipe(transformer).pipe(res);
    }

    static transformValue(value) {
        let type = typeof value;

        switch(type) {
            case 'string':
                return `"${value.replace(/"/g,'""')}"`;
            case 'object':
                return `"${JSON.stringify(value).replace(/"/g,'""')}"`
            case 'null':
                return '';
            case 'undefined':
                return '';
            default:
                return value
        }


    }
}

module.exports = CSVExport;