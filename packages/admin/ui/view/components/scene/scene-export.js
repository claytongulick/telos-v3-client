/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import download from 'downloadjs';

import broker from 'databroker';

class SceneExport extends HTMLElement {

    constructor() {
        super();
        this.models = [
            {
                model: 'user_report',
                label: 'Users',
                icon: 'people-circle-outline',
                description: 'Information about users, access and system usage.'
            },
            {
                model: 'project_report',
                label: 'Projects',
                icon: 'people',
                description: 'All projects in the system'
            },
            {
                model: 'Communication',
                label: 'Communications',
                icon: 'mail',
                description: 'All communication records for SMS or emails that have been generated by the system'
            },
        ]
    }

    connectedCallback() {
        this.template = () => html`
            <ion-header>
                <ion-toolbar>
                    <ion-buttons slot="start">
                        <ion-menu-toggle>
                            <ion-button>
                                <ion-icon slot="icon-only" name="menu"></ion-icon>
                            </ion-button>
                        </ion-menu-toggle>
                    </ion-buttons>
                    <ion-title id="title">Export Data</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-content padding style="text-align: center;">
                <ion-grid>
                    <ion-row>
                    ${
                        this.models.map(
                            (model) => html`

                                <ion-col size="12" size-sm="12" size-md="6" size-lg="6">
                                    <ion-card style="background-color: white">
                                        <ion-item>
                                            <ion-card-header>
                                                <ion-card-title style="line-height: 24px"> <ion-icon name=${model.icon}></ion-icon> ${model.label}<ion-card-title>
                                                <ion-card-subtitle>${model.description}</ion-card-subtitle>
                                            </ion-card-header>
                                        </ion-item>

                                        <ion-card-content>
                                            <ion-button @click=${() => {this.handleExportClick(model.model)}} fill="outline" slot="end">Export</ion-button>
                                        </ion-card-content>
                                    </ion-card>
                                </ion-col>
                                        `
                                    )
                    }
                    </ion-row>
                </ion-grid>
            </ion-content>
        `;
        this.render();
    }

    async handleExportClick(model) {
        let now = new Date();
        let datestring = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2,'0')}${(now.getDate() + 1).toString().padStart(2,'0')}`;
        let result = await broker.get(`/api/exports/collections/${model}`,null,{blob: true});
        download(result, `${model}_export_${datestring}.csv`,'text/csv');
    }

    render() {
        render(this.template({}), this);
    }

}

export default SceneExport;
customElements.define('scene-export', SceneExport);