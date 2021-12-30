/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import ApplicationState from 'applicationstate';
import {Broker} from 'databroker';

class SceneHome extends HTMLElement {
    constructor() {
        super();
        this.user = {
            avatar: '',
            first_name: '',
        }
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
                        <ion-col>
                            <h1 style="font-size: 1.8em; color: var(--ion-color-step-800)">Hi!</h1>
                            <h2 style="font-size: 1.2em; color: var(--ion-color-step-700)">To sign in, let's start with your email address:</h2>
                            <div>
                                <ion-item>
                                    <ion-input placeholder="Email address" @ionChange=${e => this.email_address = e.target.value}></ion-input>
                                    <ion-button @click=${e => this.handleEmailNext()}>Next</ion-button>
                                </ion-item>
                            </div>
                            <div id="pick_login" style="display: none;">
                                <h2 style="font-size: 1.2em; color: var(--ion-color-step-700)">Welcome back, ${this.user.first_name}!</h2>
                                <h3 style="font-size: 1em; color: var(--ion-color-step-800)">How would you like to log in?</h2>
                                <ion-list>
                                    <ion-radio-group id="login_method" @ionChange=${e => this.handleSelectLoginMethod(e)} value=${ApplicationState.get('app.preferred_login_method')}>
                                        <ion-item>
                                            <ion-label>Password</ion-label>
                                            <ion-radio value="password"></ion-radio>
                                        </ion-item>
                                        <ion-item>
                                            <ion-label>A code sent to my phone</ion-label>
                                            <ion-radio value="otp"></ion-radio>
                                        </ion-item>
                                    </ion-radio-group>
                                    <ion-item>
                                        <ion-checkbox></ion-checkbox>
                                        <ion-label>Remember my choice for next time</ion-label>
                                    </ion-item>
                                </ion-list>
                            </div>
                        </ion-col>
                        <ion-col size="1" size-lg="3"></ion-col>
                    </ion-row>
                </ion-grid>

            </ion-content>
        `;

        render(this.template(), this);

    }

    render() {
        if(this.template) {
            render(this.template(), this);
        }
    }

    async handleEmailNext() {
        let user = await this.broker.get(`/api/user/${encodeURIComponent(this.email_address)}`);
        let pick_login_element = this.querySelector('#pick_login');
        pick_login_element.style.display = 'block';
    }

    async handleSelectLoginMethod(e) {
        let login_method_element = this.querySelector('#login_method');
        let router = document.querySelector('ion-router');
        await router.push('/' + login_method_element.value);
    }

}
customElements.define('scene-home', SceneHome);
export default SceneHome;