#!/bin/sh
set -e
cd ige
node server/ige.js -deploy ../client
