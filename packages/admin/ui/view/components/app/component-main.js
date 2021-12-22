/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import { loadingController, alertController, modalController, toastController, pickerController, actionSheetController } from '@ionic/core';

import broker from 'databroker';

import SceneHome from '../scene/scene-home';
import SceneUser from '../scene/scene-user';
import SceneUsers from '../scene/scene-users';
import SceneInvitations from '../scene/scene-invitations';
import SceneInvitation from '../scene/scene-invitation';
import ComponentLogo from 'common/ui/components/component-logo';
import ApplicationState from 'applicationstate';


/**
 * This is the main application class
 */
class ComponentMain extends HTMLElement {

    constructor() {
        super();

        this.version = VERSION;
        this.environment = NODE_ENV;
        this.app_name = APP_NAME;

        console.log(`Starting ${this.app_name} v${this.version} in ${this.environment} envioronment.`)

        this.notifications = [];

        //cache controller imports on window as recommended by ionic docs
        window.loadingController = loadingController;
        window.alertController = alertController;
        window.actionSheetController = actionSheetController;
        window.modalController = modalController;
        window.pickerController = pickerController;
        window.toastController = toastController;

        //TODO: make this work like family app login
        this._logged_in_promise = new Promise(
            (resolve, reject) => {
                this._logged_in_resolve = resolve;
            }
        );

        this._ready_promise = new Promise(
            (resolve, reject) => {
                this._ready_resolve = resolve;
            }
        );

        let handleError = async (message) => {
            let toast_controller = window.toastController;
            if(!toast_controller)
                return alert(message);
            if(!toast_controller.create)
                return alert(message);

            let toast = await toast_controller.create({
                message: message,
                position: 'top',
                showCloseButton: true
            });
            await toast.present();
        }

        //global error handler
        window.addEventListener('error',async (e) => {await handleError(e.message) });
        window.onunhandledrejection = async (e) => {await handleError(e.reason) };

        broker.addEventListener('missing_credentials', () => this.handleMissingCredentials());

    }

    get logged_in() {
        return this._logged_in_promise;
    }

    get ready() {
        return this._ready_promise;
    }

    connectedCallback() {
        this.template = () => html`
        <style>
            .active {
                --ion-text-color: var(--ion-color-primary);
                border-left: 5px solid;
                border-left-color: var(--ion-color-primary);
            
            }

            .active ion-icon {
                --ion-text-color-rgb: var(--ion-color-primary);
            }
        </style>
        <ion-app>
            <ion-router @ionRouteDidChange=${(e) => this.handleRouteChange(e)}>
                <ion-route url='/' component='scene-home'></ion-route>
                <ion-route url='/users' component='scene-users'></ion-route>
                <ion-route url='/users/:user_id' component='scene-user'>
                    <ion-route url='/profile' component='tab-profile'></ion-route>
                    <ion-route url='/history' component='tab-history'></ion-route>
                    <ion-route component='tab-profile'></ion-route>
                </ion-route>
                <ion-route url='/invitations' component='scene-invitations'></ion-route>
                <ion-route url='/invitations/:invitation_id' component='scene-invitation'>
                    <ion-route url='/view' component='tab-view'></ion-route>
                    <ion-route url='/history' component='tab-history'></ion-route>
                    <ion-route component="tab-view"></ion-route>
                </ion-route>
            </ion-router>
            <ion-split-pane content-id="app_content" when="sm">
                <ion-menu content-id="app_content">
                    <ion-header>
                        <ion-toolbar color="primary">
                            <div style='display: flex; flex-direction: row; align-items: center; justify-content: center;'>
                                <app-logo style="height: 30px; margin-top: 0px" .mode=${'text'}></app-logo>
                            </div>
                        </ion-toolbar>
                    </ion-header>
        
                    <ion-content>
                        <ion-list id="left_menu_list" lines="none">
                            <ion-menu-toggle auto-hide="false">
                                <ion-item button href="">
                                    <ion-icon slot="start" name='home'></ion-icon>
                                    <ion-label>
                                        Dashboard
                                    </ion-label>
                                </ion-item>
                                <ion-item button href="users"}>
                                    <ion-icon slot="start" name='people'></ion-icon>
                                    <ion-label>
                                        Users
                                    </ion-label>
                                </ion-item>
                                <ion-item button href="invitations"}>
                                    <ion-icon slot="start" name='mail'></ion-icon>
                                    <ion-label>
                                        Invitations
                                    </ion-label>
                                </ion-item>
                                <ion-item-divider></ion-item-divider>
                                <ion-item button href="settings"}>
                                    <ion-icon slot="start" name='settings'></ion-icon>
                                    <ion-label>
                                        Settings
                                    </ion-label>
                                </ion-item>
                            </ion-menu-toggle>
                        </ion-list>
                    </ion-content>
                </ion-menu>
                <ion-nav id="app_content" animated="true"></ion-nav>
            </ion-split-pane>
            <app-login></app-login>
            <ion-progress-bar style="opacity:0; transition: opacity 0.25s linear;" color="warning" type="indeterminate" value="0"></ion-progress-bar>
        </ion-app>
            `;

            this.render();
            this.init();
    }

