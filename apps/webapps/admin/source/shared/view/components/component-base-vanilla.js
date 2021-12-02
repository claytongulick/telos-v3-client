/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 * Base component from which all other components inherit
 */
class ComponentBaseVanilla extends HTMLElement {

    constructor() {
        super();

        //create a promise that resolves when the component is visible
        this._visible_promise = new Promise(
            (resolve, reject) => {
                let observer = new IntersectionObserver((entries) => {
                    if (entries[0].intersectionRatio) {
                        resolve();
                    } 
                }, {
                        root: document.body
                    });
                observer.observe(this);
            }
        );
        //create a promise that resolves when the component is not visible
        this._visible_promise = new Promise(
            (resolve, reject) => {
                let observer = new IntersectionObserver((entries) => {
                    if (!(entries[0].intersectionRatio)) {
                        resolve();
                    } 
                }, {
                        root: document.body
                    });
                observer.observe(this);
            }
        );
    }

    get ready() {
        this._app = document.querySelector('ion-app');
        return this._app.componentOnReady();
    }

    get visible() {
        return this._visible_promise;
    }

    //can't use 'hidden' as it conflicts with ionic hidden. sigh.
    get not_visible() {
        return this._hidden_promise;
    }

    /**
     * Traverse the DOM, visiting each node recursively and executing callback
     * @param node
     * @param callback
     */
    walkDOM(node, callback) {
        callback(node);
        node = node.firstChild;
        while (node) {
            this.walkDOM(node, callback);
            node = node.nextSibling;
        }
    }

    /**
     * Utility function to grab object references to objects in the shadow and light DOM.
     * This is to save effort needing to manually write this.shadow.getElementById over and over to get references
     */
    collectComponentReferences(dom) {
        let elements = {};
        

        this.walkDOM(dom,
            element => {
                if(element.id) {
                    elements[element.id] = element;
                }
            });

        return elements;

    }

}


export default ComponentBaseVanilla;
