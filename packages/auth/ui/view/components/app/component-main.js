/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import { loadingController, alertController, modalController, toastController, pickerController, actionSheetController } from '@ionic/core';

import broker from 'databroker';

import SceneHome from '../scene/scene-home';
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

    }

    connectedCallback() {
        this.template = () => html`
        <ion-app>
            <ion-router @ionRouteDidChange=${(e) => this.handleRouteChange(e)}>
                <ion-route url='/' component='scene-home'></ion-route>
            </ion-router>
            <ion-nav id="app_content" animated="true"></ion-nav>
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
        broker.addEventListener('loading', this.handleLoading.bind(this));
        broker.addEventListener('loading_complete', this.handleLoadingComplete.bind(this));
        this.loading_controller = window.loadingController;
        this.progress_bar = this.querySelector('ion-progress-bar');
    }

    async handleLoading() {
        this.progress_bar.style.opacity = 1;
    }

    handleLoadingComplete() {
        this.progress_bar.style.opacity = 0;
    }
}

customElements.define("component-main", ComponentMain);
export default ComponentMain;