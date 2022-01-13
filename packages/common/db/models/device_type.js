const { DataTypes, Model } = require('sequelize');
/**
 */
let schema = {
    /**
     * The unique internal identifier for the device. This is a combination of the vendor
     */
    slug: {
        type: DataTypes.STRING,
        /**
         * UUID v1 is used so that it can be reversed into a timestamp and machine mac address, if needed
         */
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
    },

    /**
     * The name of the vendor or partner that provides the device
     */
    vendor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * The device id that the vendor assigned to the hardware device
     */
    vendor_device_id: {
        type: DataTypes.STRING
    },

    /**
     * The manufacturer name of the device
     */
    manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
    },

    /**
     * The model name of the device
     */
    model: {
        type: DataTypes.STRING
    },

    /**
     * Addtional metadata associated with the device
     */
    data: DataTypes.JSONB,

    /**
     * An array of measurement types the device is capable of recording
     */
    measures: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    }

}

/**
 * @type {typeof import('sequelize').Model}
 */
class DeviceType extends Model {

}

let sequelize = require('../sequelize').get('client');

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'DeviceType', // We need to choose the model name
    tableName: 'device_type',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
    ]
}

DeviceType.init(schema, model_options);
module.exports = DeviceType;