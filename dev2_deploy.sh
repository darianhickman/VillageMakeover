#!/bin/bash
./compile.sh
./synclibs.sh

cp config-dev.yaml config.yaml 
APPCFG=/Users/darianhickman/google-cloud-sdk/platform/google_appengine/appcfg.py


$APPCFG update --application=villagegamedev2  .
