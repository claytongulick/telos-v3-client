import React from 'react';

console.log("Loading Telos Reporting Plugin");

class TelosIFrame extends React.Component {
    iframe_element;
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement("iframe", {
            style: {
                width: '100%',
                height: '100%'
            },
            src: "https://reporting.teloshs.com",
            ref: element => {
                this.iframe_element = element;
            }
        });
    }
}

class TelosPlugin {
    initialize(registry, store) {
        console.log("Initializing Telos Reporting Plugin...");
        registry.registerProduct(
            '/telos-reporting', //baseURL
            'basketball', //switcherIcon -- from feathericons
            'Reports', //switcherText
            '/telos-reporting', //switcherLinkURL
            TelosIFrame, //mainComponent
            () => null, //headerCentreComponent
            () => null, //headerRightComponent
            false //showTeamSidebar
        );
        registry.registerChannelHeaderButtonAction(
            "food-apple", //icon
            // action - a function called when the button is clicked, passed the channel and channel member as arguments
            // null,
            () => {
                alert("Hello World!");
            },
            // dropdown_text - string or JSX element shown for the dropdown button description
            "Hello World",
        );
    }
}

window.registerPlugin("com.teloshs.mattermost",new TelosPlugin());