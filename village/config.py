from google.appengine.api import memcache

import json
import gspread
import yaml
import logging
import os
from oauth2client.client import SignedJwtAssertionCredentials
import httplib2
from apiclient import errors
from apiclient.discovery import build

local_config = yaml.load(open(os.path.join(os.path.dirname(__file__), '../config.yaml')))
logging.info(['configyaml', local_config])
is_login_necessary = False

# set the secret key.  keep this really secret:
secret_key = 'C0Zf73j/4yX R~DHH!juN]LZX/,?SL'

session = None

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

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

def copy_village_sheet(title):
    conf = local_config['spreadsheet']
    credentials = SignedJwtAssertionCredentials(conf['client_email'], conf['private_key'], scope)

    http = httplib2.Http()
    http = credentials.authorize(http)
    drive_service = build('drive', 'v2', http=http)
    file_copy = {'title': title}
    file_copy['parents'] = [{'id': sheet_config['driveFolderID']}]

    try:
        result = drive_service.files().copy(fileId=sheet_config['defaultVillageID'], body = file_copy).execute()
        return result["id"]
    except errors.HttpError, error:
        print error
        result = 'error'

    return result

def rename_village_sheet(village_docid,new_title):
    conf = local_config['spreadsheet']
    credentials = SignedJwtAssertionCredentials(conf['client_email'], conf['private_key'], scope)

    http = httplib2.Http()
    http = credentials.authorize(http)
    drive_service = build('drive', 'v2', http=http)

    file = drive_service.files().get(fileId=village_docid).execute()
    file['title'] = new_title
    updated_file = drive_service.files().update(fileId=village_docid,body=file).execute()
    return "success"

def delete_village_sheet(village_docid):
    conf = local_config['spreadsheet']
    credentials = SignedJwtAssertionCredentials(conf['client_email'], conf['private_key'], scope)

    http = httplib2.Http()
    http = credentials.authorize(http)
    drive_service = build('drive', 'v2', http=http)

    drive_service.files().delete(fileId=village_docid).execute()
    return "success"

def get_village_sheet(village_docid):
    data = get_sheet(village_docid)
    headers = data[0]
    items = []
    for row in data[1:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

def save_village_sheet(village_docid, data):
    current_spreadsheet = login().open_by_key(village_docid)
    current_worksheet = current_spreadsheet.sheet1
    current_row_count = current_worksheet.row_count
    new_row_count = len(data)

    #add rows if needed
    if(current_row_count - 1 < new_row_count):
        current_worksheet.add_rows(new_row_count - current_row_count + 1)
    #Select a range
    cell_list = current_worksheet.range('A2:H' + str(current_row_count))
    #clear existing values
    for cell in cell_list:
        cell.value = ""
    #fill cells with new values
    count = 0
    for i, val in enumerate(data):  #gives us a tuple of an index and value
        cell_list[0+count].value = val['id']    #use the index on cell_list and the val from cell_values
        cell_list[1+count].value = val['name']
        cell_list[2+count].value = val['x']
        cell_list[3+count].value = val['y']
        cell_list[4+count].value = val['w']
        cell_list[5+count].value = val['h']
        cell_list[6+count].value = val['buildStarted']
        cell_list[7+count].value = val['buildCompleted']
        count += 8

    # Update in batch
    current_worksheet.update_cells(cell_list)

    return "success"

def get_worksheet(sheet_docid,worksheet_name):
    sheet = login().open_by_key(sheet_docid)
    return sheet.worksheet(worksheet_name).get_all_values()

@memcached('config_assets')
def get_config_assets():
    conf = local_config['spreadsheet']
    config_docid = conf['config_docid']
    data = get_worksheet(config_docid,"assets")
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

@memcached('config_earnings')
def get_config_earnings():
    conf = local_config['spreadsheet']
    config_docid = conf['config_docid']
    data = get_worksheet(config_docid,"earnings")
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

@memcached('goals_data')
def get_goals_data():
    goals_docid = sheet_config['goals_docid']
    data = get_worksheet(goals_docid,"goals")
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

@memcached('goals_tasks')
def get_goals_tasks():
    goals_docid = sheet_config['goals_docid']
    data = get_worksheet(goals_docid,"tasks")
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items

@memcached('goals_settings')
def get_goals_settings():
    goals_docid = sheet_config['goals_docid']
    data = get_worksheet(goals_docid,"settings")
    d = {}
    for row in data[1:]:
        d[row[0]] = row[1]
    return d

@memcached('config')
def get_config():
    conf = local_config['spreadsheet']
    config_docid = conf['config_docid']
    logging.info(['config_docid', config_docid])
    data = get_sheet(config_docid)
    d = {}
    for row in data[1:]:
        d[row[2]] = row[3]
    # add logging statement here
    logging.info(d)
    return d

sheet_config = get_config()

def get_news_feed():
    news_feed_docid = sheet_config['news_feed_docid']
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
    catalog_docid = sheet_config['catalog_docid']
    data = get_sheet(catalog_docid)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items
