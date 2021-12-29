/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';


class ComponentInvitationView extends HTMLElement {
    constructor() {
        super();
        this._invitation = {
            to: [],
            status: ''
        }
    }

    set invitation(value) {
        this._invitation = value;
        this.render();
    }

    get invitation() {
        return this._invitation;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.template = (invitation) => html`
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
                        <ion-label>Invitation Information</ion-label>
                        <span style="margin-left: 20px"></span>${this.getStatusChip(invitation.status)}
                    </ion-item-divider>
                    <ion-item>
                        <ion-label>User:</ion-label> 
                        ${invitation.user ?
                        html`
                            <a href='#/users/${invitation.user}'>${invitation.user}</a>
                        `
                        : ''
                        } 
                    </ion-item>
                    <ion-item>
                        <ion-label>Created on:</ion-label> ${new Date(invitation.created_date).toLocaleString()}
                    </ion-item>
                    <ion-item>
                        <ion-label>Status:</ion-label> ${invitation.status}
                    </ion-item>
                    <ion-item>
                        <ion-label>Status date:</ion-label> ${new Date(invitation.status_date).toLocaleDateString()}
                    </ion-item>
                    <ion-item>
                        <ion-label>Account:</ion-label> ${invitation.client_id}
                    </ion-item>
                    <ion-item>
                        <ion-label>Name:</ion-label> ${invitation.first_name} ${invitation.last_name}
                    </ion-item>
                    <ion-item>
                        <ion-label>Email:</ion-label> ${invitation.email_address}
                    </ion-item>
                    <ion-item>
                        <ion-label>Phone cell:</ion-label> ${invitation.phone_cell}
                    </ion-item>
                    <ion-item>
                        <ion-label>Created by:</ion-label> ${invitation.created_by ?
                            html`
                            <a href="#/users/${invitation.created_by.id}">
                            ${invitation.created_by.first_name} ${invitation.created_by.last_name}
                            </a>
                            `:''
                        }
                    </ion-item>
                </ion-item-group>
            </ion-content>
        `;

        this.render();
        this.init()

    }

    render() {
        if(!this.template)
            return;
        render(this.template(this.invitation), this.shadowRoot);
    }

    renderFields(invitation) {
        let keys = Object.keys(invitation.fields);
        return keys.map(
            (key) => html`
                <ion-item>
                    ${invitation.status == 'created' ?
                        html`
                        <ion-label position="floating">${key}</ion-label>
                        <ion-input .value=${invitation.fields[key]} @change=${(e) => this.patch('/fields/' + key,e.target.value)}></ion-input>
                        `
                    :
                    html`<ion-label>${key}:</ion-label>${invitation.fields[key]}`
                    }
                </ion-item>
            `)
    }

    getStatusChip(status) {
        switch(status) {
            case "created":
                return html`<ion-chip><ion-icon color="success" name='checkmark'></ion-icon><ion-label>Created</ion-label></ion-chip>`;
            case "invited":
                return html`<ion-chip><ion-icon color="secondary" name='code-working'></ion-icon><ion-label>Invited</ion-label></ion-chip>`;
            case "accepted":
                return html`<ion-chip><ion-icon color="tertiary" name='code'></ion-icon><ion-label>Accepted</ion-label></ion-chip>`;
            case "cancelled":
                return html`<ion-chip><ion-icon color="danger" name='close-circle'></ion-icon><ion-label>Cancelled</ion-label></ion-chip>`;
            case "expired":
                return html`<ion-chip><ion-icon color="danger" name='close-circle'></ion-icon><ion-label>Expired</ion-label></ion-chip>`;
        }
    }

    async init() {
        //await this.load();
    }

    async load() {
    }

}

customElements.define('app-invitation-view', ComponentInvitationView);
export default ComponentInvitationView;