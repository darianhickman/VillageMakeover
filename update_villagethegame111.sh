#!/bin/bash
./compile.sh
cp config-prod.yaml config.yaml
if [ "$APPCFG" = "" ]; then
    if which appcfg.py; then
        APPCFG=appcfg.py
    else
        APPCFG=/Users/darianhickman/google-cloud-sdk/platform/google_appengine/appcfg.py
    fi
fi

./synclibs.sh
$APPCFG update --application=villagethegame111 --no_cookies --oauth2 . 2>&1 | grep -v 'Cannot upload both <filename>\.py and <filename>\.pyc' | grep -v 'Could not guess mimetype for'