    render() {
        render(this.template({}), this);
    }

    async init() {
        let ion_app = this.querySelector("ion-app");
        //wait for ionic to load
        let loading_interval = setInterval(
            async () => {
                if(!ion_app.componentOnReady) {
                    console.warn("ionic not loaded, delaying 10ms...");
                    return;
                }

                clearInterval(loading_interval);

                await ion_app.componentOnReady();
                this._ready_resolve();
            }, 10
        );

        await this.ready;

        this.setActiveMenuItem();
        this.login_scene = this.querySelector('app-login');
        this.login_scene.addEventListener('login_success', this.handleLoginSuccess.bind(this));
        this.addEventListener('logout', this.handleLogout.bind(this));
        //this.addEventListener('missing_credentials', this.handleMissingCredentials.bind(this));
        this.addEventListener('navigate', this.handleNavigate.bind(this));
        broker.addEventListener('loading', this.handleLoading.bind(this));
        broker.addEventListener('loading_complete', this.handleLoadingComplete.bind(this));
        this.querySelector('ion-nav').addEventListener("ionNavWillChange", (e) => this.handleNavigate(e));
        this.loading_controller = window.loadingController;
        this.progress_bar = this.querySelector('ion-progress-bar');

        if(!this._notification_poll_interval_key)
            this._notification_poll_interval_key = setInterval(() => this.pollNotifications(), 5000);
    }

    async pollNotifications() {
        let user = ApplicationState.get('app.user');
        if(!user) {
            console.warn("Unable to poll for notifications, no valid user");
            return;
        }
        this._notifications = await broker.get(`/api/notifications/admin/${user._id}`);
        this.render();
    }

    handleRouteChange(e) {
        let data = e.detail;
    }

    setActiveMenuItem(root_path) {
        let elements = this.querySelectorAll("ion-menu ion-item");
        for (const element of elements) {
            if(element.getAttribute('href') == root_path)
                element.classList.add('active');
            else
                element.classList.remove('active');
        }
    }

    handleNavigate(e) {
        let path_items = window.location.hash.split('/');
        let root_path = path_items[1]; //[#,users,123]
        this.setActiveMenuItem(root_path)
    }

    handleMissingCredentials() {
        this.login_scene.showLogin();
        this.login_scene.style.display = 'block';
    }

    async handleLoading() {
        this.progress_bar.style.opacity = 1;
    }

    handleLoadingComplete() {
        this.progress_bar.style.opacity = 0;
    }

    handleLogout() {
        let logout = this.querySelector('app-logout');
        logout.show();
    }

    handleLoginSuccess() {
        this.login_scene.style.display = 'none';
    }

}

customElements.define("component-main", ComponentMain);
export default ComponentMain;