/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import ComponentBase from '../../../../shared/view/components/component-base-vanilla';
import broker from 'databroker';

import ComponentUserProfile from '../app/user/component-user-profile';
import ComponentUserHistory from '../app/user/component-user-history';

class SceneUser extends ComponentBase {
    constructor() {
        super();
        this.user = {
            username: '',
            email: '',
            first_name: '',
            last_name: ''
        }

        //manually instantiate the components for the subroutes
        //this is so we can assign props and interact with them directly at the top level
        this.componentUserProfile = new ComponentUserProfile();
        this.componentUserHistory = new ComponentUserHistory();
    }

    get user_id() {
        return this._user_id;
    }

    /**
     * This is the id of the user being loaded. The Router should set this automatically from the URL param
     */
    set user_id(value) {
        this._user_id = value;
    }

    connectedCallback() {
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = '<slot></slot>';
        this.template = (user) => html`
        <style>
                :host {
                    justify-content: flex-start !important;
                    position: relative;
                    background-color: #f0f0f0;
                }
                #scene_user_content {
                    --padding-top: 1vh;
                    --padding-bottom: 1vh;
                    --padding-start: 1vw;
                    --padding-end: 1vw;
                }
        </style>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/users"></ion-back-button>
                </ion-buttons>
                <ion-title id="title">${user.first_name} ${user.last_name} ${user.username}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content id="scene_user_content">
            <ion-fab vertical="top" horizontal="end" slot="fixed">
                <ion-fab-button>
                    <ion-icon name="chevron-down-circle-outline"></ion-icon>
                </ion-fab-button>
                <ion-fab-list side="bottom">
                    <ion-fab-button title="Set password" @click=${(e) => this.handleSetPassword()}><ion-icon name="lock-closed"></ion-icon></ion-fab-button>
                    <ion-fab-button title="Get login link" @click=${(e) => this.handleGetLoginLink()}><ion-icon name="link"></ion-icon></ion-fab-button>
                </ion-fab-list>

            </ion-fab>
            <ion-tabs id="user_tabs" style="background-color: var(--ion-color-light)">
                <ion-tab tab="tab-profile" .component=${this.componentUserProfile}>
                </ion-tab>

                <ion-tab tab="tab-history" .component=${this.componentUserHistory}>
                    <!--<ion-nav></ion-nav>-->
                </ion-tab>
                <ion-tab-bar slot="bottom">
                    <ion-tab-button tab="tab-profile">
                        <ion-icon name="information-circle"></ion-icon>
                        <ion-label>User</ion-label>
                    </ion-tab-button>

                    <ion-tab-button tab="tab-history">
                        <ion-icon name="time"></ion-icon>
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
        render(this.template(this.user), this);
    }

    async init() {
        await this.loadUser();

    }

    async handleGetLoginLink() {
        let response = await broker.get('/api/login/link/' + this.user._id);
        const alertController = window.alertController;
        
        const alert = await alertController.create({
            header: 'Login Link',
            message: "Here's a link that can be used to log in as the user",
            inputs: [
                {
                    name: 'link',
                    id: 'link',
                    value: response.url
                },
            ],
            buttons: [
                {
                    text: "Copy",
                    role: 'copy',
                    handler: async (...args) => {
                        let element = document.querySelector('ion-alert #link');
                        element.select();
                        element.setSelectionRange(0, 99999); /* For mobile devices */
                        document.execCommand("copy");
                        let toast_controller = window.toastController;
                        let toast = await toast_controller.create({
                            message: "Link copied",
                            position: 'bottom',
                            duration: 1500
                        });
                        await toast.present();
                    }

                },
                {
                    text: 'Ok',
                    role: 'cancel',
                    cssClass: 'secondary',
                }
            ]
        });
        await alert.present();

    }

    async promptNewPassword() {
        return new Promise(
            async (resolve, reject) => {
                const alertController = window.alertController;

                const alert = await alertController.create({
                    header: 'Set password',
                    message: "Enter the new password you'd like to set for the user",
                    inputs: [
                        {
                            name: 'password',
                            id: 'prompt_new_password',
                            placeholder: 'New Password',
                            type: 'password',
                            required: true
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
                                resolve(data.password);
                            }
                        }
                    ]
                });
                await alert.present();
            }
        )
    }

    async handleSetPassword() {
        let toast_controller = window.toastController;
        let new_password = await this.promptNewPassword();
        if(!new_password) {
            let message = await toast_controller.create({
                message: 'To add a new user, we need at least the first name, last name and email of the user',
                duration: 2000,
                buttons: [{
                    role: 'cancel',
                    icon: 'close'
                }]
            });
            await message.present();
            return;
        }
        this.user = await broker.patch(`/api/users/${this.user_id}`,
        [
            {op: 'replace', path: '/password', value: new_password}
        ]);

        this.render();
        this.updateComponents(); //we do this manually because we're managing the lifecycle of these components manually

        let message = await toast_controller.create({
            message: 'Password updated successfully',
            duration: 2000,
            buttons: [{
                role: 'cancel',
                icon: 'close'
            }]
        });
        await message.present();
    }

    async loadUser() {
        this.user = await broker.get(`/api/users/${this.user_id}`);
        this.render();
        this.updateComponents(); //we do this manually because we're managing the lifecycle of these components manually
    }

    /**
     * Update sub components data
     */
    updateComponents() {
        this.componentUserProfile.user = this.user;
        this.componentUserHistory.user = this.user;
    }

}

customElements.define('scene-user', SceneUser);
export default SceneUser;