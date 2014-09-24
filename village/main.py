# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import jwt
import time
import json
import urllib

from .app_common import config
from .config import get_config, get_catalog

from google.appengine.api import users

root = flask.Flask(__name__)

@root.route('/')
def index():
    return flask.redirect('/client/')

@root.route('/config')
def config_route():
    return flask.Response(
        json.dumps(get_config(),
                   indent=4),
        content_type='application/json')

@root.route('/catalog')
def config_catalog():
    return flask.Response(
        'GameObjects.loadCatalog(%s);' %
        json.dumps(get_fixed_catalog(),
                   indent=4),
        content_type='text/javascript')

def get_fixed_catalog():
    catalog = get_catalog()

    def parse_int_tuple(s):
        return [ int(i.strip()) for i in s.split(',') ]

    for item in catalog:
        item['cell'] = int(item['cell'])
        item['coins'] = int(item['coins'])
        item['cash'] = int(item['cash'])
        item['cellCount'] = item['cell']
        item['bounds3d'] = parse_int_tuple(item['bounds3d'])
        item['anchor'] = parse_int_tuple(item['anchor'])
        item['scale'] = item['scale'].lower() in ('true', 1, 'yes')

    return catalog

@root.route('/buy')
def api_buy():
    user = users.get_current_user()
    coins = int(flask.request.args['coins'])
    token = jwt.encode(
        {
            "iss" : config['wallet']['ident'],
            "aud" : "Google",
            "typ" : "google/payments/inapp/item/v1",
            "exp" : int(time.time() + 3600),
            "iat" : int(time.time()),
            "request" :{
                "name" : "%d coins" % coins,
                "description" : "SOHIP coins",
                "price" : '%.2f' % (coins * 0.01),
                "currencyCode" : "USD",
                "sellerData" : urllib.urlencode({'mail': user.email(), 'coins': coins})
            }
        },
        config['wallet']['secret'])
    return flask.Response(
        json.dumps({'token': token}),
        content_type='application/json')
