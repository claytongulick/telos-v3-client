/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';

class SceneHome extends HTMLElement {
    connectedCallback() {
        this.attachShadow({mode: 'open'});
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

        render(this.template({}), this.shadowRoot);

    }

}
customElements.define('scene-home', SceneHome);
export default SceneHome;