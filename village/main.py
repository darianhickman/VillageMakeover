# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import json
import braintree
import urllib
import logging
import os
import io
from flask import render_template
import config as config_module
from .app_common import config
from .config import get_config, get_catalog, get_news_feed, get_secret_key, get_config_assets, get_config_earnings, get_goals_data, get_goals_tasks, get_goals_settings, get_dropdown_menu, get_special_events
from . import models
from google.appengine.api import mail, app_identity

root = flask.Flask(__name__)

root.secret_key  = get_secret_key()

@root.route('/')
def index():
    return flask.redirect('/client/')

@root.route('/view/<village_id>')
def view_village(village_id):
    return flask.redirect('/client/?v=' + village_id)

@root.route('/config', methods=['POST'])
def config_route():
    worksheet_name = flask.request.form.get("worksheet")
    logging.info(['worksheet_name',worksheet_name ])

    if worksheet_name == "assets":
        return flask.Response(json.dumps(get_config_assets()),content_type='application/json')
    elif worksheet_name == "earnings":
        return flask.Response(json.dumps(get_config_earnings()),content_type='application/json')
    else:
        return flask.Response(json.dumps(dict(get_config()),indent=4),content_type='application/json')

@root.route('/getclientid')
def client_id_route():
    sheet_config = get_config()
    client_id = sheet_config['clientID']
    return flask.Response(json.dumps({'client_id':client_id}),content_type='application/json')

@root.route('/goals')
def goals_route():
    goals_data = get_goals_data()
    tasks_data = get_goals_tasks()
    settings_data = get_goals_settings()

    return flask.Response(json.dumps({'goals':goals_data, 'settings':settings_data, 'tasks':tasks_data}),content_type='application/json')

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
        item['builtCell'] = int(item['builtCell'])
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
    remember = flask.request.form.get("remember") == 'on'
    param = flask.request.form.get("param", 'none')
    user = flask.session.get('user', None)
    if user:
        userid = user['id']
    else:
        userid = flask.request.form.get("userID", 'none')
    state = models.get_state_model(userid)
    result = braintree.Customer.create({'payment_method_nonce': nonce})
    if not result.is_success:
        return flask.redirect('/client/pay.html?status=fail&param=' + urllib.quote(param))
    state.customer_id = result.customer.id
    state.customer_id_once = not remember
    state.put()
    return flask.redirect('/client/#pay=' + urllib.quote(param))

@root.route('/newsFeed')
def news_feed_route():
    return flask.Response(json.dumps(get_news_feed()),content_type='application/json')

@root.route('/dropdownmenu')
def dropdown_menu_route():
    return flask.Response(json.dumps(get_dropdown_menu()),content_type='application/json')

@root.route('/specialevents')
def special_events_route():
    return flask.Response(json.dumps(get_special_events()),content_type='application/json')

@root.route('/cache/flush')
def flush_memcache_all():
    cache_dict = {'config':'get_config','assets':'get_config_assets','earnings':'get_config_earnings','goalsdata':'get_goals_data','goalstasks':'get_goals_tasks','goalssettings':'get_goals_settings','catalog':'get_catalog','dropdownmenu':'get_dropdown_menu','specialevents':'get_special_events'}
    for item in cache_dict.values():
        method = getattr(config_module, item)
        method.remove_cache()
    return flask.Response('Removed all caches')

@root.route('/cache/flush/<cache_id>')
def flush_memcache_by_key(cache_id):
    cache_dict = {'config':'get_config','assets':'get_config_assets','earnings':'get_config_earnings','goalsdata':'get_goals_data','goalstasks':'get_goals_tasks','goalssettings':'get_goals_settings','catalog':'get_catalog','dropdownmenu':'get_dropdown_menu','specialevents':'get_special_events'}
    try:
        method = getattr(config_module, cache_dict[cache_id])
        method.remove_cache()
    except KeyError:
        return flask.Response('Cache not found for ' + cache_id)
    return flask.Response('Removed cache for ' + cache_id)

def scan_config(config_key):
    client_dir = os.path.join(os.path.dirname(__file__),'../client')
    exclude_client_files = ['game.js','MailChimpTemplate.html', 'crypto-js-hmac.js']
    client_files = [os.path.join(root, name) for root, dirs, files in os.walk(client_dir) for name in files if name.endswith(("js",".html", ".htm")) and name not in exclude_client_files]
    village_files = [fn for fn in os.listdir(os.path.dirname(__file__)) if fn.endswith('.py')]
    files = client_files + village_files

    sheet_config = dict(get_config())
    found_dict = {}
    for fn in files:
        with io.open(os.path.join(os.path.dirname(__file__), fn), 'r', encoding='utf-8') as file:
            if config_key == 'all':
                for line in file:
                    for key, value in sheet_config.items():
                        found_dict[key] = 'not found'
                        if key in line:
                            found_dict[key] = file.name
                            sheet_config.pop(key, None)
            else:
                found_dict[config_key] = 'not found'
                for line in file:
                    if config_key in line:
                        found_dict[config_key] = file.name
                        return found_dict

    return found_dict

@root.route('/config/scan')
def scan_config_all():
    found_dict = scan_config('all')
    return render_template('scan_results.html', results=found_dict)

@root.route('/config/scan/<config_key>')
def scan_config_by_key(config_key):
    found_dict = scan_config(config_key)
    return render_template('single_key_scan_results.html', results=found_dict)

@root.route('/sendfeedback', methods=['POST'])
def send_feedback():
    json_data = flask.request.get_json(True)
    name = json_data['name']
    email = json_data['email']
    message = json_data['message']
    sheet_config = get_config()
    receiver = sheet_config['feedBackEmailReceiver']
    sent_message = sheet_config['feedBackSentMessage']
    mail.send_mail(sender = "feedback@" + app_identity.get_application_id() + ".appspotmail.com",
                       to = receiver,
                       subject = app_identity.get_application_id() + " Feedback Form",
                       body = "Email: " + email + " Name: " + name + " Message: " + message)
    return flask.Response(json.dumps({'message' : sent_message}), content_type='application/json')