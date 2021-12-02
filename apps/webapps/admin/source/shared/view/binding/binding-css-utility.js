/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

class CSSUtility {
    constructor(css_stylesheet) {
        this.css = css_stylesheet;
    }

    getStyleRule(selector) {
        let rules = this.css.cssRules;
        for(let i=0; i<rules.length; i++) {
            let rule = rules[i];
            if(rule.type !== CSSRule.STYLE_RULE)
                continue;

            if(rule.selectorText == selector)
                return rule;
        }
    }

    deleteStyleRule(selector) {
        let rules = this.css.cssRules;
        for(let i=0; i<rules.length; i++) {
            let rule = rules[i];
            if (rule.type !== CSSRule.STYLE_RULE)
                continue;

            if (rule.selectorText === selector) {
                this.css.deleteRule(i);
                return true;
            }
        }
    }

    addRule(rule_text) {
        this.css.insertRule(rule_text, 0);
    }

}

export default CSSUtility;