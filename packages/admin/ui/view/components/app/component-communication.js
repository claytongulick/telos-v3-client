/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import ComponentBase from '../../../../shared/view/components/component-base';

class ComponentCommunication extends ComponentBase {
    constructor() {
        super();
        this.user = null;
        this.communication_type = 'sms';
        this.template = null;
    }

    static get properties() {
        return ['user', 'communication_type', 'template']
    }

    render() {
        return html`
        
        `;
    }

    firstUpdated() {

    }
}

customElements.define('app-communication', ComponentCommunication);
export default ComponentCommunication;