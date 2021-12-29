class OTP {
    static async setOTP(user_id) {
        let user = await User.findOne({where: {id: user_id}, attributes:['id', 'otp']});
        if(!user)
            throw new Error("Invalid user_id");

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

    static async authenticateOTP(user_id, code, info) {
        let user = await User.findOne({where: {id: user_id}, attributes:['id', 'otp']});
        if(!user)
            throw new Error("Invalid user_id");

        let valid = await Authentication.validateOTP(user.otp, code);

        if(!valid) {
            user.otp_attempts += 1;
            await user.save();
            return false;
        }

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

        if(user.otp_code !== code)
            return false;

        //passed all checks
        return true;

    }

}