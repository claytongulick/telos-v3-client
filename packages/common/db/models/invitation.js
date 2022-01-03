const { DataTypes, Model } = require('sequelize');
/**
 * @interface InvitationSchema
 */
let schema = {
    /**
     * The unique id 
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    /**
     * Random string used to locate/verify the token. ObjectIds are not used due to their 
     * susceptibility to time-based attacks / guessing.
     * 
     * This is a valid UUIDv4 shortened with short-uuid
     */
     token: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 

    /**
     * This is the user that was created once the invitation is accepted
     */
    user_id: {
        type: DataTypes.UUID,
    },

    /**
     * The default first name for the user that will be created
     */
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },

    /**
     * The default last name of the user that will be created
     */
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },

    /**
     * The email address for the user
     */
    email_address: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * The cell number for the user
     */
    phone_cell: {
        type: DataTypes.STRING,
        allowNull: true
    },

    /**
     * The type of communication that should be used to send the invitation
     */
    communication_type: DataTypes.STRING,

    /**
     * The status of the invitation
     */
    status: {
        type: DataTypes.STRING,
        validator: {
            isIn: {
                args: [['created','invited','accepted','cancelled','expired']],
                msg: 'Invalid status'
            }
        },
        defaultValue: 'created'
    },

    /**
     * The date of the current status
     */
    status_date: DataTypes.DATE,

    /**
     * The date the invitation expires
     */
    expiration_date: DataTypes.DATE,

    /**
     * This is arbitrary data associated to the invitation. For example, it could be the original "raw" form data
     * from an online "create user" flow, source data from an integrated flow, etc...
     */
    data: DataTypes.JSONB,

    /**
     * The user who created the invitation, if any. If not filled, this was a system created invitation
     */
    created_by: {
        type: DataTypes.UUID,
    }

}

/**
 * @type {typeof import('sequelize').Model}
 */
class Invitation extends Model {
    /**
     * 
     * @param {Object} invitation_dto 
     * @property {string} invitation_dto.first_name
     * @property {string} invitation_dto.lasdt_name
     * @property {string} invitation_dto.email_address
     * @property {string} invitation_dto.phone_cell
     * @property {string} invitation_dto.communication_type
     * @property {Object} invitation_dto.data
     */
    static async createInvitation(invitation_dto) {

    }

    async send() {

    }

}

let sequelize = require('../sequelize').get('client');

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'Invitation', // We need to choose the model name
    tableName: 'invitation',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['token']}
    ]
}

Invitation.init(schema, model_options);
module.exports = Invitation;