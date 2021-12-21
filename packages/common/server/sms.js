let twilio = new (require('twilio'))(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Helper library to send a SMS message. Provides an abstraction to make switching to different SMS providers simple.
 */
class SMS {
    /**
     * Send a sms message
     * @param phone_number
     * @param message
     */
    static sendMessage(phone_number, message) {
        return twilio.messages.create({
            body: message,
            to: phone_number,
            from: process.env.TWILIO_PHONE_NUMBER
        });
    }
}

module.exports = SMS;