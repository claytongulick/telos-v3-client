const Sequelize = require('sequelize');

let instances = {};

module.exports = {
    connect: async (connection_uri) => {
        let sequelize;
        if(instances[connection_uri])
            sequelize = instances[connection_uri];

        if(!sequelize) {
            sequelize = new Sequelize(connection_uri);
            instances[connection_uri] = sequelize;
        }

        await sequelize.authenticate();
        return sequelize;
    },
    get: (connection_uri) => {
        if(!(instances[connection_uri]))
            instances[connection_uri] = new Sequelize(connection_uri);
        /**
         * @type {typeof import('sequelize').Sequelize
         */
        let sequelize = instances[connection_uri];
        return sequelize;
    }
}