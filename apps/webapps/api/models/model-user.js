/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
// Model specific deps
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Helpers
const config = require('../../env/config');
const Paginate = require('../helpers/helper-model-paginate');
const Encryption = require('../helpers/helper-encryption');

const jsonPatchPlugin = require('mongoose-patcher');

/**
 * This is used as the Type of the otp field in the user.
 * It's defined separately here to allow for select: false to prevent accidental leaks
 */
let OTPSchema = new Schema({
    /**
     * The randomized generated code
     */
    code: String,

    /**
     * The datetime the code was generated
     */
    created_date: Date, //used to expire the OTP. Expiration is 3 minutes.

    /**
     * The number of attempts that have been made
     */
    attempts: Number, //we allow 3 attempts before a new code needs to be generated

    /**
     * Whether the current code has been used for authentication already
     */
    consumed: Boolean,

    /**
     * When the code was used
     */
    consumed_date: Date,

    /**
     * This is a nonce that's created when a otp is successfully consumed.
     * This can be independently invalidated to expire / kill the JWT
     */
    nonce: {
        type: Schema.Types.ObjectId,
        ref: "Nonce"
    }

});

/**
 * The main actor on the system that can do scheduling, assessments, and admin tasks.  These users are constrained by
 * their role to these actions. Most information required to act within the system is held here.
 * 
 * As with most user systems this collection also contains the cryptographic information
 * that enables authentication.  This information is strictly guarded and should never be sent via an API.
 * 
 * Users are a shared resource between the dashboard admin app and the mobile clients.  The level and scope of access
 * is determined by role.  Admins can do everything, schedulers can access the dashboard, and subjects access the mobile
 * clients and a web portal that supports what they do on those clients.  It also contains the cryptographic key used
 * to decrypt information on specific mobile clients.
 * 
 * A section of note is the "current_status" object which determines where the user is and what they are doing.  It is 
 * the information used to power much of the real time data within the dashboard app.
 * 
 * @constructs User
 */
