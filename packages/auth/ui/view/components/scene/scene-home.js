/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import ApplicationState from 'applicationstate';

class SceneHome extends HTMLElement {
    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.template = (data) => html`
            <style>
            </style>

            <ion-content padding style="text-align: center;">
                <h1>Hi!</h1>
                <h2>To sign in, let's start with your email address:</h2>
                <div>
                    <ion-item>
                        <ion-input placeholder="Email address"></ion-input>
                        <ion-button @click=${e => this.handleEmailNext()}>Next</ion-button>
                    </ion-item>
                </div>
                <div id="pick_login" style="display: none;">
                    <ion-list>
                        <ion-radio-group id="login_method" @ionChange=${e => this.handleSelectLoginMethod(e)} value=${ApplicationState.get('app.preferred_login_method')}>
                            <ion-list-header>
                                <ion-label>How would you like to log in?</ion-label>
                            </ion-list-header>
                            <ion-item>
                                <ion-label>Password</ion-label>
                                <ion-radio value="password"></ion-radio>
                            </ion-item>
                            <ion-item>
                                <ion-label>A code sent to my phone</ion-label>
                                <ion-radio value="otp"></ion-radio>
                            </ion-item>
                        </ion-radio-group>
                    </ion-list>
                </div>

            </ion-content>
        `;

        render(this.template({}), this.shadowRoot);

    }

    render() {
        if(this.template) {
            render(this.template(), this);
        }
    }

    handleEmailNext() {
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