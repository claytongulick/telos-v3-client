const User = require('common/db/models/user');
const OTP = require('../classes/otp');
const Authentication = require('../classes/authentication');
const Communication = require('common/db/models/communication');

class OTPController {
    static async login(req, res) {
        let email_address = req.body.email_address;
        let code = req.body.code;
        let user = await User.findOne({where: {email_address}, attributes: ['id','username','roles','resource']});

        let valid = await OTP.authenticateOTP(user.id, code);

        if(!(valid === true)) {
            await Authentication.failAuthFlow(req, user, 'otp', 'invalid code');
            return res.status(403).json({status: 'error', message: 'invalid code'});
        }

        user.otp_consumed = true;
        user.otp_consumed_date = new Date();
        await Authentication.completeAuthFlow(req, user, 'otp');
        res.json({status: 'ok'});

    }

    static async send(req, res, next) {
        const type = req.body.type;
        let user;
        let email_address = req.body.email_address;
        /** @type {import('common/db/models/communication').CommunicationSchema} */
        let communication_dto = {};

        if(email_address)
            user = await User.findOne({where: {email_address}, attributes: ['id', 'first_name', 'email_address', 'phone', 'otp_code']});

        if(!user)
            return res.status(400).json({status: 'error', message: 'Invalid email address'});

        await Authentication.startAuthFlow(req, user, 'otp', {type});

        await OTP.setOTP(user);

        if(!(['sms','email'].includes(type)))
            res.status(400).json({status: 'error', message: 'Invalid type'});

        communication_dto.to = user.id;
        communication_dto.type = type;
        if(type === 'sms') {
            communication_dto.communication_template = 'login-otp-sms';
        }
        else if(type === 'email') {
            communication_dto.communication_template = 'login-otp-email';
        }
        else
            throw new Error("Unsupported communication type:" + type);
        
        communication_dto.data = {
            subject: 'Your Telos login code',
            from_address: 'support@teloshs.com',
            first_name: user.first_name,
            code: user.otp_code.toUpperCase()
        }

        let communication = await Communication.create(communication_dto);
        await communication.send();

        res.json({status: 'ok'});

    }
}

module.exports = OTPController;