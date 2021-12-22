/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {LitElement, html, css} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import croppie_styles from "!css-loader!croppie/croppie.css";
import Croppie from 'croppie';
import 'script-loader!exif-js/exif';

class ComponentAvatarSelector extends LitElement {

    static get properties() {
        return {
            box_classes: {type: Object},
            viewport_type: {type: String},
            image_width: {type: Number},
            image_height: {type: Number},
            image_quality: {type: Number},
            image_type: {type: String}
        }
    }

    static get styles() {
        return [
        css`
            :host {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                width: 100%;
            }
            #box {
                font-size: 1.25rem; /* 20 */
                position: relative;
                padding: 100px 20px;
                background-color: white;
                outline: 2px dashed black;
                outline-offset: -10px;
                transition: outline-offset .15s ease-in-out, background-color .15s linear;
                margin-bottom: 40px;
            }
            #box.is_dragover {
                outline-offset: -20px;
                outline-color: #c8dadf;
                background-color: #c8dadf;

            }
            #box_icon {
                width: 100%;
                height: 80px;
                fill: #92b0b3;
                display: block;
                margin-bottom: 40px;
            }
            #box_file {
                width: 0.1px;
                height: 0.1px;
                opacity: 0;
                overflow: hidden;
                position: absolute;
                z-index: -1;
            }
            #box_file + label {
                text-align: center;
                width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                cursor: pointer;
                display: inline-block;
                overflow: hidden;
            }
            #box_file + label:hover strong,
            #box_file:focus + label strong,
            #box_file.has-focus + label strong { color: #39bfd3; }
            #box_file:focus + label,
            #box_file.has-focus + label { outline: 1px dotted #000; outline: -webkit-focus-ring-color auto 5px; }
            #box_dragndrop { display: inline; }

            #cropper {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0px;
                left: 0px;
                display: none;
                background-color: white;
            }

            #button-container {
                width: 100%;
                text-align: right;
            }

        `];
    }

    constructor() {
        super();
        this.box_classes = {
            is_dragover: false
        }
    }

    get onFileSelected() {
        return this._onFileSelected;
    }

    /**
     * A function that should be called with the results when 'done' is clicked
     */
    set onFileSelected(value) {
        this._onFileSelected = value;
    }

    get onCancel() {
        return this._onCancel;
    }

    /**
     * A function value that should be called on cancel click
     */
    set onCancel(value) {
        this._onCancel = value;
    }


    render() {
        return html`
            <style>
                ${croppie_styles.toString()}
            </style>
            <form id="box" 
                class=${classMap(this.box_classes)}
                @drag=${this.handleDrag}
                @dragstart=${this.handleDragStart}
                @dragend=${this.handleDragEnd}
                @dragover=${this.handleDragOver}
                @dragenter=${this.handleDragEnter}
                @dragleave=${this.handleDragLeave}
                @drop=${this.handleDragDrop}
                >
                <div id="box_input">
                    <svg id="box_icon" xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43"><path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z"></path></svg>
                    <input id="box_file" type="file" name="avatar" id="file" @change=${this.handleSelectFile} />
                    <label for="box_file"><strong>Choose a file</strong><span id="box_dragndrop"> or drag it here</span>.</label>
                </div>
                <div id="cropper"></div>
            </form>
            <div id="button-container">
                <ion-button @click=${(e) => this.handleCancelClick(e)}>Cancel</ion-button>
                <ion-button @click=${(e) => this.handleDoneClick(e)}>Done</ion-button>
            </div>
            
        `;
    }

    firstUpdated() {
    }

    handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();

    }

    handleDragStart(e) {
        e.preventDefault();
        e.stopPropagation();

    }

    handleDragEnd(e) {
        e.preventDefault();
        e.stopPropagation();
        this.box_classes = {
            is_dragover: false 
        }

    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();

        this.box_classes = {
            is_dragover: true
        }

    }

    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();

        this.box_classes = {
            is_dragover: true
        }

    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.box_classes = {
            is_dragover: false
        }

    }

    handleDragDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.box_classes = {
            is_dragover: false
        }

        let files = e.dataTransfer.files;
        if(!files.length)
            return;
        this.file = files[0];
        this.showSelectedFile();
    }

    handleSelectFile(e) {
        this.file = e.target.files[0];
        this.showSelectedFile();
    }

    showSelectedFile() {
        this.shadowRoot.querySelector("#cropper").style.display = "block";
        let reader = new FileReader();

        reader.addEventListener("load",
            async (e) => {
                let container = this.shadowRoot.querySelector("#cropper");
                let rect = container.getBoundingClientRect();
                let viewport_width = this.image_width || 128;
                let viewport_height = this.image_height || 128;
                if(rect.width < viewport_width)
                    viewport_width = rect.width;
                if(rect.height < viewport_height)
                    viewport_height = rect.height;

                this.croppie = new Croppie(
                    container,
                    {
                        showZoomer: true,
                        enableExif: true,
                        enableOrientation: true,
                        //boundary: {width: viewport_width, height: viewport_height},
                        viewport: {
                            width: viewport_width,
                            height: viewport_width, //constrain to a square to prevent weird squishing
                            type: this.viewport_type || 'circle'
                        }
                    });
                await this.croppie.bind({
                    url: e.target.result,
                    size: {width: this.image_width, height: this.image_height}
                });

            });
        reader.readAsDataURL(this.file);
    }

    async handleDoneClick(e) {
        if(this.onFileSelected) {
            let image_type = this.image_type || 'base64';
            let result = await this.croppie.result({
                type: image_type,
                size: {width: this.image_width || 128, height: this.image_height || 128},
                format: 'png',
                quality: this.image_quality || .7,
                circle: this.viewport_type == 'circle'
            });

            await this.onFileSelected(result);
        }
    }

    async handleCancelClick(e) {
        if(this.onCancel)
            await this.onCancel();

    }

}

customElements.define('app-avatar-selector', ComponentAvatarSelector);
export default ComponentAvatarSelector;