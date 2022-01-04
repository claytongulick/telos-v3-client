/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import ApplicationState from 'applicationstate';
import {Broker} from 'databroker';
import Messaging from 'common/ui/utility/messaging';
import {createAnimation} from '@ionic/core';

class SceneHome extends HTMLElement {
    constructor() {
        super();
        this.user = {
            avatar: '',
            first_name: '',
        }
        ApplicationState.listen('app.login_user', (user) => {
            if(!user) {
                this.user = {avatar:'',first_name:''};
                if(this.fade_animation) {
                    this.fade_animation.destroy();
                    delete this.fade_animation;
                }
                if(this.show_animation) {
                    this.show_animation.destroy();
                    delete this.show_animation;
                }
                let pick_login_element = this.querySelector('#pick_login');
                let collect_email_element = this.querySelector("#collect_email");
                collect_email_element.style.display = 'block';
                collect_email_element.style.opacity = '1';
                pick_login_element.style.opacity = '0';
                this.email_address = '';
            }
            this.render();
        })
        this.broker = new Broker();
    }
    connectedCallback() {
        this.template = (data) => html`
            <style>
            </style>

            <ion-content padding style="text-align: center;">
                <ion-grid>
                    <ion-row>
                        <ion-col size="1" size-lg="3"></ion-col>
                        <ion-col style="position: relative;">
                            <div id="collect_email">
                                <h1 style="font-size: 1.8em; color: var(--ion-color-step-800)">Hi!</h1>
                                <h2 style="font-size: 1.2em; color: var(--ion-color-step-700)">To sign in, let's start with your email address:</h2>
                                <div>
                                    <ion-item>
                                        <ion-input value=${this.email_address} placeholder="Email address" @ionChange=${e => this.email_address = e.target.value}></ion-input>
                                        <ion-button @click=${e => this.handleEmailNext()}>Next</ion-button>
                                    </ion-item>
                                    <ion-item lines="none" style="margin-top: 20px; font-size: 12px;">
                                        <ion-checkbox checked=${!!this.email_address} style="height: 16px; width: 16px;" @ionChange=${e => this.handleRememberEmail(e)}></ion-checkbox>
                                        <ion-label style="margin-left: 10px">Remember my email</ion-label>
                                    </ion-item>
                                </div>
                            </div>
                            <div id="pick_login" style="opacity: 0;">
                                <h2 style="font-size: 1.2em; color: var(--ion-color-step-700)">Welcome back, ${this.user.first_name}!</h2>
                                <h3 style="font-size: 1em; color: var(--ion-color-step-800)">How would you like to log in?</h2>
                                <ion-list>
                                    <ion-radio-group mode="md" id="login_method" value=${ApplicationState.get('app.preferred_login_method')}>
                                        <ion-item>
                                            <ion-label color="secondary">Password</ion-label>
                                            <ion-radio color="secondary" value="password"></ion-radio>
                                        </ion-item>
                                        <ion-item>
                                            <ion-label color="secondary">A code sent to my phone</ion-label>
                                            <ion-radio color="secondary" value="otp-sms"></ion-radio>
                                        </ion-item>
                                        <ion-item>
                                            <ion-label color="secondary">A code sent to my email</ion-label>
                                            <ion-radio color="secondary" value="otp-email"></ion-radio>
                                        </ion-item>
                                    </ion-radio-group>
                                    <ion-label color="danger" style="margin-top: 10px; display: block;">${this.error_message}</ion-label>
                                    <ion-item lines="none" >
                                        <ion-button @click=${e => this.handleSelectLoginMethod(e)} size="default" slot="end">Next</ion-button>
                                    </ion-item>
                                    <ion-item lines="none" style="margin-top: 20px; font-size: 12px;">
                                        <ion-checkbox style="height: 16px; width: 16px;" @ionChange=${e => this.handleRememberLoginMethod(e)}></ion-checkbox>
                                        <ion-label style="margin-left: 10px">Remember my choice for next time</ion-label>
                                    </ion-item>
                                </ion-list>
                            </div>
                        </ion-col>
                        <ion-col size="1" size-lg="3"></ion-col>
                    </ion-row>
                </ion-grid>

            </ion-content>
        `;

        this.init();
        render(this.template(), this);

    }

    init() {
        let email_address = ApplicationState.get('app.login_email_address');
        if(email_address)
            this.email_address = email_address;
    }

    render() {
        if(this.template) {
            render(this.template(), this);
        }
    }

    async handleRememberEmail(e) {
        if(e.target.checked)
            ApplicationState.set('app.login_email_address', this.email_address);
        else
            ApplicationState.set('app.login_email_address', '');
    }

    async handleRememberLoginMethod(e) {
        let flow = document.querySelector('#login_method').value;
        ApplicationState.set('app.preferred_login_method', flow);
    }

    async handleEmailNext() {
        try {
            this.user = await this.broker.get(`/api/users/${encodeURIComponent(this.email_address)}`);
            ApplicationState.set('app.login_user',this.user, {persist: false});
            this.render();
            let preferred_method = ApplicationState.get('app.preferred_login_method');
            await this.navigateNextStep(preferred_method);

        }
        catch(err) {
            Messaging.toast("Sorry, we can't find that email address. Double check it and try again?")
            return;
        }
        let pick_login_element = this.querySelector('#pick_login');
        let collect_email_element = this.querySelector("#collect_email");
        this.fade_animation = createAnimation()
            .addElement(collect_email_element)
            .duration(300)
            .fromTo('opacity','1','0')
            .afterStyles({display: 'none'});
        this.show_animation = createAnimation()
            .addElement(pick_login_element)
            .duration(300)
            .fromTo('opacity','0','1');
        await this.fade_animation.play();
        await this.show_animation.play();
    }

    async handleSelectLoginMethod(e) {
        let login_method_element = this.querySelector('#login_method');
        await this.navigateNextStep(login_method_element.value);
    }

    async navigateNextStep(preferred_method) {
        let router = document.querySelector('ion-router');
        switch (preferred_method) {
            case "password":
                ApplicationState.set('app.side_image', 'password');
                await router.push('/password');
                return;
            case "otp-email":
                await this.sendOTP('email');
                return;
            case "otp-sms":
                await this.sendOTP('sms');
                return;
        }

    }

    async sendOTP(type) {
        this.error_message = '';
        this.render();

        let email_address = this.email_address;

        try {
            let result = await this.broker.post('/api/otp/send', {type, email_address});
            let router = document.querySelector('ion-router');
            await router.push('/otp');
        }
        catch (err) {
            console.error(err);
            let alert_controller = window.alertController;
            let alert;
            alert = await alert_controller.create({
                header: 'Error',
                message: 'Error sending code, try a different method or contact us.',
                buttons: ['OK']
            });

            return await alert.present();
        }
    }

}
customElements.define('scene-home', SceneHome);
export default SceneHome;