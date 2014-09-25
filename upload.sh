#!/bin/bash
if [ "$APPCFG" = "" ]; then
    if which appcfg.py; then
        APPCFG=appcfg.py
    else
        APPCFG=$HOME/apps/google_appengine/appcfg.py
    fi
fi

./synclibs.sh
$APPCFG update --oauth2 . 2>&1 | grep -v 'Cannot upload both <filename>\.py and <filename>\.pyc' | grep -v 'Could not guess mimetype for'
