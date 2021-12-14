/**
 * Authentication controller
 * 
 * @typedef {Object} AuthSession the session object describing the authentication status and the user
 * @property {string} flow The authentication flow used to authenticate the session
 * @property {string} status The current step in the authentication flow
 * @property {boolean} trusted Whether the session has been fully authenticated and all steps completed
 * @property {string} client_id The client id for the authenticated user
 * @property {Date} session_start_date The date/time when the session was started
 * @property {Date} session_trusted_date The date/time when the authentication was completed and the session was upgraded to "trusted"
 * @property {Object} user The authenticated user
 * @property {Number} user.id The user id
 * @property {string} user.username The unique username for the user
 * @property {string} user.resource The FHIR resource, if any, for the user
 * @property {Array} user.roles The list of roles the user has, i.e. 'admin','practitioner','patient', etc...
 */
class AuthController {
    static async auth(req, res, next) {


    }
}