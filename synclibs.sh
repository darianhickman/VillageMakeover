#!/bin/bash
./prepare_venv.sh

. .venv/bin/activate
rm -r libs
rsync -r $(dirname $(which python))/../lib/python2.7/site-packages/ libs
