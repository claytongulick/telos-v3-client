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
import 'common/ui/css/theme.css';

//configure the databroker to prefix with /admin
import {Broker} from "databroker";
Broker.config.base_url='/auth';
Broker.config.default_options.get.credentials = 'same-origin';
Broker.config.default_options.put.credentials = 'same-origin';
Broker.config.default_options.post.credentials = 'same-origin';
Broker.config.default_options.patch.credentials = 'same-origin';
Broker.config.default_options.del.credentials = 'same-origin';

//the main application component
import Main from './view/components/app/component-main';

//load the state from indexedDB
import ApplicationState from "applicationstate";
import { init } from "applicationstate/plugins/indexeddb";

//load application state before we do anything else
init(ApplicationState, CLIENT_ID)
    .then(
        async () => {
            await defineCustomElements();
            //create the main component and kick off application
            let body = document.querySelector('body');
            body.style.overflowY='auto';
            body.appendChild(new Main());
        }
    );