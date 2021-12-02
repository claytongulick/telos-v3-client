/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */

/**
 * Utility class for displaying various types of messaging to the user
 */
class Messaging {

    /**
     * Show a basic toast message using Ionic components
     * @param {*} message 
     * @returns 
     */
    static async toast(message) {
        let toast_controller = window.toastController;

        let toast = await toast_controller.create({
            message: message,
            duration: 2000,
            buttons: [{
                role: 'cancel',
                icon: 'close'
            }]
        });
        await toast.present();
        await toast.onDidDismiss();
        return false;
    }

}

export default Messaging;