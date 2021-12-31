class OTPController {
    static async login(req, res) {

    }

    static async send(req, res, next) {
        const type = req.body.type;
        let to = {reference: null, reference_type: 'User', to_address: null};
        let template;
        let user;
        let user_id = req.body.user_id;
        let username = req.body.username;
        let email_address = req.body.email_address;

        if(user_id)
            user = await User.findOne({_id: user_id},'_id email_address phone_cell').lean();
        else if(username)
            user = await User.findOne({username: username},'_id email_address phone_cell').lean();
        else if(email_address)
            user = await User.findOne({email_address: email_address},'_id email_address phone_cell').lean();

        if(!user)
            return res.status(400).json({status: 'error', message: 'Invalid user identifier'});

        let otp = await Authentication.setOTP(user._id);

        if(!(['sms','email'].includes(type)))
            res.status(400).json({status: 'error', message: 'Invalid type'});

        if(type === 'sms') {
            to.to_address = user.phone_cell;
            template = '/communication/login-otp-sms';
        }
        else if(type === 'email') {
            to.to_address = user.email_address;
            template = '/communication/login-otp-email';
        }
        else
            throw new Error("Unsupported communication type:" + type);

        to.reference = user._id;
        let communication = new Communication({
            to: [to],
            communication_type: type,
            communication_template: template,
            fields: {
                subject: 'Your Kith & Kin login code',
                from_address: 'hello@kithandkin.app',
                code: otp.code.toUpperCase(),
                url: process.env.NODE_ENV == 'production' ? 'my.kithandkin.app' : 'kithandkin.ratiosoftware.com'
            }
        });
        await communication.save();

        await CommunicationHelper.sendCommunication(communication._id);

        res.json({status: 'ok'});

    }
}

module.exports = OTPController;