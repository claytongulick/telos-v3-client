#!/bin/bash
git ls-files | grep -E 'js$|html$|css$|hbs$|json$' | xargs wc -l
#total non-blank lines
echo Total non blank lines:
git ls-files | grep -E 'js$|html$|css$|hbs$|json$' | xargs cat | sed '/^\s*$/d' | wc -l