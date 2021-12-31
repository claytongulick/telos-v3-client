/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import {classMap} from 'lit-html/directives/class-map';
import ApplicationState from 'applicationstate';
import Messaging from '../../../../shared/view/binding/binding-messaging';
import broker from '../../../../shared/isolate/isolate-data_broker';
import otp_image from '../../../../../image/otp-code.svg';

class SceneLoginOTP extends HTMLElement {

    get invited_user() {
        return this._invited_user;
    }

    set invited_user(value) {
        this._invited_user = value;
    }

    constructor() {
        super();
        this.send_sms = true;
    }

    connectedCallback() {
        this._template = () => html`
        <ion-content>
        <div style="
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-left: 32px;
            padding-right: 32px;
        ">
            <div id="enter_code"
                style="
                    width: 100%;
                    height: 100%;
                    background-color: #fafafa;
                    padding-left: 16px;
                    padding-right: 16px;
                "
            >
                <div style="
                    font-style: normal;
                    font-weight: 800;
                    font-size: 26px;
                    line-height: 36px;
                    letter-spacing: 0.02em;
                    margin-top: 32px;
                ">
                    Enter the code we sent to log in.
                </div>
                <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                    <input type="text" 
                        id="otp_code"
                        autocomplete="one-time-code"
                        maxlength="6"
                        spellcheck="false"
                        @keyup=${e => {
                            e.target.scrollLeft = 0;
                        }}
                        @keydown=${e => {
                            e.target.scrollLeft = 0;
                        }}
                        style="
                            color: var(--ion-color-primary);
                            text-transform: uppercase;
                            background-color: #fafafa;
                            margin-top: 16px;
                            padding-left: 17px;
                            font-family: Courier New;
                            font-size: 32px;
                            font-weight: bold;
                            font-style: normal;
                            text-decoration: none !important;
                            border-bottom: none !important;
                            letter-spacing: 36px;
                            border: 0;
                            background-image: url(/auth/image/otp-code.svg);
                            background-size: 55px 64px;
                            background-repeat: space no-repeat;
                            width: 332px;
                            height: 64px;
                        "
                        >
                </div>
                <div id="login_error_message" style="
                    font-size: 10px;
                    font-weight: bold;
                    color: red;
                "></div>
                <div style="
                    margin-top: 30%;
                    font-style: normal;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 18px;
                    letter-spacing: 0.01em;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                ">
                    <div style="
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <ion-button 
                            size="default"
                            style="" 
                            @click=${e => this.loginWithCode()}
                        >
                            Log in
                        </ion-button>
                    </div>
                </div>
            </div>
        </div>
        </ion-content>
        `;

        this.init();
        this.render();
        this.initOTP();
    }

    render() {
        if(this._template)
            render(this._template(), this);
    }

    async init() {

    }

    async initOTP() {
        let input_element = document.querySelector('input[autocomplete="one-time-code"]');
        input_element.focus();
        if ('OTPCredential' in window) {
            if (!input_element) return;
            this._abort_controller = new AbortController();
            console.info("Requesting SMS OTP access...");
            let otp = await navigator.credentials.get({
                otp: { transport: ['sms'] },
                signal: this._abort_controller.signal
            });
            console.info("Received otp: " + JSON.stringify(otp));
            input_element.value = otp.code;
            await this.loginWithCode();
        }
    }

    async loginWithCode() {
        if(this._abort_controller)
            this._abort_controller.abort();

        let error_message_element = this.querySelector('#login_error_message');
        let code_element = this.querySelector('#otp_code');
        let login_user = ApplicationState.get('app.login_user');
        let email_address = login_user.email_address;

        try {
            let response = await broker.post('/api/otp', {
                email_address: email_address,
                code: code_element.value
            });
            let user = await broker.get('/api/whoami');
            await ApplicationState.set('app.user', user);
            let url = new URL(window.location.toString());
            let redirect = url.searchParams.get('redirect_url');
            if(redirect) {
                window.location.href = '/auth/redirect?redirect_url=' + redirect;
                return;
            }

            window.location.href = '/auth/redirect';
        }
        catch (err) {
            error_message_element.innerHTML = 'There was a problem logging you in, please check the code and try again.';
            throw err;
        }
    }

}

customElements.define('scene-login-otp', SceneLoginOTP);
export default SceneLoginOTP;