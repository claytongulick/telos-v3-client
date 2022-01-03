/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import { loadingController, alertController, modalController, toastController, pickerController, actionSheetController, createAnimation } from '@ionic/core';

import {Broker} from 'databroker';

import SceneHome from '../scene/scene-home';
import ScenePassword from '../scene/flows/password/scene-password';
import ApplicationState from 'applicationstate';

import sign_in_image from '../../../image/sign_in.svg';
import sign_in_password from '../../../image/sign_in_password.svg'

import ApplicationLogo from 'common/ui/components/component-logo';


/**
 * This is the main application class
 */
class ComponentMain extends HTMLElement {

    constructor() {
        super();
        this.broker = new Broker();

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

        ApplicationState.listen('app.side_image', (image) => {
            this.setImage(image);
        });

    }

    connectedCallback() {
        this.template = () => html`
        <ion-app mode="ios">
            <ion-router @ionRouteDidChange=${(e) => this.handleRouteChange(e)}>
                <ion-route url='/' component='scene-home'></ion-route>
                <ion-route url='/password' component='scene-password'></ion-route>
            </ion-router>
            <div >
                <div style="height: 50px; width: 100%; background-color: var(--ion-color-primary); display: flex; flex-direction: row; align-items: center; justify-content: flex-start;">
                    <app-logo style="margin-left: 25px;height: 35px; margin-top: 0px" .mode=${'text'}></app-logo>
                </div>
            </div>
            <ion-split-pane style="margin-top: 50px;" content-id="app_content">
                <div id="content_image" style="padding: 15px">
                    <ion-img id="side_image" src=${sign_in_image} style="width: 100%"></ion-img>
                </div>
                <ion-nav id="app_content" animated="true"></ion-nav>
            </ion-split-pane>
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
        this.broker.addEventListener('loading', this.handleLoading.bind(this));
        this.broker.addEventListener('loading_complete', this.handleLoadingComplete.bind(this));
        this.loading_controller = window.loadingController;
        this.progress_bar = this.querySelector('ion-progress-bar');
    }

    async handleLoading() {
        this.progress_bar.style.opacity = 1;
    }

    handleLoadingComplete() {
        this.progress_bar.style.opacity = 0;
    }

    handleRouteChange(e) {

    }

    async setImage(image) {
        if(this.image == image)
            return;

        let side_image_element = this.querySelector('#side_image');
        let fade_out = createAnimation()
            .addElement(side_image_element)
            .duration(300)
            .fromTo('opacity','1','0');
        let fade_in = createAnimation()
            .addElement(side_image_element)
            .duration(300)
            .fromTo('opacity','0','1');

        await fade_out.play();
        if(image == '')
            side_image_element.src = sign_in_image;
        if(image == 'password')
            side_image_element.src = sign_in_password;
        await fade_in.play();
        this.image = image;
    }
}

customElements.define("component-main", ComponentMain);
export default ComponentMain;