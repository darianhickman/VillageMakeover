#!/bin/bash
./compile.sh
./synclibs.sh

cp config-dev.yaml config.yaml 
APPCFG=/Users/darianhickman/google-cloud-sdk/platform/google_appengine/appcfg.py


$APPCFG update --application=villagegamedev2 --oauth2 . 2>&1 | grep -v 'Cannot upload both <filename>\.py and <filename>\.pyc' | grep -v 'Could not guess mimetype for'
