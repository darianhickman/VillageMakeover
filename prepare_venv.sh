#!/bin/bash
set -e
if [ ! -e .venv ]; then
    virtualenv .venv
fi

. .venv/bin/activate
pip install -r requirements.txt
