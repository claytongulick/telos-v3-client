/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import {Broker} from 'databroker';

import ComponentInvitationView from '../app/invitation/component-invitation-view';
import ComponentInvitationHistory from '../app/invitation/component-invitation-history';

class SceneInvitation extends HTMLElement {
    constructor() {
        super();
        this.broker = new Broker();
        this.invitation = {
            invitation_template: '',
            invitation_type: '',
            fields: {},
            to: [],
        }

        //manually instantiate the components for the subroutes
        //this is so we can assign props and interact with them directly at the top level
        this.componentInvitationView = new ComponentInvitationView();
        this.componentInvitationHistory = new ComponentInvitationHistory();
    }

    get invitation_id() {
        return this._invitation_id;
    }

    /**
     * This is the id of the invitation being loaded. The Router should set this automatically from the URL param
     */
    set invitation_id(value) {
        this._invitation_id = value;
    }

    connectedCallback() {
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = '<slot></slot>';
        this.template = (invitation) => html`
        <style>
                :host {
                    justify-content: flex-start !important;
                    position: relative;
                    background-color: #f0f0f0;
                }
                #scene_invitation_content {
                    --padding-top: 1vh;
                    --padding-bottom: 1vh;
                    --padding-start: 1vw;
                    --padding-end: 1vw;
                }
        </style>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/invitations"></ion-back-button>
                </ion-buttons>
                <ion-title id="title">Invitation: ${invitation.first_name} ${invitation.last_name} </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content id="scene_invitation_content">
            <ion-tabs id="invitation_tabs" style="background-color: var(--ion-color-light)">
                <ion-tab tab="tab-view" .component=${this.componentInvitationView}>
                </ion-tab>

                <ion-tab tab="tab-history" .component=${this.componentInvitationHistory}>
                    <!--<ion-nav></ion-nav>-->
                </ion-tab>
                <ion-tab-bar slot="bottom">
                    <ion-tab-button tab="tab-view">
                        <ion-icon name="information-circle"></ion-icon>
                        <ion-label>Invitation</ion-label>
                    </ion-tab-button>

                    <ion-tab-button disabled=${invitation.status == 'created'} tab="tab-history">
                        <ion-icon name="time-outline"></ion-icon>
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
        render(this.template(this.invitation), this);
    }

    async init() {
        await this.loadInvitation();

    }

    async loadInvitation() {
        this.invitation = await this.broker.get(`/api/invitations/id/${this.invitation_id}`);
        this.render();
        this.updateComponents(); //we do this manually because we're managing the lifecycle of these components manually
    }

    /**
     * Update sub components data
     */
    updateComponents() {
        this.componentInvitationView.invitation = this.invitation;
        this.componentInvitationHistory.invitation = this.invitation;
    }

}

customElements.define('scene-invitation', SceneInvitation);
export default SceneInvitation;