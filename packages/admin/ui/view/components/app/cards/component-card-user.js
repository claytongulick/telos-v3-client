/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from "lit-html";

class ComponentCardUser extends HTMLElement {


    static get styles() {
    }

    constructor() {
        super();
        this.user = {
            username: '',
            account: '',
            account_status: 'active',
            email_address: '',
            first_name: '',
            last_name: '',
            long_name: '',
            phone_cell: '',
            photo_path: '',
            last_login_date: '',
            user_created_date: '',
            role_name: '',
        }
    }

    connectedCallback() {
        this.template = () => html`
            <ion-card style="background-color: white">
                <ion-item>
                    <ion-avatar style="position: relative" id="avatar_wrapper" name="pin" slot="start"}>
                        ${this.user.avatar? 
                        html`
                        <img style="
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            top: 0px;
                            left: 0px;
                        
                        " id="avatar" src=${this.user.avatar}></div>
                        `
                        :
                        html`
                        <div style="
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            top: 0px;
                            left: 0px;
                        " id="no_avatar">
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
                    <ion-card-header>
                        <ion-card-subtitle>${this.user.username}</ion-card-subtitle>
                        <ion-card-title>${this.user.long_name}</ion-card-title>
                        ${this.user.account ?
                        html`
                        <ion-label style="margin-top: 5px;font-size: 12px;"><b>Account:</b> ${this.user.account} </ion-label>
                        `:''}
                        </ion-card-header>
                </ion-item>
                <ion-card-content>
                    <ion-button @click=${() => {this.handleViewUser()}} fill="outline" slot="end">View</ion-button>
                </ion-card-content>
            </ion-card>:
        `;
        this.render();

    }

    render() {
        if(this.template)
            render(this.template(), this);
    }

    handleViewUser() {
        let router = document.querySelector('ion-router');
        router.push(`/users/${this.user._id}`)
    }

}

customElements.define('app-card-user', ComponentCardUser);
export default ComponentCardUser;