/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {directive} from 'lit-html';

const phone = (value) => directive((part) => {
    if(!value)
        return;
    function normalizePhoneNumber(phone_number) {
        //validate first (US only)
        if(!/^1?[\-\. ]?\(?(\d{3})\)?[\-\. ]?\d{3}[\-\. ]?\d{4}$/.test(phone_number)) return false;
        //remove prefix 1
        if(phone_number[0]==1) phone_number = phone_number.slice(1);
        //remove any characters except for the digits
        var normalized_phone_number = phone_number.replace(/\D/g,'');
        //currently returns format: 8885550000
        return normalized_phone_number;
    }
    function formatPhoneNumber(s) {
        var s2 = ("" + s).replace(/\D/g, '');
        var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
        return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    }
    let normalized = normalizePhoneNumber(value);
    let formatted = formatPhoneNumber(normalized);
    part.setValue(formatted);
});

const date = (value) => directive((part) => {
    if(!value)
        return;
    if(typeof value === 'string')
        value = new Date(value);
    part.setValue(value.toLocaleDateString());
});

const title = (value) => directive((part) => {
    if(!value)
        return;
    let title_case = value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    part.setValue(title_case);
});

const urlencode = (value) => directive((part) => {
    if(!value)
        return;
    let encoded = encodeURI(value);
    part.setValue(encoded);

});


export {
    phone,
    date,
    title,
    urlencode
}