let User = new Schema({
    /**
     * The primary username used for logging in. If config is set to use email as username, this will be copied from
     * the email address on a pre-save hook. By default, this will be stored as lower-case to avoid case-sensitive 
     * usernames
     * @memberof User
     * @instance
     * @type String
     */
    username: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: async function(value) {
                value = value.trim();
                if(!value)
                    return false;
                let user = await mongoose.model('User').findOne({username: value}, "_id").lean().exec();
                if(user) {
                    //if there is another user with this username, that's doesn't have this id, fail, it's a duplicate
                    //it's ok if it's an update validation tho
                    if(user._id.toString() !== this._id.toString())
                        return false
                }

                return true;
            },
            message: "A user with that username already exists"
        },
        index: { unique: true, sparse: true }, //sparse option supports multiple null values on a unique index
        default: null
    },

    /**
     * This is a string that indicates the account the user belongs to, if any. It can be used for client id or other purposes
     * for tracking groups of users
     */
    account: String,

    /**
     * An object detailing the current status of the user.  This provides data about what the user is doing, where
     * they are at, and what [subject]{@link Subject} they are currently working with.
     *
     * The `status_code` field should only include the following values.  This field is used extensively within the app
     * to inform schedulers and admins what a service coordinator is doing at any given time.
     *  - `off-task` for any time the user is logged in but not going to or performing a job.
     *  - `en-route` for when the user is driving to a job's location.
     *  - `on-site` for when the user is on the premise of a job's location.
     *  - `logged-out` for when the user is not logged into the system and is therefore not being tracked.
     *
     * @memberof User
     * @instance
     * @type Object
     * @property {String} status_code - One of the pre-defined codes triggered by a [worker event]{@link WorkerEvent}.
     * @property {Date} dateitme - The date and time the last status update was saved here.
     * @property {Object} location - The location object from the mobile client indicating where the user was when this status was saved.
     * @property {GeoJSON} location.geojson - The indexable location of the user in [GeoJSON]{@link http://geojson.org/geojson-spec.html} format.
     * @property {Number} location.accuracy - The level of accuracy according to the mobile client for this location information.
     * @property {Number} location.altitude - The estimated altitude for this location information.
     * @property {Number} location.altitudeAccuracy - The level of accuracy according to the mobile client for the altitude information.
     * @property {Number} location.heading - The heading, if moving, of the user when this location information was sent.
     * @property {Number} location.speed - The estimated speed of the user at the time this location information was sent.
     * @property {Number} location.client_timestamp - A timestamp in milliseconds that the client application claims this information was recorded.
     * @property {Date} location.last_mod_date - The last time the location was updated according to the server
     */
    current_status: {
        status_code: {
            type: String
        },
        datetime: Date,
        location: {
            geojson: {
                type: Schema.Types.Mixed,
                default: null
                /*
                This is here for reference, but we're marking the whole geojson structure "mixed" so that we don't
                run into issues with the 2dsphere index when only 'type' is populated
                type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point'
                },
                coordinates: {
                    type: Schema.Types.Mixed,
                    default: null
                } */
            },
            accuracy: Number,
            altitude: Number,
            altitudeAccuracy: Number, //meters
            heading: Number,
            speed: Number, //meters/s
            client_timestamp: Number,
            last_mod_date: {
                type: Date,
                default: Date.now
            }
        },
    },

    /**
     * The status of this user's account.  There are three current values enforced by an enum: `active` for a user that
     * is able to use the system `inactive` for a user that is no longer using the system, and `locked` for a user that
     * needs to be suspended from system use, but may be granted access again in the future.
     * @memberof User
     * @instance
     * @type String
     */
    account_status: {
        type: String,
        enum: ['active', 'inactive', 'locked'],
        default: 'active',
    },

    /**
     * An object containing different settings that a user has saved 
     * @memberof User
     * @instance
     * @type Object
     */
    settings: Schema.Types.Mixed,

    /**
     * The email address of the user. For most clients this should be the same as username.
     * @memberof User
     * @instance
     * @type String
     */
    email_address: {
        type: String,
        required: true,
        match: /^([\w-\.\+]+@([\w-]+\.)+[\w-]{2,4})?$/,
        lowercase: true,
        trim: true,
        validate: {
            validator: async function(value) {
                let user = await mongoose.model('User').findOne({email_address: value}).select('id').exec();
                if(user) {
                    if(user._id.toString() !== this._id.toString())
                        return false
                }
                return true;
            },
            message: "A user with that email address already exists"
        },
        index: {unique: true},
        default: null
    },

    /**
     * Indicates whether the user has accepted the terms of use
     * @memberof User
     * @instance
     * @type Boolean
     */
    terms_accepted: Boolean,

    /**
     * The date the terms of use were accepted
     * @memberof User
     * @instance
     * @type Date
     */
    terms_accepted_date: Date,

    /**
     * The first name of the user for display purposes.
     * @memberof User
     * @instance
     * @type String
     */
    first_name: {
        type: String,
        required: true,
        minLength: 2,
        lowercase: true,
        trim: true,
        default: null
    },

    /**
     * The last name of the user used for display purposes.
     * @memberof User
     * @instance
     * @type String
     */
    last_name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        minLength: 2,
        default: null
    },

    /**
     * The middle name of the user. Rarely used.
     * @memberof User
     * @instance
     * @type String
     */
    middle_name: String,

    /**
     * The first name and last name separated by a space as a convenience for display. Often used for searches.
     * @memberof User
     * @instance
     * @type String
     */
    long_name: String, // For simple text searching of first/last name

    /**
     * The unformatted cell phone of the user.
     * @memberof User
     * @instance
     * @type String
     */
    phone_cell: String,

    /**
     * The unformatted land line phone of the user.
     * @memberof User
     * @instance
     * @type String
     */
    phone_land: String,

    /**
     * The base64 encoded image to use for the avatar for this user.
     * This is mostly meant for internal staff users. Member users have a full avatar photo on the profile.
     * @memberof User
     * @instance
     * @type String
     */
    avatar: String,

    /**
     * The outline that allows the map to be properly zoomed out to represent the full area this user services.  It is
     * stored in geojson format.  It also includes a count of subjects within this service area.  The outline is
     * determined by the [subjects]{@link Subject} that are assigned to this user.
     * @memberof User
     * @instance
     * @type Object
     * @property {Number} subject_count - The number of [subjects]{@link Subject} within the service region for this user.
     * @property {GeoJSON} geojson - The [GeoJSON]{@link http://geojson.org/geojson-spec.html} formatted indexable locations that determine the service region.
     */
    service_region: {
        subject_count: Number,
        geojson: {
            type: Schema.Types.Mixed,
            default: null
            /*
             This is here for reference, but we're marking the whole geojson structure "mixed" so that we don't
             run into issues with the 2dsphere index when only 'type' is populated
            'type': {
                type: String,
                enum: ['Polygon'],
                default: 'Polygon'
            },
            coordinates: {
                type: Schema.Types.Mixed,
                //a polygon geojson is built from an array of linestrings, which are arrays of points, which are arrays of numbers:w
                default: [
                    //single line string
                    [
                        [0,0], [1,1], [2,2], [0,0] //closed loop
                    ]
                ]
            }*/ 
        }
    },

    /**
     * Used for password recovery and initial password setting.  It is a reasonably unique string that the user who
     * wishes to set or reset their password must provide to be able to set their password.
     * @memberof User
     * @instance
     * @type String
     */
    token_string: String,

    /**
     * Used for password recovery and initial password setting.  It is the date and time that a password reset token
     * expires and becomes invalid.  If this date is past, then the `token_string` has to be re-issued in order to set
     * or reset a password.
     * @memberof User
     * @instance
     * @type Number
     */
    token_expires: Number,


    /**
     * This is the password hash to be matched against for authentication.
     *
     * WARNING: You should NEVER return the hash and salt fields as part of a normal user query. Only time you
     * need them is when you're creating passwords or authenticating via passport auth, hence the select:false
     * settings. *DO NOT CHANGE OR OVERRIDE THIS SETTING!!!!!*  The only exception is authentication, and that only to
     * do a has and salt comparison.
     * @memberof User
     * @instance
     * @type String
     */
    hash: { type: String, select: false},

    /**
     * One time password field.
     * This is used to store a otp along with the create_datetime used for expiration and the login attempts.
     */
    otp: {
        type: OTPSchema, //defined above
        select: false
    },

    /**
     * The salt for the hash that is used to authenticate the user.
     *
     * WARNING: You should NEVER select the hash and salt fields unless you are doing authentication.  They should 
     * *never* _*ever*_ be sent off the server.  It is set to `select:false` meaning it will not be returned by a query.
     * *DO NOT CHANGE OR OVERRIDE THIS SETTING!!!*  The only exception is authentication, and that only to do a hash
     * and salt comparison.
     * @memberof User
     * @instance
     * @type String
     */
    salt: { type: String, select: false},

    /**
     * The last date and time the user successfully changed their password.
     * @memberof User
     * @instance
     * @type Date
     */
    last_password_changed_date: Date,

    /**
     * The last date and time the user successfully logged in to either the dashboard or mobile client.
     * @memberof User
     * @instance
     * @type Date
     */
    last_login_date: Date,

    /**
     * The number of times that a pasword was attempted and failed.  The action taken on this number is determined on a
     * client by client basis.
     * @memberof User
     * @instance
     * @type Number
     */
    attempt_password_count: {
        type: Number,
        default: 0
    },

    /**
     * Definition of roles the user has for various organizations
     */
    role: [
        {
            /**
             * An organization the user belongs to
             */
            organization: {
                type: Schema.Types.ObjectId,
                ref: 'Organization'
            },
            /**
             * The name of the role this user fills in the organization
             * @memberof User
             * @instance
             * @type String
             */
            role_name: {
                type: String,
                required: true,
                enum: ['admin','provider','patient'],
            },
        },
    ],

    /**
     * Indicates the default, or primary organization for the user
     */
    default_organization: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },

    /**
     * Indicates whether the user is a global admin.
     * A global admin is able to access the admin interface at the control nodes,
     * and is able to grant access to any system to any user, provision clients,
     * monitor system health and manage all system permissions.
     * 
     * A global admin is also able to access a magic link for any user that allows
     * the admin to log in to the system as that user.
     */
    global_admin: {
        type: Boolean,
        default: false
    },

    /**
     * Indicates that the user must reset their password on the next login attempt.  This field should not be returned
     * to any client as it is a potential security risk.
     * @memberof User
     * @instance
     * @type Boolean
     */
    reset_password: {
        type: Boolean,
        default: false,
        select: false // We should not return this field to the client. This should only ever be accessed or viewable from the server.
    },

    /**
     * This is the datetime of the most recent notification that has been viewed by the user
     * We don't keep track of individual notification views unless the notification calls for it, in which case it is tracked
     * in the notification events.
     * Notifications are a TTL collection, so this property is used to determine the count of unviewed notifications as well
     * as the notifications to display to the user on polling
     */
    last_notification_date: Date,

}, {
    collection: 'user',
    //this is important, otherwise mongoose will cull array dimensions from the geojson defaults, and blow up the
    //2dsphere index
    minimize: false, 
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' }
});

