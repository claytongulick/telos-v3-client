import {html, render} from 'lit/html.js';
import ApplicationState from 'applicationstate';
import {Broker} from 'databroker';
import Messaging from 'common/ui/utility/messaging';

class ScenePassword extends HTMLElement {
    constructor() {
        super();
        this.broker = new Broker();
        this.user = ApplicationState.get('app.login_user');
        ApplicationState.listen('app.login_user', (user) => {
            this.user = user;
            this.render();
        })
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
                            <h2 style="font-size: 1.2em; color: var(--ion-color-step-700)">To log in as ${this.user.email_address} just enter your password below.</h2>
                            <ion-item>
                                <ion-label position="floating">Password</ion-label>
                                <ion-input id='login_password' @keydown=${e => {
                                    if(e.keyCode == 13) {
                                        this.handleLogin();
                                    }
                                }} type="password"></ion-input>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-button slot="end" @click=${e => this.handleLogin()} size="default">Log In</ion-button>
                            </ion-item>
                            <div @click=${e => this.handleDifferentLogin()}
                                style="cursor: pointer; color: var(--ion-color-secondary); font-size: 12px; margin-top: 10px; font-style: underline;">
                                I'd like to log in a different way
                            </div>
                            <div @click=${e => this.handleDifferentUser()}
                                style="cursor: pointer; color: var(--ion-color-secondary); font-size: 12px; margin-top: 10px; font-style: underline;">
                                I'm not ${this.user.email_address}
                            </div>
                        </ion-col>
                        <ion-col size="1" size-lg="3"></ion-col>
                    </ion-row>
                </ion-grid>
            </ion-content>
        `;

        this.init();
        this.render();
    }

    async init() {
        if(this.user)
            return;

        let router = document.querySelector('ion-router');
        await router.push('/');
    }

    render() {
        if(this.template && this.user)
            render(this.template(), this);
    }

    async handleLogin() {
        let router = document.querySelector('ion-router');
        let username = ApplicationState.get('app.login_email_address');
        let password = this.querySelector('#login_password').value;
        if(!username)
            router.push('/');
        if(!password)
            Messaging.toast('Please enter a password to log in');

        try {
            await this.broker.post(`/api/password`, { username, password });
            let redirect_url = ApplicationState.get('app.redirect_url');
            if(redirect_url)
                window.location = '/auth/redirect?redirect_url=' + redirect_url;
            else
                window.location= '/auth/redirect';
        }
        catch(err) {
            if(err.code == '403') {
                return Messaging.toast("There was an error logging you in, please check your password and try again.")
            }
            else {
                return Messaging.toast("There was an internal error when trying to log you in. Please try a different login method. If this problem persists, please contact support.")
            }
        }
    }

    async handleDifferentLogin() {
        ApplicationState.set('app.preferred_login_method','');
        ApplicationState.set('app.side_image','');
        let router = document.querySelector('ion-router');
        await router.push('/','back');

    }

    async handleDifferentUser() {
        ApplicationState.set('app.preferred_login_method','');
        ApplicationState.set('app.login_user','');
        ApplicationState.set('app.login_email_address','');
        ApplicationState.set('app.side_image','');

        let router = document.querySelector('ion-router');
        await router.push('/','back');

    }

}
customElements.define('scene-password', ScenePassword);
export default ScenePassword;