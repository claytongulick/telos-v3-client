/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import createMask from '../../../../../shared/view/ionic-text-mask';
import Messaging from '../../../../../shared/view/binding/binding-messaging';

class ComponentUserNew extends HTMLElement {
    constructor() {
        super();
        this._user = {
            first_name: '',
            last_name: '',
            email_address: '',
            phone_cell: '',
            role_name: 'member',
            profile: {}
        };
    }

    connectedCallback() {
        this.template = () => html`
            <ion-header>
                <ion-toolbar>
                    <ion-buttons slot="end">
                        <ion-button @click=${()=>this.handleCancel()}>
                            <ion-icon slot="icon-only" name="close-circle"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                    <ion-title>New User</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <ion-item-group>
                    <ion-item>
                        <ion-label position="floating">User role</ion-label>
                        <ion-select @ionChange=${e => {
                                this._user.role_name = e.target.value; 
                                this.render();
                            }} 
                            value=${this._user.role_name}>
                            <ion-select-option value='member'>Member</ion-select-option>
                            <ion-select-option value='admin'>Admin</ion-select-option>
                        </ion-select>
                    </ion-item>
                </ion-item-group>
                ${this._user.role_name == 'member' ? 
                html`
                <ion-item-group>
                    <ion-item>
                        <ion-label position="floating">Birth date</ion-label>
                        <ion-datetime .value=${this._user?.profile?.birth_date} display-format="MM/DD/YY"
                            @ionChange=${
                                e => {
                                    this._user.profile.birth_date = e.detail.value;
                                }
                            }></ion-datetime>
                    </ion-item>
                </ion-item-group>
                `:''}
                <ion-item-group>
                    <ion-item>
                        <ion-label position="floating">First name</ion-label>
                        <ion-input type="text" @ionChange=${e => this._user.first_name = e.target.value} value=${this._user.first_name}>
                    </ion-item>
                    <ion-item>
                        <ion-label position="floating">Last name</ion-label>
                        <ion-input type="text" @ionChange=${e => this._user.last_name = e.target.value} value=${this._user.last_name}>
                    </ion-item>
                    <ion-item>
                        <ion-label position="floating">Email address</ion-label>
                        <ion-input type="email" @ionChange=${e => this._user.email_address = e.target.value} value=${this._user.email_address}>
                    </ion-item>
                    <ion-item>
                        <ion-label position="floating">Mobile number</ion-label>
                        <ion-input id="phone_cell" type="text" @ionChange=${e => this._user.phone_cell = e.target.value} value=${this._user.phone_cell}>
                    </ion-item>
                </ion-item-group>
            </ion-content>
            <ion-footer>
                <ion-toolbar>
                    <ion-buttons slot="primary">
                        <ion-button @click=${(e) => this.handleCancel()}>
                            <ion-icon slot="start" name="close-circle"></ion-icon>
                            <ion-label>Cancel</ion-label>
                        </ion-button>
                        <ion-button @click=${(e) => this.handleAddUser()}>
                            <ion-icon slot="start" name="checkmark"></ion-icon>
                            <ion-label>Add User</ion-label>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>

            </ion-footer>
        `;

        this.render();
        this.init();

    }

    render() {
        if(this.template) {
            render(this.template({}), this);
        }
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

    async handleCancel() {
        let modalController = window.modalController;
        await modalController.dismiss();
    }

    async handleAddUser() {
        let modalController = window.modalController;
        let valid = await this.validate();
        if(valid)
            await modalController.dismiss(this._user);
    }

    async validate() {
        if(!this._user.first_name)
            return await Messaging.toast('First name is required');
        if(!this._user.last_name)
            return await Messaging.toast('Last name is required');
        if(!this._user.email_address)
            return Messaging.toast('Email is required');
        let email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!email_regex.test(this._user.email_address)) 
            return await Messaging.toast('Please provide a valid email address (username@somewhere.com)');

        let phone_number = this._user.phone_cell;
        let phone_number_regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
        if(!phone_number_regex.test(this._user.phone_cell)) 
            return await Messaging.toast('Please provide a valid phone number (123-456-7890)');

        this._user.phone_cell = phone_number.replace(/[^0-9\+]/g,'');
        if(!this._user.role_name)
            return await Messaging.toast('Please select a valid role for the new user');

        if(this._user.role_name == 'member')
            if(!this._user?.profile?.birth_date)
                return await Messaging.toast('Birth date is required for members');

        return true;
    }
}

customElements.define('app-user-new', ComponentUserNew);
export default ComponentUserNew;