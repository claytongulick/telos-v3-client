import {html, render} from 'lit/html.js';

class SceneHome extends HTMLElement {
    connectedCallback() {
        this.template = (data) => html`
            <style>
            </style>

            <ion-content padding style="text-align: center;">
                <h1>Hi!</h1>
                <h2>To get started, log in below with your email address</h2>
                <ion-item>
                    <ion-label position="floating">Email address</ion-label>
                    <ion-input></ion-input>
                </ion-item>
            </ion-content>
        `;

        render(this.template({}), this);

    }

}
customElements.define('scene-home', SceneHome);
export default SceneHome;