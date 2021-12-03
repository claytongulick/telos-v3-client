/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';
import broker from 'databroker';

import {html, render} from 'lit-html';
import ApplicationState from 'applicationstate';
import Inputmask from 'inputmask';

class ComponentLogin extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.template = (data) => html`
            <style>
                :host {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0px;
                    left: 0px;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                #wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                #background {
                    position: absolute;
                    opacity: 1;
                    width: 100%;
                    height: 100%;
                    top: 0px;
                    left: 0px;
                    background-color: rgba(0,0,0,.5);
                }
                #instructions {
                    width: 100%;
                    background-color: var(--ion-color-primary);
                    transition-delay: 100ms;
                    opacity: 0;
                    color: white;
                    font-size: 1.1rem;
                    margin-top: 20vh;
                }

                #login_wrapper {
                    opacity: 0;
                    transition-delay: 200ms;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    grid-gap: 30px;
                    justify-content: space-around;
                    justify-items: center;
                    /*width: 80%;*/
                    margin-top: 2vh;

                }
                #login_wrapper input {
                    background-color: rgba(255,255,255,.8);
                    border-style: solid;
                    border-width: 1px;
                    border-color: var(--ion-color-primary-tint);
                    font-size: 1.2rem;
                    padding: 10px;
                    border-radius: 5px;
                }
                #login {
                    opacity: 0;
                    transition-delay: 300ms;
                    transform: translateY(60px);
                }
                #login_button_wrapper {
                    justify-self: end;
                }
                .transition_in {
                    transition-property: transform, opacity;
                    transition-duration: 0.4s;
                }
                .transition_show {
                    transform: translateY(-60px) !important;
                    opacity: .9 !important;
                }
                .transition_show_button {
                    transform: translateY(0px) !important;
                    opacity: .9 !important;
                }
                @media only screen and (min-width: 600px) {

                }
            </style>
            <div id="wrapper">
                <div id="background"></div>
                <div id="instructions" class="transition_in ion-text-center">
                    <div style="padding: 15px;">
                    Log in with your username and password to access the Simly Done admin app. <br><br>
                    Your username should be your email address@kithandkin.app.                     </div>
                </div>
                <div id="login_wrapper" class="transition_in">
                    <div>
                        <input type="email" placeholder="Username" id="username" required>
                    </div>
                    <div>
                        <input type="password" placeholder="Password" id="password" required>
                    </div>
                    <div id="login_button_wrapper">
                        <ion-button id="login" class="transition_in">Login</ion-button>
                    </div>
                    <div id="login_error" style="color: red;"></div>
                </ion-grid>
            </div>
        `;

        this.render();
        //set up handlers
        this.login = this.shadowRoot.querySelector('#login');
        this.login.addEventListener('click', this.handleLoginUsernamePassword.bind(this));

        this.init();
    }

    render() {
        render(this.template({}), this.shadowRoot);
    }

    async init() {
        let success = false;
        let loading_controller = window.loadingController;
        let loading = await loading_controller.create({
            message: "Logging you in..."
        })
        await loading.present();

        success = await this.tryJWTLogin();
        if(success) {
            await loading.dismiss();
            return this.dispatchEvent(new Event('login_success'));
        }
        
        await loading.dismiss();

        this.showLogin();
    }

    async showLogin() {
        this.shadowRoot.querySelectorAll("#instructions, #login_wrapper").forEach(
            (item) => {
                item.classList.add('transition_show')
            }
        );
        this.shadowRoot.querySelector("#login").classList.add('transition_show_button');
    }


    async handleLoginUsernamePassword(event) {
        this.loginError('');
        this.username = this.shadowRoot.querySelector("#username");
        this.password = this.shadowRoot.querySelector("#password");
        let valid = this.username.checkValidity();
        if (!valid)
            return;
        valid = this.password.checkValidity();
        if (!valid)
            return;

        const data = {
            username: this.username.value,
            password: this.password.value
        };
        try {
            const response = await broker.post('/api/login', data);
            if(!response.jwt) {
                if(response.message) {
                    return this.loginError(response.message);
                }
                if(response.status == 'error') {
                    return this.loginError("Error logging in");
                }
            }
            const jwt = response.jwt;
            ApplicationState.set('app.jwt', jwt);
            //verify the JTW and get a user object
            const success = await this.tryJWTLogin();
            if(!success) {
                return this.loginError("There was an unexpected error logging in with user name and password, the auth token is invalid");
            }
            return this.dispatchEvent(new Event('login_success',{bubbles: true}));
        }
        catch(err) {
            this.loginError(err);
        }

    }

    parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    async tryJWTLogin() {
        try {
            this.loginError('');
            const jwt = ApplicationState.get('app.jwt');
            if(!jwt)
                return false;
            const decrypted_jwt = this.parseJwt(jwt);
            const user_id = decrypted_jwt.sub;
            const user = await broker.get('/api/users/' + user_id);
            ApplicationState.set('app.user', user, {persist: true, immutable: true});
            return true;
        }
        catch(err) {
            console.error(err);
            return false;
        }
    }

    loginError(message) {
        let login_error = this.shadowRoot.querySelector('#login_error');
        login_error.innerHTML = message;
    }


}

customElements.define("app-login", ComponentLogin);
export default ComponentLogin;
