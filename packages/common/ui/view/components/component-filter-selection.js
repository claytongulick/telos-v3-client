/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, render} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat';

/**
 * Display a list of filters that can be used generically for any search.
 * 
 * Returns an object that can be directly passed to mongoose find()
 * 
 * items is an array, each element should look like:
 * {
 *   //the type of widget
 *   type: <'boolean' | 'string' | 'date-range' | 'switch' | 'select'>, 
 *   //the label displayed to the user for the item
 *   label: <String>,
 *   //data to use for switch or select filters, or default values for ranges etc...
 *   data: [{label: String, value: any}],
 *   //the name of the filter to use in the returned query object
 *   filter_name: <String>,
 *   //the current value of the filter
 *   value: <any>
 * }
 */
class ComponentFilterSelection extends HTMLElement {
    constructor() {
        super();
        this._items = [];
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
        this.render();
    }

    connectedCallback() {
        this.template = () => html`
        <ion-header>
            <ion-toolbar>
                <ion-title>Filter selection</ion-title>
                <ion-buttons slot="primary">
                    <ion-button @click=${(e) => this.close()}>
                        <ion-icon slot="icon-only" name="close"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-items>
                ${repeat(this.items, item => item.filter_name, item => this.renderItem(item))}
            </ion-items>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <ion-buttons slot="primary">
                    <ion-button @click=${(e) => this.clear()}>
                        <ion-icon slot="start" name="radio-button-off"></ion-icon>
                        Clear all
                    </ion-button>
                    <ion-button @click=${(e) => this.done()}>
                        <ion-icon slot="start" name="checkmark"></ion-icon>
                        Done
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>

        </ion-footer>
        `;
        this.render();
    }

    render() {
        if(this.template)
            render(this.template({}), this);
    }

    //type: <'boolean' | 'string' | 'date-range' | 'switch' | 'select'>, 
    renderItem(item) {
        switch(item.type) {
            case 'boolean':
                return this.renderBooleanItem(item);
            case 'string':
                return this.renderStringItem(item);
            case 'date-range':
                return this.renderDateRangeItem(item);
            case 'switch':
                return this.renderSwitchItem(item);
            case 'select':
                return this.renderSelectItem(item);
            default:
                throw new Error(`Unknown item: ${item.type}`);
        }

    }

    renderBooleanItem(item) {
        return html`
            <ion-item>
                <ion-label slot='start'>${item.label}</ion-label>
                <ion-toggle slot='end' ?checked=${item.value} @ionChange=${
                    e => {
                        item.value = e.detail.checked;
                        this.render();
                    }
                }></ion-toggle>
            </ion-item>
        `;
    }

    renderStringItem(item) {
        return html`
            <ion-item>
                <ion-label slot='start'>${item.label}</ion-label>
                <ion-input .value=${item.value} @ionChange=${
                    e => {
                        item.value = e.detail.value;
                        this.render();
                    }
                }></ion-input>
            </ion-item>
        `;
    }

    renderDateRangeItem(item) {
        return html`
            <ion-item>
                <ion-label slot='start'>${item.label}</ion-label>
                <ion-datetime .value=${item.value ? item.value.from : null} display-format="MM/DD/YY" placeholder="From date"
                    @ionChange=${
                        e => {
                            if(!item.value)
                                item.value = {};
                            item.value.from = e.detail.value;
                            this.render();
                        }
                    }></ion-datetime>
                <ion-datetime .value=${item.value ? item.value.to : null} display-format="MM/DD/YY" placeholder="To date"
                    @ionChange=${
                        e => {
                            if(!item.value)
                                item.value = {};
                            item.value.to = e.detail.value;
                            this.render();
                        }
                    }></ion-datetime>
            </ion-item>
        `;
    }

    renderSwitchItem(item) {
        return html`
            <ion-item>
                <ion-label slot='start'>${item.label}</ion-label>
                <ion-select .value=${item.value ? item.value : []} placeholder=${item.placeholder} multiple="true" @ionChange=${
                    e => {
                        item.value = e.detail.value;
                        this.render();
                    }
                }>
                    ${item.data.map(
                        option => html`
                        <ion-select-option value=${option.value}>${option.label}</ion-select-option>
                        `
                    )}
                </ion-select>
            </ion-item>
        `;
    }

    renderSelectItem(item) {
        return html`
            <ion-item>
                <ion-label slot='start'>${item.label}</ion-label>
                <ion-select .value=${item.value} placeholder=${item.placeholder} multiple="false" @ionChange=${
                    e => {
                        item.value = e.detail.value;
                    }
                }>
                    ${item.data.map(
                        option => html`
                        <ion-select-option value=${option.value}>${option.label}</ion-select-option>
                        `
                    )}
                </ion-select>
            </ion-item>
        `;
    }

    getFilters() {
        let filters = {};
        for(let item of this.items) {
            if(item.value == null)
                continue;
            if(typeof item.value == 'undefined')
                continue;

            switch(item.type) {
                case 'boolean':
                    filters[item.filter_name] = item.value;
                    break;
                case 'string':
                    filters[item.filter_name] = {
                        $regex: `^${item.value}.*`,
                        $options: 'i'
                    }
                    break;
                case 'switch':
                    if(item.value.length == 0)
                        continue;
                    filters[item.filter_name] = {
                        $in: item.value
                    }
                    break;
                case 'select':
                    filters[item.filter_name] = item.value.value;
                    break;
                case 'date-range':
                    let filter = {};
                    if(!item.value.from && !item.value.to)
                        continue;
                    if(item.value.from)
                        filter.$gt = item.value.from;
                    if(item.value.to)
                        filter.$lt = item.value.to;
                    filters[item.filter_name] = filter;

                    break;
                default:
                    throw new Error(`Unknown type: ${item.type}`);
                
            }
        }
        return filters;
    }


    close() {
        let modal_controller = window.modalController;
        modal_controller.dismiss();
    }

    clear(){ {
        for(let item of this.items)
            item.value = null;
        this.render();
    }}

    done() {
        let modal_controller = window.modalController;
        modal_controller.dismiss({filters: this.getFilters(), items: this._items});
    }
}

customElements.define('app-filter-selection', ComponentFilterSelection);
export default ComponentFilterSelection;