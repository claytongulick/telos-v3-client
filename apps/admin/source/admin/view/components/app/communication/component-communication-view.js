/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import ComponentBase from '../../../../../shared/view/components/component-base-vanilla';

class ComponentCommunicationView extends ComponentBase {
    constructor() {
        super();
        this._communication = {
            to: [],
            status: ''
        }
    }

    set communication(value) {
        this._communication = value;
        this.render();
    }

    get communication() {
        return this._communication;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.template = (communication) => html`
            <style>
                @media only screen and (min-width: 600px) {
                    :host {
                        margin: 4vw;
                    }
                }
                ion-select .button-effect {
                    display: none !important;
                }
            </style>
            <ion-content force-overscroll="false">
            <ion-item-group lines="inset">
                <ion-item-divider>
                    <ion-label>Communication Information</ion-label>
                    ${this.getStatusChip(communication.status)}
                </ion-item-divider>
                <ion-item>
                    <ion-label>Created on:</ion-label> ${new Date(communication.created_date).toLocaleString()}
                </ion-item>
                <ion-item>
                    <ion-label>Type:</ion-label> ${communication.communication_type}
                </ion-item>
                <ion-item>
                    <ion-label>Template:</ion-label> ${communication.communication_template}
                </ion-item>
                <ion-item>
                    <ion-label>Notes:</ion-label> ${communication.notes}
                </ion-item>
            </ion-item-group>
            <ion-item-group lines="inset">
                <ion-item-divider>
                    <ion-label>Fields</ion-label>
                </ion-item-divider>
                ${this.renderFields(communication)}
            <ion-item-group lines="inset">
                <ion-item-divider>
                    <ion-label>Recipients</ion-label>
                </ion-item-divider>
                <ion-grid>
                    <ion-row>
                    ${communication.to.map( (to_item) => html`
                        <ion-col size="12" size-sm="12" size-md="6" size-lg="6">
                            <app-card-user .user=${to_item.reference}></app-card-user>
                        </ion-col>
                    `)}
                    </ion-row>
                </ion-grid>
            </ion-item-group>
            </ion-content>
        `;

        this.render();
        this.init()

    }

    render() {
        if(!this.template)
            return;
        render(this.template(this.communication), this.shadowRoot);
    }

    renderFields(communication) {
        let keys = Object.keys(communication.fields);
        return keys.map(
            (key) => html`
                <ion-item>
                    ${communication.status == 'created' ?
                        html`
                        <ion-label position="floating">${key}</ion-label>
                        <ion-input .value=${communication.fields[key]} @change=${(e) => this.patch('/fields/' + key,e.target.value)}></ion-input>
                        `
                    :
                    html`<ion-label>${key}:</ion-label>${communication.fields[key]}`
                    }
                </ion-item>
            `)
    }

    getStatusChip(status) {
        switch(status) {
            case "complete":
                return html`<ion-chip slot="end"><ion-icon color="success" name='checkmark'></ion-icon><ion-label>Complete</ion-label></ion-chip>`;
            case "pending":
                return html`<ion-chip slot="end"><ion-icon color="secondary" name='code-working'></ion-icon><ion-label>Pending</ion-label></ion-chip>`;
            case "created":
                return html`<ion-chip slot="end"><ion-icon color="tertiary" name='code'></ion-icon><ion-label>Created</ion-label></ion-chip>`;
            case "error":
                return html`<ion-chip slot="end"><ion-icon color="danger" name='close-circle'></ion-icon><ion-label>Error</ion-label></ion-chip>`;
        }
    }

    async init() {
        //await this.load();
    }

    async load() {
    }

}

customElements.define('app-communication-view', ComponentCommunicationView);
export default ComponentCommunicationView;