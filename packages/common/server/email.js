const Sendgrid = require('@sendgrid/mail');

class Email {

    static async sendEmail(email_address, subject, body, from_address, attachments) {
        Sendgrid.setApiKey(process.env.EMAIL_API_KEY);
        const email = {
            to: email_address,
            from: from_address,
            subject: subject, 
            html: body,
            attachments: attachments
        }

        return Sendgrid.send(email);

    }

}

module.exports = Email;