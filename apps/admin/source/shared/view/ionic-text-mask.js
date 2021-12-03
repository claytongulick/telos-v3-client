/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import textMask from 'vanilla-text-mask';

function createMask(options) {
    let original_input = options.inputElement;
    let proxy = new Proxy(original_input, {
        get(target, key) {
            console.log("accessed: " + key);
            switch(key) {
                case 'addEventListener':
                    return original_input.addEventListener.bind(original_input);
                case 'selectionEnd':
                    return original_input['selectionEnd'];
                default:
                    return target[key];
            }
        },

        set(target, key, value) {
            target[key] = value;
            return true;
        }

    });
    options.inputElement = proxy;
    return textMask(options);
}

export default createMask;