/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';
/**
 * app.js
 *
 * This is the entry point for the application.
 *
 * @author Clay Gulick
 * @email clay@ratiosoftware.com
 */

//global scripts
//global scripts
import '@ionic/core/dist/esm';
import {defineCustomElements} from '@ionic/core/dist/esm/loader';
import '@ionic/core/css/ionic.bundle.css';
import './css/theme.css';

//the main application component
import Main from './view/components/app/component-main';

//load the state from indexedDB
import ApplicationState from "applicationstate";
import { init } from "applicationstate/plugins/indexeddb";

//load application state before we do anything else
console.log('Starting up: ' + CLIENT_ID + ' admin');
init(ApplicationState, CLIENT_ID + "_admin")
    .then(
        async () => {
            await defineCustomElements();
            //create the main component and kick off application
            let body = document.querySelector('body');
            body.style.overflowY='auto';
            body.appendChild(new Main());
        }
    );