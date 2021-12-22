/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit/html.js';
import {repeat} from 'lit/directives/repeat.js';

/**
 * Utility component for selecting sort items and rearranging the sort order
 * This is intended to be launch via a ion-modal-controller
 */
class ComponentSortSelection extends HTMLElement {
    static get properties() {
        /**
         * An array of {label: ..., value: ...} items to display in the sort selection
         */
        return {
            items: {type: Array}
        };
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
    }

    constructor() {
        super();
        this.items = [];
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});

        this.template = (items) => html`
        <ion-header>
            <ion-toolbar>
                <ion-title>Sort selection</ion-title>
                <ion-buttons slot="primary">
                    <ion-button @click=${(e) => this.close()}>
                        <ion-icon slot="icon-only" name="close"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-reorder-group disabled=${false}>
            ${repeat(items, (item) => item.label, 
                (item) => html`
                    <ion-item detail=${false} button=${false} @click=${(e) => this.setState(item)} .sort_item=${item}>
                        <ion-icon name="${this.getIcon(item)}" slot="start"></ion-icon>
                        <ion-label>${item.label}</ion-label>
                        <ion-reorder slot='end'></ion-reorder>
                    </ion-item>
                `)}
            </ion-reorder-group>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-buttons slot="primary">
                    <ion-button @click=${(e) => this.done()}>
                        <ion-icon slot="start" name="checkmark"></ion-icon>
                        Done
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>

        </ion-footer>
        `;

        this.render();
        this.init();

    }

    render() {
        render(this.template(this._items), this.shadowRoot);
    }

    init() {
        let reorder_group = this.shadowRoot.querySelector("ion-reorder-group");
        reorder_group.addEventListener('ionItemReorder', async ({detail}) => {
            await detail.complete();
            let ion_items = this.shadowRoot.querySelectorAll('ion-item');
            //rebuild the item array - this is to prevent conflicts with rendering and array ordering
            let items = [];
            ion_items.forEach((ion_item) => items.push(ion_item.sort_item));
            //this is to overcome the awful bug that lit-html has with rendering arrays when ordering has changed
            this._items = items;
            this.render();
        });
    }

    close() {
        let modal_controller = window.modalController;
        modal_controller.dismiss();
    }

    done() {
        let sort = [];
        let ion_items = this.shadowRoot.querySelectorAll('ion-item');
        ion_items.forEach(
            (ion_item) => {
                let item = ion_item.sort_item;
                if(item.state !== 0)
                    sort.push(`${item.state < 0 ? '-' : ''}${item.value}`);
            }
        );
        let modal_controller = window.modalController;
        modal_controller.dismiss({sort: sort.join(','), items: this._items});
    }

    async setState(item) {
        switch(item.state) {
            case 1:
                item.selected = true;
                item.state = -1;
                break;
            case -1:
                item.selected = false;
                item.state = 0;
                break;
            case 0:
            default:
                item.selected = true;
                item.state = 1;
                break;
        }
        this.render();
    }

    getIcon(item) {
        let icon_name = '';
        switch(item.state) {
            case 1:
                icon_name = 'chevron-up-circle-outline';
                break;
            case -1:
                icon_name='chevron-down-circle-outline';
                break;
            case 0:
            default:
                icon_name='radio-button-off';
                break;
        }
        return icon_name;
    }
}

customElements.define('app-sort-selection', ComponentSortSelection);
export default ComponentSortSelection;