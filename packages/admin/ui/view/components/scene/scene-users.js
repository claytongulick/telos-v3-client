/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import ComponentCardUser from '../app/cards/component-card-user';
import ComponentSortSelection from 'common/ui/components/component-sort-selection';
import ComponentFilterSelection from 'common/ui/components/component-filter-selection';
import ComponentUserNew from '../app/user/component-user-new';
import {Broker} from 'databroker';

class SceneUsers extends HTMLElement {

    constructor() {
        super();
        this.broker = new Broker();
        this.users = [];
        this.sort_items = [
                    {label: 'Create Date', value: 'created_date', state: 0},
                    {label: 'Account Status', value: 'account_status', state: 0},
                    {label: 'Long Name', value: 'long_name', state: 0},
                    {label: 'Last Name', value: 'last_name', state: 0},
                    {label: 'Last Login', value: 'last_login_date', state: 0},
                    {label: 'Account', value: 'account', state: 0},
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
                label: 'Account Status', 
                filter_name: 'account_status',
                placeholder: 'Select one or more statuses',
                data: [
                    {value: 'active', label: 'Active'},
                    {value: 'inactive', label: 'Inactive'},
                    {value: 'locked', label: 'Locked'},
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
                filter_name: 'account',
                label: 'Account', 
            },
        ]

        this.sort = "-created_date";
    }

    connectedCallback() {
        this.attachShadow({mode:'open'});
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
                    <ion-title id="title">Users</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content id="content">
                <ion-grid>
                    <ion-row>
                        <ion-col size="12" size-sm="12" size-md="6">
                            <ion-searchbar debounce="300" @ionChange=${(e)=>this.handleSearchbarChange(e)} placeholder="Search users" type="text"></ion-searchbar>
                        </ion-col>
                        <ion-col size="12" size-sm="12" size-md="6">
                            <ion-button @click=${(e) => this.showSort()}>
                                <ion-icon slot="start" name="options"></ion-icon>
                                Sort
                                ${this.sort ? 
                                    html`
                                    <ion-badge style="margin-left: 5px; color: yellow !important; background: teal !important" color="warning" slot="end">${this.sort.split(',').length}</ion-badge>
                                    ` :''}
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
                    ${this.users.map(
                        (user) => 
                        html`
                            <ion-col size="12" size-sm="12" size-md="6" size-lg="6">
                                <app-card-user .user=${user}></app-card-user>
                            </ion-col>
                        `
                        )
                    }
                    </ion-row>
                </ion-grid>
                <ion-fab color="danger" @click=${() => {this.handleAddUser()}} vertical="bottom" horizontal="end" slot="fixed">
                    <ion-fab-button>
                        <ion-icon name="add"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
            </ion-content>

        `;

        this.render();

    }

    render() {
        render(this.template({}), this.shadowRoot);
    }

    async handleSearchbarChange(e) {
        this.search = e.detail.value;
        await this.getUsers();
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
        if(!result.data)
            return;
        this.sort = result.data.sort;
        this.sort_items = result.data.items;
        await this.getUsers();
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
        await this.getUsers();
    }

    async getUsers() {
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

        let result = await this.broker.get('/api/users', query);
        this.users = result;
        this.render();

    }
    
    async promptNewUser() {
        let modalController = window.modalController;
        let modal = await modalController.create({
            component: 'app-user-new'
        });
        await modal.present();
        let result = await modal.onDidDismiss();
        return result.data;
    }
    
    async handleAddUser() {
        let new_user = await this.promptNewUser();
        if(!new_user)
            return;

        let created_user;
        try {
            created_user = await this.broker.post('/api/users', new_user, {json: true});
        }
        catch(err) {
            alert(`Error adding user: ${err}`);
        }

        //redirect to the created user
        let router = document.querySelector('ion-router');
        router.push(`/users/${created_user._id}`);

    }


}
customElements.define('scene-users', SceneUsers);
export default SceneUsers;