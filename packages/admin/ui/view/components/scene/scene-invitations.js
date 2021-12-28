/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import {Broker} from 'databroker';
import ComponentSortSelection from 'common/ui/components/component-sort-selection';

class SceneInvitations extends HTMLElement {

    constructor() {
        super();
        this.broker = new Broker();
        this.invitations = [];
        this.sort_items = [
                    {label: 'Create Date', value: 'created_date', state: 0},
                    {label: 'Invitation Status', value: 'status', state: 0},
                    {label: 'Long Name', value: 'long_name', state: 0},
                    {label: 'Last Name', value: 'last_name', state: 0},
                    {label: 'Last Login', value: 'last_login_date', state: 0},
                    {label: 'Account', value: 'client_id', state: 0},
                ];
        this.filter_items = [
            {
                type: 'date-range', 
                filter_name: 'created_date',
                label: 'Create Date', 
                data: {
                    from: new Date(new Date().getTime() - (1000 * 60 * 60 * 24)),
                    to: new Date(new Date().getTime() + (1000 * 60 * 60 * 24))
                },
            },
            {
                type: 'switch', 
                label: 'Invitation Status', 
                filter_name: 'status',
                placeholder: 'Select one or more statuses',
                data: [
                    {value: 'created', label: 'Created'},
                    {value: 'invited', label: 'Invited'},
                    {value: 'accepted', label: 'Accepted'},
                    {value: 'cancelled', label: 'Cancelled'},
                    {value: 'expired', label: 'Expired'},
                ],
                value: null,
            },
            {
                type: 'date-range', 
                filter_name: 'last_login_date',
                label: 'Last Login Date', 
                data: {
                    from: new Date(new Date().getTime() - (1000 * 60 * 60 * 24)),
                    to: new Date(new Date().getTime() + (1000 * 60 * 60 * 24))
                },
            },
            {
                type: 'string', 
                filter_name: 'last_name',
                label: 'Last Name', 
            },
            {
                type: 'string', 
                filter_name: 'first_name',
                label: 'First Name', 
            },
            {
                type: 'string', 
                filter_name: 'client_id',
                label: 'Account', 
            },
        ]

        this.sort = "-created_date";
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
                    <ion-title id="title">Invitations</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content id="content">
                <ion-grid>
                    <ion-row>
                        <ion-col size="12" size-sm="12" size-md="6">
                            <ion-searchbar debounce="300" @ionChange=${(e)=>this.handleSearchbarChange(e)} placeholder="Search invitations" type="text"></ion-searchbar>
                        </ion-col>
                        <ion-col size="12" size-sm="12" size-md="6">
                            <ion-button @click=${(e) => this.showSort()}>
                                <ion-icon slot="start" name="options"></ion-icon>
                                Sort
                            </ion-button>
                            <ion-button @click=${(e) => this.showFilters()}>
                                <ion-icon slot="start" name="funnel"></ion-icon>
                                Filters
                                ${this.filters && Object.keys(this.filters).length ? 
                                    html`
                                    <ion-badge style="margin-left: 5px; color: yellow !important; background: teal !important" color="warning" slot="end">${Object.keys(this.filters).length}</ion-badge>
                                    ` :''}
                            </ion-button>

                        </ion-col>
                    </ion-row>
                    <ion-row>
                    <table>
                        <thead>
                            <tr>
                                <th>Created Date</th>
                                <th>Status Date</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Account</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                    ${this.invitations.map(
                        (invitation) => 
                        html`
                            <tr @click=${(e) => {this.selectInvitation(invitation)}} style="cursor: pointer">
                                <td data-label="Created Date">${new Date(invitation.created_date).toLocaleString()}</td>
                                <td data-label="Status Date">${invitation.status_history.length?new Date(invitation.status_date).toLocaleString() : new Date(invitation.created_date).toLocaleString()}</td>
                                <td data-label="Name">${invitation.first_name} ${invitation.last_name}</td>
                                <td data-label="Email">${invitation.email_address}</td>
                                <td data-label="Phone">${invitation.phone_cell}</td>
                                <td data-label="Account">${invitation.client_id}</td>
                                <td data-label="Status">${this.getStatusChip(invitation.status)}</td>
                            </tr>
                        `
                        )
                    }
                        </tbody>
                    </table>
                    </ion-row>
                </ion-grid>
                <!--<ion-fab color="danger" @click=${() => {this.handleAddInvitation()}} vertical="bottom" horizontal="end" slot="fixed">
                    <ion-fab-button>
                        <ion-icon name="add"></ion-icon>
                    </ion-fab-button>
                </ion-fab>-->
            </ion-content>

        `;

        this.render();
        this.getInvitations();

    }

    render() {
        render(this.template({}), this);
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
        this.getInvitations();
    }

    async showFilters() {
        let modal_controller = window.modalController;
        let modal = await modal_controller.create({
            component: 'app-filter-selection',
            componentProps: {
                items: this.filter_items            }
        });
        modal.present();
        let result = await modal.onDidDismiss();
        if(!result.data)
            return;
        this.filters = result.data.filters;
        this.filter_items = result.data.items;
        await this.getInvitations();
    }

    selectInvitation(invitation) {
        let router = document.querySelector('ion-router');
        router.push('/invitations/' + invitation._id);
    }

    async handleSearchbarChange(e) {
        this.search = e.detail.value;
        await this.getInvitations();
    }

    async getInvitations() {
        let query = {
            limit: 50,
            sort: this.sort || ''
        };
        if(this.filters)
            query.filter = this.filters;

        if(this.search) {
            if(!query.filter)
                query.filter = {};
            query.filter.$text = { $search: this.search };
        }

        let result = await this.broker.get('/api/invitations', query);
        this.invitations = result;
        this.render();

    }

    async handleAddInvitation() {
        let modal_controller = window.modalController;
        let modal = await modal_controller.create({
            component: 'app-invitation-new'
        });
        modal.present();

    }

}
customElements.define('scene-invitations', SceneInvitations);
export default SceneInvitations;