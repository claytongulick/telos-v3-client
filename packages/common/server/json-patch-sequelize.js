const { DataTypes, Model } = require('sequelize');
const jsonPatch = require('fast-json-patch');
const JSONPatchRules = require('json-patch-rules');
class PatchableModel extends Model {
    async jsonPatch(patch, options) {
        let error = jsonPatch.validate(patch);
        if(error)
            throw new Error(error);
        
        let rules = options.rules;
        if(rules) {
            let json_patch_rules = new JSONPatchRules(rules, {mode: options.rules_mode});
            if(!json_patch_rules.check(patch))
                throw new Error("Failed patch rules check");
        }

        for (const item of patch) {
            let {op, path} = item;

            let middleware_handler;
            let matches;

            //check to see if we have any middleware defined
            if(options.middleware)
                for(let middleware of options.middleware) {
                    let op_matches;
                    if(Array.isArray(middleware.op)) 
                        op_matches = middleware.op.includes(op);
                    else
                        op_matches = (middleware.op == op)
                    if(op_matches) {
                        if(!middleware.regex)
                            middleware.regex = new RegExp(middleware.path);
                        matches = middleware.regex.exec(path);
                        if(matches) {
                            middleware_handler = middleware.handler;
                            break;
                        }
                    }
                }

            let next = async () => {
                jsonPatch.applyOperation(this, item);
                let column = item.path.split('/')[0];
                this.changed(column, true);
            }

            if(middleware_handler)
                await middleware_handler(document, item, next, matches);
            else
                await next();
        }


    }

}

module.exports = { PatchableModel };