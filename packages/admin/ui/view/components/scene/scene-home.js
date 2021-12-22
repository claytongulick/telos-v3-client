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
                :host {
                }

                ion-col {
                    margin-top: 3vh;
                }


                /*
                #layout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 80%;
                }*/

            </style>

            <ion-header>
                <ion-toolbar>
                    <ion-buttons slot="start">
                        <ion-menu-toggle>
                            <ion-button>
                                <ion-icon slot="icon-only" name="menu"></ion-icon>
                            </ion-button>
                        </ion-menu-toggle>
                    </ion-buttons>
                    <ion-title id="title">Dashboard</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-content padding style="text-align: center;">
                <p></p>
            </ion-content>
        `;

        render(this.template({}), this.shadowRoot);

    }

}
customElements.define('scene-home', SceneHome);
export default SceneHome;