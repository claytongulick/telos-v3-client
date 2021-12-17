let User = require('common/db/models/user');
class UserCommands {
    static async create(options) {
        let roles = options.roles.split(',').map(role => role.trim());
        let user_dto = {
            username: options.username || options.email,
            email_address: options.email,
            first_name: options.first_name,
            last_name: options.last_name,
            phone: options.phone,
            roles: roles
        };
        let user = await User.create(user_dto);
        await user.setPassword(user_dto.password);
        user.sequelize.close();
    }

    static async lock(username, options) {
        let user = await User.findOne({where: {username}});
        if(!user) {
            console.error(`Unable to find user with username: ${username}`);
            return user.sequelize.close();
        }
        user.account_status = 'locked';
        await user.save();
        user.sequelize.close();

    }

    static async unlock(username, options) {
        let user = await User.findOne({where: {username}});
        if(!user) {
            console.error(`Unable to find user with username: ${username}`);
            return user.sequelize.close();
        }
        user.account_status = 'active';
        await user.save();
        user.sequelize.close();
    }

    static async setPassword(username, password, options) {
        let user = await User.findOne({where: {username}});
        if(!user) {
            console.error(`Unable to find user with username: ${username}`);
            return user.sequelize.close();
        }
        await user.setPassword(password);

        user.sequelize.close();
    }

    static async resetPassword(username, options) {
        throw new Error("Not implemented");

        user.sequelize.close();
    }
}

module.exports = UserCommands;