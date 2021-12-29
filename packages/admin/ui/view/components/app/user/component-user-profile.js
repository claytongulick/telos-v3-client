/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import ComponentCardUser from '../cards/component-card-user';
import ComponentAvatarSelector from 'common/ui/components/component-avatar-selector';
import constants from 'common/ui/classes/constants';
import {Broker} from 'databroker';
import createMask from 'common/ui/utility/ionic-text-mask';

class ComponentUserProfile extends HTMLElement {
    constructor() {
        super();
        this.broker = new Broker();
        this._user = {
            user_name: null,
            address: {
                line_1: null,
                line_2: null,
                city: null,
                state: null,
                zip_code: null
            }

        };
    }

    get user() {
        return this._user;
    }

    set user(value) {
        this._user = value;
        this.render();
    }

    connectedCallback() {
        //this.attachShadow({mode: 'open'});
        this.template = (user) => html`
            <style>
                @media only screen and (min-width: 600px) {
                    :host {
                        margin: 4vw;
                    }
                }
                #avatar_wrapper {
                    height: 10vh;
                }
                ion-select .button-effect {
                    display: none !important;
                }
                .error_message {
                    font-size: .7rem;
                    color: var(--ion-color-danger);
                    white-space: nowrap;
                }
                .error_input {
                    --color: var(--ion-color-danger) !important;
                    --placeholder-color: var(--ion-color-danger) !important;
                }
            </style>
            <ion-content>
                <ion-item-group lines="inset">
                    <ion-item-divider>
                        <ion-label>User Information</ion-label>
                    </ion-item-divider>
                        <ion-item lines="none">
                            <ion-avatar style="width: 128px; height: 128px" id="avatar_wrapper" name="pin" slot="start" @click=${(event) => this.handleAvatarClick(event)}>
                                ${user.avatar? 
                                html`
                                <img style="height: 100%" id="avatar" src=${user.avatar}></div>
                                `
                                :
                                html`
                                <div style="height: 100%" id="no_avatar">
                                    <svg style="height: 100%" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 120 120.00001" version="1.1" id="svg8" >
                                        <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(-43.204007,-85.320039)"> 
                                            <rect style="opacity:0.98999999;fill:#e6e6e6;fill-opacity:0.24637681;stroke:#000000;stroke-width:0.06454252;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" id="rect4576" width="119.49368" height="119.93546" x="43.457169" y="85.35231" />
                                            <g id="g4574" transform="translate(126.12414,-0.65106087)"> 
                                                <path d="m 37.047129,145.97115 a 59.967239,59.967209 0 0 1 -59.715003,59.96667 59.967239,59.967209 0 0 1 -60.217354,-59.46221 59.967239,59.967209 0 0 1 59.208425,-60.466899 59.967239,59.967209 0 0 1 60.715444,58.953529" id="path4498" style="opacity:0.98999999;fill:#999999;fill-opacity:0.77064221;stroke:#000000;stroke-width:0.06547602;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" />
                                                <path id="path4500" transform="scale(0.26458333)" d="m -87.9375,395.13477 a 103.80704,103.80699 0 0 0 -102.49219,104.67187 103.80704,103.80699 0 0 0 41.75391,82.23828 141.61518,141.6151 0 0 0 -79.5625,128.29688 141.61518,141.6151 0 0 0 1.6582,19.33789 226.64785,226.64772 0 0 0 11.15235,8.40234 132.17416,132.17408 0 0 1 -3.36915,-27.82031 132.17416,132.17408 0 0 1 79.32032,-122.10352 103.80704,103.80699 0 0 0 53.285154,14.58008 103.80704,103.80699 0 0 0 52.429687,-14.5957 132.17416,132.17408 0 0 1 79.289063,118.78515 l 0.01953,2.22266 a 132.17416,132.17408 0 0 1 -3.242187,28.64063 226.64785,226.64772 0 0 0 11.042968,-7.89649 141.61518,141.6151 0 0 0 1.640625,-20.74414 l -0.01953,-2.38281 a 141.61518,141.6151 0 0 0 -79.412109,-124.84375 103.80704,103.80699 0 0 1 -0.259766,0.17578 103.80704,103.80699 0 0 0 41.882813,-83.16602 l -0.01367,-1.74804 A 103.80704,103.80699 0 0 0 -87.9375,395.13477 Z m 0.119141,9.43554 A 94.370033,94.36999 0 0 1 7.7285156,497.3457 l 0.013672,1.58789 a 94.370033,94.36999 0 0 1 -93.9726566,94.36914 94.370033,94.36999 0 0 1 -94.763671,-93.57617 94.370033,94.36999 0 0 1 93.175781,-95.15625 z" style="opacity:0.98999999;fill:#e6e6e6;fill-opacity:1;stroke:#000000;stroke-width:0.25984651;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" />
                                            </g>
                                        </g>
                                    </svg>
                                </div>
                                `
                                }
                            </ion-avatar>
                        </ion-item>
                        <ion-item>
                            <ion-label position="floating">First Name</ion-label>
                            <ion-input .value=${user.first_name} @change=${(e) => this.patch('/first_name',e.currentTarget)}></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="floating">Last Name</ion-label>
                            <ion-input .value=${user.last_name} @change=${(e) => this.patch('/last_name',e.currentTarget)}></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="floating">Email</ion-label>
                            <ion-input type="email" required="true" .value=${user.email_address} @change=${(e) => this.patch('/email_address',e.currentTarget)}></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="floating">Mobile Phone</ion-label>
                            <ion-input id="phone_cell" type="tel" .value=${user.phone_cell} @change=${(e) => this.patch('/phone_cell',e.currentTarget)}></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="floating">Account</ion-label>
                            <ion-input id="account" .value=${user.account} @change=${(e) => this.patch('/account',e.currentTarget)}></ion-input>
                        </ion-item>

                </ion-item-group>
            </ion-content>
            <ion-footer>
                <ion-toolbar>
                        <ion-buttons slot="end">
                            <ion-button @click=${(e) => this.showSendCommunication()}><ion-icon name="mail" style="margin-right: 5px"></ion-icon> Send communication</ion-button>
                        </ion-buttons>
                </ion-toolbar>
            </ion-footer>
        `;

        this.render();
        this.init();
    }

