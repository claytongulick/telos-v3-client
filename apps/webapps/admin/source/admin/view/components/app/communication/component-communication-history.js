/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import ComponentBase from '../../../../../shared/view/components/component-base-vanilla';

class ComponentCommunicationHistory extends ComponentBase {
    constructor() {
        super();
    }

    connectedCallback() {
        this.template = (data) => html`
        `;

        this.render();
        this.init();
    }

    render() {

    }

    init() {

    }

}

customElements.define('app-communication-history', ComponentCommunicationHistory);
export default ComponentCommunicationHistory;