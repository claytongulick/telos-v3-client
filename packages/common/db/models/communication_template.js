const { DataTypes, Model } = require('sequelize');
const {PatchableModel} = require('common/server/json-patch-sequelize');
const handlebars = require('handlebars');

/**
 * @typedef {Object} CommunicationTemplate
 * @property {number} id The unique id for the activity
 */
let schema = {
    /**
     * The unique id for the communication
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    /**
     * The system name of the communication template
     */
    name: DataTypes.STRING,

    /**
     * User-friendly name for the communicaiton template
     */
    title: DataTypes.STRING,

    /**
     * The template content
     */
    content: DataTypes.TEXT,

    /**
     * Pre-compiled template
     */
    compiled: DataTypes.TEXT

}

/**
 * @type {typeof import('sequelize').Model}
 */
class CommunicationTemplate extends PatchableModel {
    async render(data) {
        let template;
        if(this.compiled)
            template = handlebars.template(this.compiled);
        else {
            this.compiled = template = handlebars.precompile(this.content);
            await this.save();
        }
        return template(data);
    }

}

let sequelize = require('../sequelize').get('client');

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'CommunicationTemplate', // We need to choose the model name
    tableName: 'communication_template',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['name']},
    ],
    hooks: {
        beforeCreate: (communication_template, options) => {
            communication_template.compiled = handlebars.precompile(communication_template.content);
        },
        beforeSave: (communication_template, options) => {
            communication_template.compiled = handlebars.precompile(communication_template.content);
        }
    }
}

CommunicationTemplate.init(schema, model_options);
module.exports = CommunicationTemplate;