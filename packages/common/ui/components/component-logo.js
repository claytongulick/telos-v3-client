/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, svg, render} from 'lit/html.js';

class ComponentLogo extends HTMLElement {

    constructor() {
        super();
        this.color="white";
    }

    get logo_mode() {
        return this._logo_mode;
    }

    set logo_mode(value) {
        this._logo_mode = value;
        this.render();
    }

    connectedCallback() {
        this.template = () => html`
            <img src="./assets/logo-white.png" style="height:35px;">
            
        `;

        this.render();
    }

    render() {
        render(this.template(), this);
    }


}

customElements.define('app-logo', ComponentLogo);
export default ComponentLogo;