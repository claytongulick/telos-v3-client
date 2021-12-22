/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';

class ComponentUserActivity extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.template = (data) => html`
        `;

        this.render();
        this.init()

    }

    render() {
        render(this.template(this.data), this);
    }

    init() {

    }

}

customElements.define('app-user-activity', ComponentUserActivity);
export default ComponentUserActivity;