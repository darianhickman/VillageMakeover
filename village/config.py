from google.appengine.api import memcache

import json
import gspread
import yaml
import os
from oauth2client.client import SignedJwtAssertionCredentials

local_config = yaml.load(open(os.path.join(os.path.dirname(__file__), '../config.yaml')))

catalog_docid = '1imTZeg1aM4d2cWXpPPfHbTpQP6KX2HyxydqJfcejHtY'
config_docid = '1OEtPyvf7XGNxuVFqdHUCRbMl8rlmMS36eXPD6Kzdpvo'
goals_docid = '15hzNCemsXZNPGVBo9ugWhLzFmg3qIrNu9BXTryL9BQI'
news_feed_docid = '12xPbj-iVTmwnvsddxS3G9fJCR6YyfeZoobuCwTWHewM'
cash_bundle_docid = '1nIosYSuk6EeZhRbrD0f426UsWSQD2MatyznBSBtUacs'

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

def get_sheet(docid):
    return login().open_by_key(docid).sheet1.get_all_values()

def get_worksheet(sheet_docid,worksheet_name):
    sheet = login().open_by_key(sheet_docid)
    return sheet.worksheet(worksheet_name).get_all_values()

def get_config_worksheet(worksheet_name):
    data = get_worksheet(config_docid,worksheet_name)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

def get_goals_worksheet(worksheet_name):
    data = get_worksheet(goals_docid,worksheet_name)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

def get_goals_settings(worksheet_name):
    data = get_worksheet(goals_docid,worksheet_name)
    d = {}
    for row in data[1:]:
        d[row[0]] = row[1]
    return d

@memcached('config')
def get_config():
    data = get_sheet(config_docid)
    d = {}
    for row in data[1:]:
        d[row[2]] = row[3]
    return d

def get_news_feed():
    data = get_sheet(news_feed_docid)
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
    data = get_sheet(catalog_docid)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items
