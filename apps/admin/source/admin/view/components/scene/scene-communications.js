/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import broker from 'databroker';
import ComponentSortSelection from '../../../../shared/view/components/component-sort-selection';

class SceneCommunications extends HTMLElement {

    constructor() {
        super();
        this.communications = [];
        this.sort_items = [
                    {label: 'Date', value: 'status_date', state: 0},
                    {label: 'Type', value: 'communication_type', state: 0}, 
                    {label: 'Template', value: 'communication_template', state: 0},
                    {label: 'Status', value: 'status', state: 0},
                ];

        this.sort = "-status_date";
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
                #checkbox_wrapper {
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    width: 100%;
                    height: 100%;
                }
                #checkbox_wrapper div {
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                }
                #checkbox_wrapper div ion-checkbox {
                    margin-right: 10px;
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
                    <ion-title id="title">Communications</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content id="content">
                <ion-grid>
                    <ion-row>
                        <ion-col size="12" size-sm="12" size-md="6">
                            <ion-searchbar debounce="300" @ionChange=${(e)=>this.handleSearchbarChange(e)} placeholder="Search communications" type="text"></ion-searchbar>
                        </ion-col>
                        <ion-col size="12" size-sm="12" size-md="6">
                            <ion-button @click=${(e) => this.showSort()}>
                                <ion-icon slot="start" name="options"></ion-icon>
                                Sort
                            </ion-button>

                        </ion-col>
                    </ion-row>
                    <ion-row>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Template</th>
                                <th>To</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                    ${this.communications.map(
                        (communication) => 
                        html`
                            <tr @click=${(e) => {this.selectCommunication(communication)}} style="cursor: pointer">
                                <td data-label="Date">${communication.status_history.length?new Date(communication.status_date).toLocaleString() : 'Not sent'}</td>
                                <td data-label="Type">${communication.communication_type}</td>
                                <td data-label="Template">${communication.communication_template}</td>
                                <td data-label="To">
                                    <ul style="list-style: none">
                                        ${communication.to.map(
                                            (to) => html`
                                            <li><a href='#/users/${to.reference}'>${to.to_address}</a></li>
                                            `
                                        )}
                                    </ul>
                                </td>
                                <td data-label="Status">${this.getStatusChip(communication.status)}</td>
                            </tr>
                        `
                        )
                    }
                        </tbody>
                    </table>
                    </ion-row>
                </ion-grid>
                <!--<ion-fab color="danger" @click=${() => {this.handleAddCommunication()}} vertical="bottom" horizontal="end" slot="fixed">
                    <ion-fab-button>
                        <ion-icon name="add"></ion-icon>
                    </ion-fab-button>
                </ion-fab>-->
            </ion-content>

        `;

        this.render();
        this.getCommunications();

    }

    render() {
        render(this.template({}), this);
    }

    getStatusChip(status) {
        switch(status) {
            case "complete":
                return html`<ion-chip><ion-icon color="success" name='checkmark'></ion-icon><ion-label>Complete</ion-label></ion-chip>`;
            case "pending":
                return html`<ion-chip><ion-icon color="secondary" name='code-working'></ion-icon><ion-label>Pending</ion-label></ion-chip>`;
            case "created":
                return html`<ion-chip><ion-icon color="tertiary" name='code'></ion-icon><ion-label>Created</ion-label></ion-chip>`;
            case "error":
                return html`<ion-chip><ion-icon color="danger" name='close-circle'></ion-icon><ion-label>Error</ion-label></ion-chip>`;
        }
    }

    async showSort() {
        let modal_controller = window.modalController;
        let modal = await modal_controller.create({
            component: 'app-sort-selection',
            componentProps: {
                items: this.sort_items
            }
        });
        modal.present();
        let result = await modal.onDidDismiss();
        this.sort = result.data.sort;
        this.sort_items = result.data.items;
        this.getCommunications();
    }

    selectCommunication(communication) {
        let router = document.querySelector('ion-router');
        router.push('/communications/' + communication._id);
    }

    async handleSearchbarChange(e) {
        this.search = e.detail.value;
        await this.getCommunications();
    }

    async getCommunications() {
        let query = {
            limit: 50,
            sort: this.sort || ''
        };
        if(this.search) {
            query.filter = {
                $text: {
                    $search: this.search
                }
            };
        }

        let result = await Broker.get('/api/communications', query);
        this.communications = result;
        this.render();

    }

    async handleAddCommunication() {
        let modal_controller = window.modalController;
        let modal = await modal_controller.create({
            component: 'app-conversation-user'
        });
        modal.present();

    }

}
customElements.define('scene-communications', SceneCommunications);
export default SceneCommunications;