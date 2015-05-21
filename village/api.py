# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import yaml
import os
import json
import braintree
import facebook
import urllib2

from google.appengine.api import users

from . import models
from .app_common import config
from .config import get_login_condition, get_secret_key

local_config = yaml.safe_load(
    open(os.path.dirname(__file__) + '/../config.yaml'))

FB_APP_ID = local_config['facebook']['FB_APP_ID']
FB_APP_SECRET = local_config['facebook']['FB_APP_SECRET']

root = flask.Flask(__name__)
#root.config['DEBUG'] = True

# set the secret key.  keep this really secret:
root.secret_key = get_secret_key()

def verify_csrf():
    found = flask.request.form.get('csrf')
    expected = flask.request.cookies.get('csrf')
    if not expected or found != expected:
        flask.abort(403)

@root.route('/api/get_user')
def get_user():
    if flask.g.user:
        response_status = 'ok'
        response_provider = flask.g.user['provider']
        response_email = flask.g.user['name']
        response_id = flask.g.user['id']
        if flask.g.user['provider'] == 'facebook':
            response_picture_url = get_facebook_picture_url()
        else:
            response_picture_url = 'no-picture'
    else:
        is_login_necessary = get_login_condition()
        if is_login_necessary:
            return JSONResponse({'status': 'fail',
                                         'login_url': '/client/login.html'})
        else:
            response_status = 'offline'
            response_provider = 'offline'
            response_email = 'offline'
            response_id = 'offline'
            response_picture_url = 'no-picture'

    csrf = flask.request.cookies.get('csrf')
    if not csrf:
        csrf = os.urandom(20).encode('hex')

    resp = JSONResponse({
        'status': response_status,
        'provider': response_provider,
        'email': response_email,
        'id': response_id,
        'picture_url': response_picture_url,
        'csrf': csrf})
    resp.set_cookie('csrf', csrf)
    return resp

@root.route('/api/login_redirect')
def login_redirect():
    return flask.redirect(users.create_login_url())

@root.route('/api/get_state')
def get_state():
    userid = flask.g.user['id']
    state = models.get_state(userid)
    return JSONResponse(state)

@root.route('/api/save_state', methods=['POST'])
def save_state():
    verify_csrf()
    userid = flask.g.user['id']
    models.save_state(userid, json.loads(
        flask.request.form['state']))
    return JSONResponse({'status': 'ok'})

@root.route('/api/pay', methods=['POST'])
def pay():
    if flask.request.form['loginStatus'] == 'online':
        userid = flask.g.user['id']
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

@root.before_request
def get_current_user():
    """Set g.user to the currently logged in user.
    Called before each request, get_current_user sets the global g.user
    variable to the currently logged in user.  A currently logged in user is
    determined by seeing if it exists in Flask's session dictionary.
    If it is the first time the user is logging into this application it will
    create the user and insert it into the database.  If the user is not logged
    in, None will be set to g.user.
    """

    # Set the user in the session dictionary as a global g.user and bail out
    # of this function early.
    if flask.session.get('user'):
        flask.g.user = flask.session.get('user')
        return

    user = users.get_current_user()

    if user:
        state = models.get_state_model(user.user_id())
        state.provider = 'google'
        state.name = user.email()
        state.put()

        flask.session['user'] = dict(name=user.email(),
                                       id=user.user_id(), access_token=None, provider='google')

    # Attempt to get the short term access token for the current user.
    result = facebook.get_user_from_cookie(flask.request.cookies, FB_APP_ID, FB_APP_SECRET)

    # If there is no result, we assume the user is not logged in.
    if result:
        graph = facebook.GraphAPI(result['access_token'])
        profile = graph.get_object('me')

        state = models.get_state_model(result['uid'])
        state.provider = 'facebook'
        state.name = profile['name']
        state.access_token = result['access_token']
        state.put()

        # Add the user to the current session
        flask.session['user'] = dict(name=profile['name'],
                               id=result['uid'], access_token=result['access_token'], provider='facebook')

    # Set the user as a global g.user
    flask.g.user = flask.session.get('user', None)

def get_facebook_picture_url():
    response = urllib2.urlopen('http://graph.facebook.com/' + flask.g.user['id'] + '/picture?redirect=false')
    data = json.load(response)
    picture_url = data['data']['url']
    return picture_url

@root.route('/api/logout')
def logout():
    """Log out the user from the application.
    Log out the user from the application by removing them from the
    session.  Note: this does not log the user out of Facebook - this is done
    by the JavaScript SDK.
    """
    if flask.g.user:
        flask.session.pop('user', None)
        if flask.g.user['provider'] == 'google':
            return flask.redirect(users.create_logout_url('/'))
        elif flask.g.user['provider'] == 'facebook':
            return flask.redirect('/client/facebookLogout.html')
    else:
        return flask.redirect(flask.url_for('index'))

def calculate_amount(amount):
    assets = json.loads(amount)

    cash_prices = dict(zip(
        [500, 1200, 2500, 6500, 14000], [4.99, 9.99, 19.99, 49.99, 99.99]))

    return cash_prices[assets['cash']]

def JSONResponse(x):
    return flask.Response(
        json.dumps(x),
        content_type='application/json')
