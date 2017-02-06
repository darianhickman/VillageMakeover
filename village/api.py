# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import yaml
import os
import json
import braintree
import httplib2
from apiclient.discovery import build
from oauth2client import client

from . import models
from .app_common import config
from .config import get_login_condition, get_secret_key, get_config, get_village_sheet, copy_village_sheet, save_village_sheet, delete_village_sheet, rename_village_sheet

sheet_config = get_config()

FB_APP_ID = sheet_config['FB_APP_ID']
FB_APP_SECRET = sheet_config['FB_APP_SECRET']
FB_LIKE_URL = sheet_config['FB_LIKE_URL']
FB_LIKE_TITLE = sheet_config['FB_LIKE_TITLE']
FB_LIKE_IMAGE = sheet_config['FB_LIKE_IMAGE']

root = flask.Flask(__name__)
#root.config['DEBUG'] = True

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
        response_email = flask.g.user['email']
        response_name = flask.g.user['name']
        response_id = flask.g.user['id']
        response_key_id = flask.g.user['key_id']
        response_picture_url = flask.g.user['image_url']
        response_editor_enabled = flask.g.user['editor_enabled']
    else:
        is_login_necessary = get_login_condition()
        if is_login_necessary:
            return JSONResponse({'status': 'fail',
                                         'login_url': '/client/login.html'})
        else:
            response_status = 'offline'
            response_provider = 'offline'
            response_email = 'offline'
            response_name = 'offline'
            response_id = 'offline'
            response_key_id = 'offline'
            response_picture_url = 'no-picture'
            response_editor_enabled = 'false'

    csrf = flask.request.cookies.get('csrf')
    if not csrf:
        csrf = os.urandom(20).encode('hex')

    resp = JSONResponse({
        'status': response_status,
        'provider': response_provider,
        'email': response_email,
        'name': response_name,
        'id': response_id,
        'key_id': response_key_id,
        'picture_url': response_picture_url,
        'editor_enabled': response_editor_enabled,
        'csrf': csrf})
    resp.set_cookie('csrf', csrf)
    return resp

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

@root.route('/api/get_villages')
def get_villages():
    editor_enabled = flask.g.user['editor_enabled']
    if editor_enabled == "false":
        flask.abort(401)
    villages = models.get_villages()
    return JSONResponse([v.to_dict() for v in villages])

@root.route('/api/village/<village_id>')
def get_village(village_id):
    editor_enabled = "false"
    if flask.g.user:
        editor_enabled = flask.g.user['editor_enabled']
    village = models.get_village_model(village_id)
    if editor_enabled == "false" and village.viewable is not None and not village.viewable:
        return JSONResponse({'viewable': 'false'})
    if village.spreadsheet_docid:
        data = get_village_sheet(village.spreadsheet_docid)
    else:
        data = models.get_state_data(village_id)
        if data is not None:
            data = data.get('objects','')
        else:
            data = ''
    return JSONResponse({'village_id': village.village_id, 'title': village.title, 'viewable': 'true', 'data': data})

@root.route('/api/village/<village_id>', methods=['POST'])
def save_village(village_id):
    editor_enabled = flask.g.user['editor_enabled']
    if editor_enabled == "false":
        flask.abort(401)
    json_data = flask.request.get_json(True)
    title = json_data['title']
    mode = json_data['mode']
    if mode == "new":
        organization = json_data['organization']
        viewable = json_data['viewable']
        last_saved_by = flask.g.user['id']
        models.save_village(village_id, None, title, organization, last_saved_by, viewable)
        return JSONResponse({'status': 'ok'})
    elif mode == "data":
        data = json_data['data']
        village = models.get_village_model(village_id)
        village.last_saved_by = flask.g.user['id']
        if village.spreadsheet_docid is None:
            spreadsheet_docid = copy_village_sheet(title)
            if spreadsheet_docid == "error":
                flask.abort(500)
            else:
                village.spreadsheet_docid = spreadsheet_docid
        else:
            spreadsheet_docid = village.spreadsheet_docid
        save_village_sheet(spreadsheet_docid, data)
        village.put()
        return JSONResponse({'status': 'ok'})

@root.route('/api/village/<village_id>', methods=['PUT'])
def edit_village(village_id):
    editor_enabled = flask.g.user['editor_enabled']
    if editor_enabled == "false":
        flask.abort(401)
    json_data = flask.request.get_json(True)
    title = json_data['title']
    organization = json_data['organization']
    viewable = json_data['viewable']
    village = models.get_village_model(village_id)
    if village.spreadsheet_docid is not None and title != village.title:
            rename_village_sheet(village.spreadsheet_docid, title)
    village.title = title
    village.organization = organization
    village.viewable = viewable
    village.last_saved_by = flask.g.user['id']
    village.put()
    return JSONResponse({'status': 'ok'})

