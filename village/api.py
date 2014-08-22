# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import os
import json

from google.appengine.api import users

from . import models

root = flask.Flask(__name__)

def verify_csrf():
    found = flask.request.form.get('csrf')
    expected = flask.request.cookies.get('csrf')
    if not expected or found != expected:
        flask.abort(403)

@root.route('/api/get_user')
def get_user():
    user = users.get_current_user()
    if not user:
        return {'status': 'fail',
                'login_url': users.create_login_url()}
    else:
        csrf = flask.request.cookies.get('csrf')
        if not csrf:
            csrf = os.urandom(20).encode('hex')
        resp = JSONResponse({
            'status': 'ok',
            'email': user.email(),
            'csrf': csrf})
        resp.set_cookie('csrf', csrf)
        return resp

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

def JSONResponse(x):
    return flask.Response(
        json.dumps(x),
        content_type='application/json')
