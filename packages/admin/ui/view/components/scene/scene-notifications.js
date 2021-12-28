/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import {unsafeHTML} from 'lit/directives/unsafe-html';
import {Broker} from 'databroker';

class SceneNotifications extends HTMLElement {

    constructor() {
        super();
        this.broker = new Broker();
        this.notifications = [];
    }

    connectedCallback() {
        this.template = (data) => html`
            <style>
                :host {
                    justify-content: flex-start !important;
                    position: relative;
                    background-color: #f0f0f0;
                }
                #content {
                    --padding-top: 1vh;
                    --padding-bottom: 1vh;
                    --padding-start: 1vw;
                    --padding-end: 1vw;
                    --background: var(--light);
                }
            </style>

            <ion-header>
                <ion-toolbar>
                    <ion-buttons slot="start">
                        <ion-menu-toggle>
                            <ion-button>
                                <ion-icon slot="icon-only" name="menu"></ion-icon>
                            </ion-button>
                        </ion-menu-toggle>
                    </ion-buttons>
                    <ion-title id="title">Notifications</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content id="content">
                <ion-grid>
                    <ion-row>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Created By</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                    ${this.notifications.map(
                        (notification) => 
                        html`
                            <tr @click=${(e) => {this.selectNotification(notification)}} style="cursor: pointer">
                                <td data-label="Date">${new Date(notification.created_date).toLocaleString()}</td>
                                ${notification.create_user ? 
                                    html`<td style="text-transform: capitalize" data-label="Created By">${notification.create_user_info.long_name}</td>`
                                    :
                                    html`<td data-label="Created By">System</td>`
                                }
                                <td data-label="Message">${unsafeHTML(notification.message)}</td>
                            </tr>
                        `
                        )
                    }
                        </tbody>
                    </table>
                    </ion-row>
                </ion-grid>
                <ion-fab color="danger" @click=${() => { this.handleAddNotification() }} vertical="bottom" horizontal="end" slot="fixed">
                    <ion-fab-button>
                        <ion-icon name="add"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
            </ion-content>

        `;

        this.render();
        this.getNotifications();
    }

    render() {
        render(this.template({}), this);
    }

    selectNotification(notification) {
        //nothing to do for now

    }

    async handleAddNotification() {
        let notification = await this.promptNotification();
        if(!notification)
            return;

        //create the family object
        await this.broker.post(`/api/notifications/admin`, {message: notification} );
        await this.getNotifications();
        this.render();
    }

    async promptNotification() {
        const alertController = window.alertController;

        const alert = await alertController.create({
            header: 'Add notification',
            inputs: [
                {
                    name: 'message',
                    id: 'message',
                    placeholder: 'New notification message'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                }, {
                    text: 'Ok',
                    handler: (data) => {
                        alert.dismiss(data.message);
                    }
                }
            ]
        });
        await alert.present();
        let result = await alert.onDidDismiss();
        return result.data.values.message;
    }

    async getNotifications() {
        let date = new Date();

        let result = await this.broker.get('/api/notifications/admin');
        this.notifications = result;
        this.render();

    }
}
customElements.define('scene-notifications', SceneNotifications);
export default SceneNotifications;