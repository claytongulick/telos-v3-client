const { DataTypes, Model } = require('sequelize');
/**
 */
let schema = {
    /**
     * The unique internal identifier for the device. 
     */
    id: {
        type: DataTypes.UUID,
        /**
         * UUID v1 is used so that it can be reversed into a timestamp and machine mac address, if needed
         */
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
    },

    /**
     * The slug from the device_type table that indicates what type of device this is
     */
    device_slug: {
        type: DataTypes.STRING
    },

    /**
     * The device id that the vendor assigned to the hardware device
     */
    vendor_device_id: {
        type: DataTypes.STRING
    },

    /**
     * The device hardware serial number
     */
    serial_number: {
        type: DataTypes.STRING(512)
    },

    /**
     * The id of the client the device is assigned to
     */
    assigned_client_id: {
        type: DataTypes.STRING
    },

    /**
     * The id of the patient the device is assigned to
     */
    assigned_patient_id: {
        type: DataTypes.UUID
    },

    /**
     * The URI of the FHIR patient resource the device is assigned to
     */
    assigned_patient_resource: {
        type: DataTypes.STRING(512)
    },

    /**
     * The URI of the FHIR Device resource this device refers to
     */
    resource: {
        type: DataTypes.STRING
    },

    /**
     * Addtional metadata associated with the device
     */
    data: DataTypes.JSONB,

    /**
     * The date the device was shipped to the patient
     */
    ship_date: {
        type: DataTypes.DATE
    },

    /**
     * The status of the device. This drives whether we should expect to be receiving readings from the device.
     */
    status: {
        type: DataTypes.STRING
    }

}

/**
 * @type {typeof import('sequelize').Model}
 */
class Device extends Model {

}

let sequelize = require('../sequelize').get('client');

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'Device', // We need to choose the model name
    tableName: 'device',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
    ]
}

Device.init(schema, model_options);
module.exports = Device;