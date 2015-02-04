# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import json
import braintree
import urllib

from .app_common import config
from .config import get_config, get_catalog
from . import models

from google.appengine.api import users

root = flask.Flask(__name__)

@root.route('/')
def index():
    return flask.redirect('/client/')

@root.route('/config')
def config_route():
    return flask.Response(
        json.dumps(dict(get_config()),
                   indent=4),
        content_type='application/json')

@root.route('/getcse')
def get_cse():
    return flask.Response(json.dumps({'cse': braintree.ClientToken.generate()}),
                          content_type='application/json')

@root.route('/catalog')
def config_catalog():
    return flask.Response(
        'GameObjects.loadCatalog(%s);' %
        json.dumps(get_fixed_catalog(),
                   indent=4),
        content_type='text/javascript')

@root.route('/updateCatalog')
def update_catalog():
    get_catalog.remove_cache()
    return flask.Response('ok')

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
        item['enabled'] = item['enabled'].lower() in ('true', 1, 'yes')
        item['scaleValue'] = float(item['scaleValue'])

    return catalog

@root.route('/create_client', methods=['POST'])
def create_client():
    nonce = flask.request.form["payment_method_nonce"]
    param = flask.request.form.get("param", 'none')
    userid = users.get_current_user().user_id()
    state = models.get_state_model(userid)
    result = braintree.Customer.create({'payment_method_nonce': nonce})
    if not result.is_success:
        return flask.redirect('/client/pay.html?status=fail&param=' + urllib.quote(param))
    state.customer_id = result.customer.id
    state.put()
    return flask.redirect('/client/#pay=' + urllib.quote(param))
