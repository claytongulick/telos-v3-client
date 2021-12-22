/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';

class ComponentInvitationHistory extends HTMLElement {
    constructor() {
        super();
    }

    get invitation() {
        return this._invitation;
    }

    set invitation(value) {
        this._invitation = value;
        this.render();
    }

    connectedCallback() {
        this.template = (data) => html`
        <ion-content>
            <ion-item-list>
                ${this.invitation.status_history.map(
                    history => html`
                    <ion-item>
                        <ion-label>
                            <h4><b>Status date: </b> ${new Date(history.date).toLocaleString()}</h4>
                            <h4><b>Old status: </b> ${history.old_status}</h4>
                            <h4><b>New status: </b> ${history.new_status}</h4>
                            <h5><b>Update user: </b> <a href="#/users/${history.user}">${history.username}</a></h5>
                        </ion-label>
                    </ion-item>
                    `
                )}
            </ion-item-list>
        </ion-content>
        `;

        this.render();
        this.init();
    }

    render() {
        if(this.template) {
            render(this.template(), this);
        }

    }

    init() {

    }

}

customElements.define('app-invitation-history', ComponentInvitationHistory);
export default ComponentInvitationHistory;