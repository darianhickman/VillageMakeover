from google.appengine.api import memcache

import json
import gspread
import yaml
import os
from oauth2client.client import SignedJwtAssertionCredentials

local_config = yaml.load(open(os.path.join(os.path.dirname(__file__), '../config.yaml')))

catalog_name = 'Innovations Catalog Village Social OPERATIONAL DATA Devel'
config_name = 'Village MakeOver Settings OPERATIONAL'
news_feed_name = 'SOHIP Village News PRD'
cash_bundle_name = 'Virtual Currency Cash Bundle Catalog Operational'

is_login_necessary = False

# set the secret key.  keep this really secret:
secret_key = 'C0Zf73j/4yX R~DHH!juN]LZX/,?SL'

session = None

scope = ['https://spreadsheets.google.com/feeds']

def memcached(name):
    def wrapper(func):
        def cacher():
            ret = memcache.get(name)
            if ret:
                return json.loads(ret)
            else:
                ret = func()
                memcache.set(name, json.dumps(ret))
                return ret

        def remove():
            memcache.delete(name)

        cacher.remove_cache = remove

        return cacher

    return wrapper

def login():
    conf = local_config['spreadsheet']
    credentials = SignedJwtAssertionCredentials(conf['client_email'], conf['private_key'], scope)
    return gspread.authorize(credentials)

def get_session():
    global session
    if not session:
        session = login()
    return session

def get_sheet(name):
    return get_session().open(name).sheet1.get_all_values()

def get_config():
    data = get_sheet(config_name)
    d = {}
    for row in data[1:]:
        d[row[0]] = row[1]
    return d

def get_news_feed():
    data = get_sheet(news_feed_name)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

def get_login_condition():
    return is_login_necessary

def get_secret_key():
    return secret_key

@memcached('catalog')
def get_catalog():
    data = get_sheet(catalog_name)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items