User.index({last_name: 1});
User.index({
    last_name: 'text',
    first_name: 'text',
    username: 'text',
    account: 'text'
},{
    name: 'User Full Text',
    weights: {
        last_name: 10,
        username: 2,
        first_name: 8,
        account: 10
    }
});


User.plugin(Paginate.plugin);
User.plugin(jsonPatchPlugin);

/**
 * Explicitly set the user's password. This assumes that all validity checks and rules have already passed,
 * no validation is done on the password other than to make sure that it exists.
 * 
 * @function
 * @memberof User
 * @instance
 */
User.methods.setPassword = async function(password) {
    if(!password)
        throw new Error("Missing password");

    let user = this;
    let result = await Encryption.hash(password);

    user.hash = result.hash;
    user.salt = result.salt;
    user.last_password_changed_date = new Date();

    await user.save();
}

/**
 * Ensure sensitive information is not sent via api
 */
User.methods.clean = function() {
    let clean_user = this.toObject();
    delete clean_user.hash;
    delete clean_user.salt;
    delete clean_user.otp;
    return clean_user;
}

/**
 * Ensure that all usernames are always lowercase.
 * If configured, use the user's email address as the username
 * @function
 * @memberof User
 * @instance
 */
User.pre('save', async function() {
    const Profile = mongoose.model('Profile');
    let user = this;

    if (config.email_is_username && user.email_address) {
        user.username = user.email_address;
    }

    if (user.username) {
        user.username = user.username.toLowerCase();
    }

    //keep profile info in sync
    if(user.profile) {
        let profile = await Profile.findById(user.profile);
        profile.basic_information.first_name = user.first_name;
        profile.basic_information.last_name = user.last_name;
        profile.basic_information.last_name = user.last_name;
        await profile.save();
    }

});

/**
 * Pre save hook to ensure that users' long_name fields are always kept up to date.
 * The long_name field is a concatenation of users' first and last names. It is primarily used
 * for full text searches of users by name, but can also be used for displaying names in the UI.
 * @listens User:save
 * @memberof User
 * @instance
 */
User.pre('save', function(next) {
    if (this.first_name && this.last_name) {
        this.long_name = this.first_name + ' ' + this.last_name;
    }
    next();
});

User.set('toJSON', {
    getters: true,
    virtuals: true
});
User.set('toObject', {
    getters: true,
    virtuals: true
});


module.exports = mongoose.model('User', User);