@root.route('/api/village/<village_id>', methods=['DELETE'])
def delete_village(village_id):
    editor_enabled = flask.g.user['editor_enabled']
    if editor_enabled == "false":
        flask.abort(401)
    village = models.get_village_model(village_id)
    if village.spreadsheet_docid:
        delete_village_sheet(village.spreadsheet_docid)
    village.key.delete()
    return JSONResponse({'status': 'ok'})

@root.route('/api/pay', methods=['POST'])
def pay():
    if flask.request.form['loginStatus'] == 'online':
        userid = flask.g.user['id']
    else:
        userid = flask.request.form['id']
    model = models.get_state_model(userid)
    customer_id = model.customer_id
    assets = json.loads(flask.request.form['amount'])
    amount = calculate_amount(flask.request.form['amount'])

    assert amount > 0 and amount < 100 # sanity check

    if not customer_id:
        return JSONResponse({'status': 'register', 'vbucks': assets['cash'], 'amount': amount})

    if model.customer_id_once:
        model.customer_id = None
        model.put()

    result = braintree.Transaction.sale({
        "customer_id": customer_id,
        "amount": "%.2f" % amount,
        "options": {
            "submit_for_settlement": True,
        },
    })
    return JSONResponse({'status': 'ok' if result.is_success else 'fail', 'vbucks': assets['cash'], 'amount': amount})

@root.before_request
def get_current_user():
    """Set g.user to the currently logged in user.
    Called before each request, get_current_user sets the global g.user
    variable to the currently logged in user.  A currently logged in user is
    determined by seeing if it exists in Flask's session dictionary.
    If the user is not logged in, None will be set to g.user.
    """

    # Set the user in the session dictionary as a global g.user and bail out
    # of this function early.
    if flask.session.get('user'):
        flask.g.user = flask.session.get('user')
        return

    flask.g.user = None

@root.route('/api/login', methods=['POST'])
def login_post_route():
    if flask.g.user:
        return JSONResponse({'email': flask.g.user.email})

    if 'credentials' not in flask.session:
        json_data = flask.request.get_json(True)
        auth_code = json_data['code']
        if not auth_code:
            return flask.redirect('client/login.html')

        constructor_kwargs = {
                'redirect_uri': sheet_config['redirectURI'],
                'auth_uri': "https://accounts.google.com/o/oauth2/auth",
                'token_uri': "https://accounts.google.com/o/oauth2/token",
            }
        flow = client.OAuth2WebServerFlow(
            sheet_config['clientID'], sheet_config['clientSecret'],
            'https://www.googleapis.com/auth/groups https://www.googleapis.com/auth/plus.me', **constructor_kwargs)

        credentials = flow.step2_exchange(auth_code)
        flask.session['credentials'] = credentials.to_json()
    else:
        credentials = client.OAuth2Credentials.from_json(flask.session['credentials'])
    http = credentials.authorize(httplib2.Http())

    plus_service = build("plus", "v1", http=http)
    user = plus_service.people().get(userId='me').execute(http=http)
    for i in range(0,len(user['emails'])):
            if user['emails'][i].get('type') == 'account':
                email = user['emails'][i].get('value')

    drive_service = build('script', 'v1', http=http)
    if sheet_config['isLoginBasedOnGroup'] == "true":
        request = {"function": "checkGroupMembership", "parameters": [sheet_config['loginGroupEmail'],email]}
        response = drive_service.scripts().run(body=request, scriptId=sheet_config['appsScriptID']).execute()
        if response.get('error') is not None or not response['response'].get('result'):
            flask.session.pop('credentials', None)
            flask.abort(401)

    request = {"function": "checkGroupMembership", "parameters": [sheet_config['editorGroupEmail'],email]}
    response = drive_service.scripts().run(body=request, scriptId=sheet_config['appsScriptID']).execute()
    if response.get('error') is not None:
        editor_enabled = 'false'
    else:
        editor_enabled = response['response'].get('result')

    state = models.get_state_model(user['id'])
    state.name = user['displayName']
    state.email = email
    state.provider = 'google'
    state.put()
    # Add the user to the current session
    image_url = user['image'].get('url')
    flask.session['user'] = dict(key_id=str(state.key.id()),id=user['id'],name=user['displayName'],email=email,provider='google',editor_enabled=editor_enabled,image_url=image_url)

    return JSONResponse({'email': email})

@root.route('/api/logout')
def logout():
    """Log out the user from the application.
    Log out the user from the application by removing them from the
    session.  Note: this does not log the user out of Google - this is done
    by the JavaScript SDK.
    """
    if flask.g.user:
        flask.session.pop('user', None)
        flask.session.pop('credentials', None)

    return JSONResponse({'status': 'ok'})

def calculate_amount(amount):
    assets = json.loads(amount)

    cash_prices = dict(zip(
        map(int, sheet_config['cashDialogBucks'].split(',')), map(float, sheet_config['cashDialogPays'].split(','))))

    return cash_prices[assets['cash']]

def JSONResponse(x):
    return flask.Response(
        json.dumps(x),
        content_type='application/json')
