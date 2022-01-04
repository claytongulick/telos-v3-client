const Encryption = require('common/server/encryption');
const User = require('common/db/models/user');
class OTP {
    static async setOTP(user) {
        if(!user)
            throw new Error("Invalid user");

        let code_length = 6;
        //use a cryptographically strong generation algorithm for code creation. Math.random() won't cut it
        let code = Encryption.cryptoRandomString(code_length);

        user.otp_code = code; //the generated code
        user.otp_created_date = new Date(); //used to expire the OTP. Expiration is 3 minutes.
        user.otp_attempts = 0; //we allow 3 attempts before a new code needs to be generated
        user.otp_consumed = false; //this has not been used yet
        user.otp_consumed_date = null;

        await user.save();
    }

    static async authenticateOTP(user_id, code) {
        let user = await User.findOne({where: {id: user_id}, attributes:['id', 'otp_code', 'otp_consumed', 'otp_attempts','otp_created_date']});
        if(!user)
            throw new Error("Invalid user_id");

        let valid = await OTP.validateOTP(user, code);

        if(!valid) {
            user.otp_attempts += 1;
            await user.save();
            return false;
        }

        return true;

    }

    static async validateOTP(user, code) {
        if(!user)
            return false;

        if(user.otp_consumed)
            return false;

        if(user.otp_attempts >= 3)
            return false;

        let ticks = new Date() - new Date(user.otp_created_date);
        let expiration = 1000 * 60 * 3; //three minutes in ms
        if(ticks > expiration)
            return false;

        //passed all checks
        if(user.otp_code === code)
            return true;

        return false;

    }

}

module.exports = OTP;