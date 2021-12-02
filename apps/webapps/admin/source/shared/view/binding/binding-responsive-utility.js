/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

class ResponsiveUtility {
    //cache the original device dimensions, this can be used to detect if virtual keyboard has been displayed,
    //or orientation difference, or resize
    static cacheDeviceDimensions() {
        console.log(`width: ${this.device_width} height: ${this.device_height}`);
        this.device_height = window.innerHeight;
        this.device_width = window.innerWidth;
        console.log(`width: ${this.device_width} height: ${this.device_height}`);
    }

    //size an element to the original device dimensions
    static sizeElementToDevice(element) {
        console.log(`setting width: ${this.device_width} height: ${this.device_height}`)
        element.style.width = this.device_width + "px";
        element.style.height = this.device_height + "px";
        console.log(`set to: ${element.style.width} ${element.style.height}`)
    }

    static getCurrentView() {
        //small - phones
        if(window.matchMedia('(max-width: 500px) and (orientation: portrait)').matches) {
            return this.VIEW_SMALL_PORTRAIT;
        }
        if(window.matchMedia('(max-width: 900px) and (orientation: landscape)').matches) {
            return this.VIEW_SMALL_LANDSCAPE;
        }

        //medium - tablets
        if(window.matchMedia('(min-device-width: 501px) and (max-device-width: 900px) and (orientation: portrait)').matches) {
            return this.VIEW_MEDIUM_PORTRAIT;
        }
        if(window.matchMedia('(min-device-width: 901px) and (max-device-width: 1400px) and (orientation: landscape)').matches) {
            return this.VIEW_MEDIUM_LANDSCAPE;
        }

        //large - desktops, ignore orientation, calculate based on ratio. There are laptops and monitors etc...
        if(window.matchMedia('(min-device-width: 1300px').matches) {
            if(window.innerWidth > window.innerHeight)
                return this.VIEW_LARGE_LANDSCAPE;
            return this.VIEW_LARGE_PORTRAIT
        }

        //we can't figure it out
        console.warn(`Unknown device viewport dimensions: width: ${window.innerWidth} height: ${window.innerHeight}`);
        return this.VIEW_UNKNOWN;

    }

    static isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    static addChangeListener(callback) {
        if(!this.listeners)
            this.listeners = [];
        this.listeners.push(callback);

        if(!this.handlers_added) {
            window.addEventListener('orientationchange', this.onOrientationChange.bind(this));
            window.addEventListener('resize', this.onResize.bind(this));
            this.handlers_added = true;
        }
    }

    static onOrientationChange(event) {
        this.listeners.forEach(
            listener => listener({ 
                change_type: 'orientation', 
                landscape: this.isLandscape(), 
                view: this.getCurrentView()
            })
        );
    }

    static onResize(event) {
        this.listeners.forEach(
            listener => listener({ 
                change_type: 'resize', 
                landscape: this.isLandscape(), 
                view: this.getCurrentView()
            })
        );
    }

    /**
     * Translate a string into the enum value. This is used by the AST parser
     * @param enum_string
     */
    static enumFromString(enum_string) {
        switch(enum_string) {
            case 'VIEW_UNKNOWN':
                return ResponsiveUtility.VIEW_UNKNOWN;
            case 'VIEW_SMALL_PORTRAIT':
                return ResponsiveUtility.VIEW_SMALL_PORTRAIT;
            case 'VIEW_SMALL_LANDSCAPE':
                return ResponsiveUtility.VIEW_SMALL_LANDSCAPE;
            case 'VIEW_MEDIUM_PORTRAIT':
                return ResponsiveUtility.VIEW_MEDIUM_PORTRAIT;
            case 'VIEW_MEDIUM_LANDSCAPE':
                return ResponsiveUtility.VIEW_SMALL_LANDSCAPE;
            case 'VIEW_LARGE_PORTRAIT':
                return ResponsiveUtility.VIEW_LARGE_PORTRAIT;
            case 'VIEW_LARGE_LANDSCAPE':
                return ResponsiveUtility.VIEW_LARGE_LANDSCAPE;
            default:
                return ResponsiveUtility.VIEW_UNKNOWN;

        }

    }
}

ResponsiveUtility.VIEW_UNKNOWN = 0;
ResponsiveUtility.VIEW_SMALL_PORTRAIT = 1;
ResponsiveUtility.VIEW_SMALL_LANDSCAPE = 2;
ResponsiveUtility.VIEW_MEDIUM_PORTRAIT = 4;
ResponsiveUtility.VIEW_MEDIUM_LANDSCAPE = 8;
ResponsiveUtility.VIEW_LARGE_PORTRAIT = 16;
ResponsiveUtility.VIEW_LARGE_LANDSCAPE = 32;

export default ResponsiveUtility;