    render() {
        //if we're not connected, don't render
        if(!this.template)
            return;
        render(this.template(this.user), this);
        //make sure the text mask stays up-to-date
    }


    async init() {
        let input_phone_cell = this.querySelector('#phone_cell');
        let mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        this.mask_controller = createMask({
            inputElement: input_phone_cell,
            mask: mask,
            guide: false,
            placeholderChar: '\u2000'
        });
    }

    async patch(path, target) {
        try {
            target.parentNode.color = 'initial';
            target.classList.remove('error_input');
            if(this.error_elements) {
                this.error_elements.forEach(
                    (error_element) => {
                        error_element.parentNode.removeChild(error_element);
                    }
                );
                this.error_elements = [];
            }
            let value = target.value;
            let user = await this.broker.patch(`/api/users/${this.user.id}`, [
                {op:'replace', path: path, value: value}
            ]);
            this.user = user;
        }
        catch(err) {
            if(err.code && err.code == 418) { //I'm a teapot, validation fail
                let body = JSON.parse(err.body);
                let prop = Object.keys(body.errors)[0];
                let message = body.errors[prop].message;
                target.classList.add('error_input');
                let error_div = document.createElement('div');
                error_div.innerText = message;
                error_div.slot = "end";
                error_div.className = "error_message";
                target.parentNode.appendChild(error_div);
                if(!this.error_elements)
                    this.error_elements = [];
                this.error_elements.push(error_div);
                return;
            }
            alert(err);
        }
    }


    async handleAvatarClick(e) {
        let modal_controller = window.modalController;
        let modal = await modal_controller.create({
            component: 'app-avatar-selector',
            componentProps: {
                viewport_type: 'square',
                image_height: 256,
                image_width: 256,
                onFileSelected: (result) => this.handleAvatarSelectionResult(result),
                onCancel: () => this.handleAvatarSelectionCancel()
            }
        });
        modal.present();

    }

    handleAvatarSelectionCancel() {
        let modal_controller = window.modalController;
        modal_controller.dismiss();

    }

    async handleAvatarSelectionResult(result) {
        this.user.profile_image = result;
        this.handleAvatarSelectionCancel();
        try {
            let user = await this.broker.patch(`/api/users/${this.user.id}`, [
                {op:'replace', path: '/avatar', value: this.user.profile_image}
            ]);
            this.user = user;
        }
        catch(err) {
            alert(err);
        }
    }

    async showSendCommunication() {
        let controller = window.actionSheetController;
        let communication = {
                to: [
                    {
                        reference: this.user.id,
                        reference_type: 'User',
                        to_address: ''
                    }
                ],
                fields: {
                    path: '/app',
                    hash: '',
                    subject: ''
                },
                communication_template: '',
                communication_type: ''
        };
        let action_sheet = await controller.create({
            header: "Send communication",
            buttons: [
                {
                    text: 'Send login sms',
                    icon: 'chatboxes',
                    handler: async () => {
                        communication.communication_template = '/communication/login-sms',
                        communication.communication_type = 'sms'
                        communication.to[0].to_address = this.user.phone_cell;
                        this.sendCommunication(communication);
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close',
                    role: 'cancel',
                    handler: async () => {
                        await controller.dismiss();
                    }
                }
            ]

        });
        await action_sheet.present();

    }

    async sendCommunication(communication) {
        let toast_controller = window.toastController;
        let new_communication = await this.broker.post('/api/communication/nonce', communication, {json: true});

        let message = await toast_controller.create({
            message: "Communication job scheduled",
            duration: 2000
        });
        await message.present();
    }
}

customElements.define('app-user-profile', ComponentUserProfile);
export default ComponentUserProfile;