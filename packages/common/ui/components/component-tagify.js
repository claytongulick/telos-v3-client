/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {render, html} from 'lit/html.js';
import '@yaireo/tagify/dist/tagify.css';
import Tagify from '@yaireo/tagify';

class ComponentTagify extends HTMLElement {
    constructor() {
        super();
    }

    get tags() {
        return this._tags;
    }

    set tags(value) {
        this._tags = value;
        if(this._rendered) {
            this.tagify.destroy();
            this.init();
        }
    }

    connectedCallback() {
        this.template = () => html`
            <input type="text" placeholder="Search for a #tag or @mention or anything">
        `;
        this.render();
        this.init();
    }

    render() {
        if(this.template) {
            render(this.template({}), this);
            this._rendered = true;
        }
    }

    init() {
        this.input = this.querySelector('input');
        this.tagify = new Tagify(this.input, {
            mode: 'mix',
            pattern: /[\#.+]/,
            duplicates: false,
            autocomplete: {
                enabled: true
            },
            whitelist: this.tags,
            dropdown: {
                enabled: 0,
                position: 'text'
            },
            templates: {
                wrapper(input, settings){
                    return `<tags class="tagify ${settings.mode ? "tagify--" + settings.mode : ""} ${input.className}"
                                        ${settings.readonly ? 'readonly aria-readonly="true"' : 'aria-haspopup="listbox" aria-expanded="false"'}
                                        role="tagslist"
                                        tabIndex="-1">
                                <div style="display: flex; flex-direction: row; align-items: center;">
                                    <ion-icon name="search" color="primary" style="font-size: 20px; margin-left: 3px"></ion-icon>
                                    <span contenteditable data-placeholder="${settings.placeholder || '&#8203;'}" aria-placeholder="${settings.placeholder || ''}"
                                        class="tagify__input"
                                        role="textbox"
                                        aria-controls="dropdown"
                                        aria-autocomplete="both"
                                        aria-multiline="${settings.mode=='mix'?true:false}"></span>
                                </div>
                            </tags>`
                },

                tag(tagData){
                    return `<tag title='${tagData.title}'
                                contenteditable='false'
                                spellcheck='false'
                                tabIndex="-1"
                                class='tagify__tag ${tagData.class ? tagData.class : ""}'
                                ${this.getAttributes(tagData)}>
                        <x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
                        <div>
                            <span class='tagify__tag-text'>${tagData.value}</span>
                        </div>
                    </tag>`
                },

                dropdownItem( item ){
                    var mapValueTo = this.settings.dropdown.mapValueTo,
                        value = (mapValueTo
                            ? typeof mapValueTo == 'function'
                                ? mapValueTo(item)
                                : item[mapValueTo]
                            : item.value) || item.value,
                        sanitizedValue = (value || item).replace(/`|'/g, "&#39;");

                    return `<div ${this.getAttributes(item)}
                                class='tagify__dropdown__item ${item.class ? item.class : ""}'
                                tabindex="0"
                                role="option"
                                aria-labelledby="dropdown-label">${sanitizedValue}</div>`;
                }
            }
        });
        this.tagify.on('input', () => {
            if(this.debounce_timeout)
                clearTimeout(this.debounce_timeout);
            this.debounce_timeout = setTimeout(
                () => {
                    this.dispatchEvent(
                        new CustomEvent('change', 
                            {
                                composed: true, 
                                bubbles: true, 
                                detail: {
                                    tags: this.tagify.value,
                                    text: this.getText()
                                }
                            }
                        )
                    );
                },
                300
            );
        });
        this.tagify.on('add', () => {
            this.dispatchEvent(
                new CustomEvent('change', 
                    {
                        composed: true, 
                        bubbles: true, 
                        detail: {
                            tags: this.tagify.value,
                            text: this.getText()
                        }
                    }
                )
            );
        });
        this.tagify.on('remove', () => {
            this.dispatchEvent(
                new CustomEvent('change', 
                    {
                        composed: true, 
                        bubbles: true, 
                        detail: {
                            tags: this.tagify.value,
                            text: this.getText()
                        }
                    }
                )
            );
        });
    }

    getText() {
        let value = this.input.value;
        let stripped = '';
        let state = 0; //0 = text node, 1 = begin token 2=in token 3=begin end
        //quick and dirty parser with mini-FSM
        for(let char of value) {
            switch(char) {
                case '[':
                    if(state == 1)
                        state = 2;
                    else(state = 1)
                    break;
                case ']':
                    if(state == 2)
                        state = 3
                    else {
                        //add a space to the text to separate the words
                        stripped += ' ';
                        state = 0;
                    }
                    break;
                case '#':
                case '@':
                    continue;
                default:
                    if(state == 0)
                        stripped += char;
            }
        }
        return stripped;

    }
}

customElements.define('app-tagify', ComponentTagify);
export default ComponentTagify;