/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import ComponentBase from '../../../../../shared/view/components/component-base-vanilla';

class ComponentUserHistory extends ComponentBase {
    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.template = (data) => html`
        `;

        this.render();
        this.init()

    }

    render() {
        render(this.template(this.data), this.shadowRoot);
    }

    init() {

    }

}

customElements.define('app-user-history', ComponentUserHistory);
export default ComponentUserHistory;