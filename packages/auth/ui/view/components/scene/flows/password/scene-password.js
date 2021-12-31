import {html, render} from 'lit/html.js';
import ApplicationState from 'applicationstate';

class ScenePassword extends HTMLElement {
    connectedCallback() {
        this.template = (data) => html`
            <style>
            </style>

            <ion-content padding style="text-align: center;">
                <ion-item>
                    <ion-label position="floating">Password</ion-label>
                    <ion-input></ion-input>
                </ion-item>
                <div @click=${e => this.handleDifferentLogin()}
                    style="color: var(--ion-color-secondary); font-size: 10px; margin-top: 10px; font-style: underline;">
                    I'd like to log in a different way
                </div>
            </ion-content>
        `;

        render(this.template({}), this);

    }

    async handleDifferentLogin() {
        ApplicationState.set('app.preferred_login_method','');
        let router = document.querySelector('ion-router');
        await router.push('/','back');

    }

}
customElements.define('scene-password', ScenePassword);
export default ScenePassword;