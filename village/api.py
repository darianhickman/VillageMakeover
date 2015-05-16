# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import os
import json
import braintree

from google.appengine.api import users

from . import models
from .app_common import config

root = flask.Flask(__name__)
#root.config['DEBUG'] = True

def verify_csrf():
    found = flask.request.form.get('csrf')
    expected = flask.request.cookies.get('csrf')
    if not expected or found != expected:
        flask.abort(403)

@root.route('/api/get_user')
def get_user():
    user = users.get_current_user()
    if not user:
        respStatus = "fail"
        respMail = "offline"
        respID = "offline"
    else:
        respStatus = "ok"
        respMail = user.email()
        respID = user.user_id()
    csrf = flask.request.cookies.get('csrf')
    if not csrf:
        csrf = os.urandom(20).encode('hex')
    resp = JSONResponse({
        'status': respStatus,
        'email': respMail,
        'id': respID,
        'csrf': csrf})
    resp.set_cookie('csrf', csrf)
    return resp

@root.route('/api/login_redirect')
def login_redirect():
    return flask.redirect(users.create_login_url())

@root.route('/api/get_state')
def get_state():
    userid = users.get_current_user().user_id()
    state = models.get_state(userid)
    return JSONResponse(state)

@root.route('/api/save_state', methods=['POST'])
def save_state():
    verify_csrf()
    userid = users.get_current_user().user_id()
    models.save_state(userid, json.loads(
        flask.request.form['state']))
    return JSONResponse({'status': 'ok'})

@root.route('/api/pay', methods=['POST'])
def pay():
    if flask.request.form['loginStatus'] == 'online':
        userid = users.get_current_user().user_id()
    else:
        userid = flask.request.form['id']
    model = models.get_state_model(userid)
    customer_id = model.customer_id
    if not customer_id:
        return JSONResponse({'status': 'register'})

    if model.customer_id_once:
        model.customer_id = None
        model.put()

    amount = calculate_amount(flask.request.form['amount'])

    assert amount > 0 and amount < 100 # sanity check

    result = braintree.Transaction.sale({
        "customer_id": customer_id,
        "amount": "%.2f" % amount,
        "options": {
            "submit_for_settlement": True,
        },
    })
    return JSONResponse({'status': 'ok' if result.is_success else 'fail'})

def calculate_amount(amount):
    assets = json.loads(amount)

    cash_prices = dict(zip(
        [500, 1200, 2500, 6500, 14000], [4.99, 9.99, 19.99, 49.99, 99.99]))

    return cash_prices[assets['cash']]

def JSONResponse(x):
    return flask.Response(
        json.dumps(x),
        content_type='application/json')
