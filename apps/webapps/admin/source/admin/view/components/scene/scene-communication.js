/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import ComponentBase from '../../../../shared/view/components/component-base-vanilla';
import broker from 'databroker';

import ComponentCommunicationView from '../app/communication/component-communication-view';
import ComponentCommunicationHistory from '../app/communication/component-communication-history';

class SceneCommunication extends ComponentBase {
    constructor() {
        super();
        this.communication = {
            communication_template: '',
            communication_type: '',
            fields: {},
            to: [],
        }

        //manually instantiate the components for the subroutes
        //this is so we can assign props and interact with them directly at the top level
        this.componentCommunicationView = new ComponentCommunicationView();
        this.componentCommunicationHistory = new ComponentCommunicationHistory();
    }

    get communication_id() {
        return this._communication_id;
    }

    /**
     * This is the id of the communication being loaded. The Router should set this automatically from the URL param
     */
    set communication_id(value) {
        this._communication_id = value;
    }

    connectedCallback() {
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = '<slot></slot>';
        this.template = (communication) => html`
        <style>
                :host {
                    justify-content: flex-start !important;
                    position: relative;
                    background-color: #f0f0f0;
                }
                #scene_communication_content {
                    --padding-top: 1vh;
                    --padding-bottom: 1vh;
                    --padding-start: 1vw;
                    --padding-end: 1vw;
                }
        </style>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title id="title">Communication id: ${communication._id} </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content id="scene_communication_content">
            <ion-tabs id="communication_tabs" style="background-color: var(--ion-color-light)">
                <ion-tab tab="tab-view" .component=${this.componentCommunicationView}>
                </ion-tab>

                <ion-tab tab="tab-history" .component=${this.componentCommunicationHistory}>
                    <!--<ion-nav></ion-nav>-->
                </ion-tab>
                <ion-tab-bar slot="bottom">
                    <ion-tab-button tab="tab-view">
                        <ion-icon name="information-circle"></ion-icon>
                        <ion-label>Communication</ion-label>
                    </ion-tab-button>

                    <ion-tab-button disabled=${communication.status == 'created'} tab="tab-history">
                        <ion-icon name="clock"></ion-icon>
                        <ion-label>History</ion-label>
                    </ion-tab-button>
                </ion-tab-bar>
            </ion-tabs>
        </ion-content>
        `;

        this.render();
        this.init();

    }

    render() {
        render(this.template(this.communication), this);
    }

    async init() {
        await this.loadCommunication();

    }

    async loadCommunication() {
        this.communication = await broker.get(`/api/communications/${this.communication_id}`);
        this.render();
        this.updateComponents(); //we do this manually because we're managing the lifecycle of these components manually
    }

    /**
     * Update sub components data
     */
    updateComponents() {
        this.componentCommunicationView.communication = this.communication;
        this.componentCommunicationHistory.communication = this.communication;
    }

}

customElements.define('scene-communication', SceneCommunication);
export default SceneCommunication;