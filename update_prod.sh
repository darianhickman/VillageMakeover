#!/bin/bash
./compile.sh
./synclibs.sh

cp config-prod.yaml config.yaml
cp app-prod.yaml app.yaml
export APPCFG=/Users/darianhickman/google-cloud-sdk/platform/google_appengine/appcfg.py


$APPCFG update --application=villagethegame111  .
