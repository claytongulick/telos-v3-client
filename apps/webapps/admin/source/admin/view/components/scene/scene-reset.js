/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import ComponentBase from '../../../../shared/view/components/component-base-vanilla';

class SceneReset extends ComponentBase {
    constructor() {
        super();
    }


    connectedCallback() {
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = '<slot></slot>';
        this.template = (user) => html`
        <style>
                :host {
                    justify-content: flex-start !important;
                    position: relative;
                    background-color: #f0f0f0;
                }
                #scene_user_content {
                    --padding-top: 1vh;
                    --padding-bottom: 1vh;
                    --padding-start: 1vw;
                    --padding-end: 1vw;
                }
        </style>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title id="title">Reset Device</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <h3>Warning!</h3>
            <p>This will clear out all data for the application, and prompt you to log in again.</p>
            <p>Are you sure you want to do this?</p>
            <ion-button color="warning" @click=${(e) => this.reset()}>Reset</ion-button>
        </ion-content>
        `;

        this.render();
        this.init();

    }

    render() {
        render(this.template(this.user), this);
    }

    async init() {

    }

    reset() {
        console.log('Deleting: ' + CLIENT_ID + "_app");
        let delete_request = window.indexedDB.deleteDatabase(CLIENT_ID + "_app");

        delete_request.onerror = function (event) {
            alert("There was a problem resetting the data - please contact tech support");
        };

        delete_request.onsuccess = function (event) {
            //now delete the files database
            console.log('Deleting: ' + CLIENT_ID + "_upload_queue");
            let files_delete_request = window.indexedDB.deleteDatabase(CLIENT_ID + "_upload_queue");

            files_delete_request.onerror = function (event) {
                alert("There was a problem resetting the file data - please contact tech support");
            };

            files_delete_request.onsuccess = function (event) {
                let url = new URL(window.location.toString());
                url.pathname = '/app';
                url.hash = '';
                url.search = '';
                window.location.assign(url.toString());
            }
        };
    }


}

customElements.define('scene-reset', SceneReset);
export default SceneReset;