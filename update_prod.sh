#!/bin/bash
./compile.sh
./synclibs.sh

cp config-prod.yaml config.yaml 
export APPCFG=/Users/darianhickman/google-cloud-sdk/platform/google_appengine/appcfg.py


$APPCFG update --application=villagethegame111  .
