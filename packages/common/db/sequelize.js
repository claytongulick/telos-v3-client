const Sequelize = require('sequelize');

let instances = {};

let connections = {
    'client': process.env.CLIENT_DB_URI,
    'session': process.env.SESSION_DB_URI
}

module.exports = {
    /**
     * Async connect method to retrienve and connect to a connection
     * @param {*} connection_name 
     * @returns 
     */
    connect: async (connection_name) => {
        let sequelize;
        let connection_uri = connections[connection_name];
        if(!connection_uri)
            throw new Error('Invalid connection: ' + connection_name);
        if(instances[connection_name])
            sequelize = instances[connection_name];

        if(!sequelize) {
            sequelize = new Sequelize(connection_uri);
            instances[connection_name] = sequelize;
        }
        await sequelize.authenticate();
        return sequelize;
    },
    /**
     * Syncronous connection fetch, returns the sequelize instance which may not be connected already
     * @param {*} connection_name 
     * @returns 
     */
    get: (connection_name) => {
        let connection_uri = connections[connection_name];
        if(!connection_uri)
            throw new Error('Invalid connection: ' + connection_name);
        if(!(instances[connection_name]))
            instances[connection_name] = new Sequelize(connection_uri);
        /**
         * @type {typeof import('sequelize').Sequelize
         */
        let sequelize = instances[connection_name];
        return sequelize;
    }
}