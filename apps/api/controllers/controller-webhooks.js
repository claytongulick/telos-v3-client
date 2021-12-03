/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const Invitation = require('../helpers/helper-invitation');
class ControllerWebhooks {

    static async invitation(req, res, next) {
        let raw_form = req.body.rawRequest;
        //this is the parsed form from jotform, it will have "q6_<field name>" type names. the prefix will be stripped
        let prefixed_form = JSON.parse(raw_form);
        let form = {};

        //get rid of dumb jotform prefixes
        for(let key in prefixed_form) {
            let field_name = key;
            if(key[0] == 'q') {
                let parts = key.split('_');
                parts.shift();
                field_name = parts.join('_');
            }
            form[field_name] = prefixed_form[key];
        }

        let user = req.user;
        let first_name = form.name.first;
        let last_name = form.name.last;
        if(form.caregiver_indicator !== 'Me') {
            first_name = form.caregiver_name.first;
            last_name = form.caregiver_name.last;
        }
        let invitation = await Invitation.createNewUserInvitation(
            {
                profile_id: null, //profile is null because we're not being invited to an existing profile
                permissions: 0, //no permissions because we're not being invited
                first_name: first_name,
                last_name: last_name,
                email_address: form.email_address,
                employee_id: form.emploee_id,
                client_id: form.client_id,
                phone_cell: `${form.phone_cell.area}${form.phone_cell.phone}`,
                relationship: 'self',
                create_user_id: null,
                data: form
            }
        );

        await Invitation.sendInvitation(invitation);

        res.json({status: 'ok'});

    }

}

module.exports = ControllerWebhooks;