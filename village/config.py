import gspread
import yaml
import os

local_config = yaml.load(open(os.path.join(os.path.dirname(__file__), '../config.yaml')))

catalog_name = 'Innovations Catalog Village Social OPERATIONAL DATA Devel'
config_name = 'Village MakeOver Settings OPERATIONAL'
cash_bundle_name = 'Virtual Currency Cash Bundle Catalog Operational'

session = None

def login():
    conf = local_config['spreadsheet']
    return gspread.login(conf['login'], conf['password'])

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

def get_catalog():
    data = get_sheet(catalog_name)
    headers = data[0]
    items = []
    for row in data[2:]:
        if row and row[0]:
            items.append(dict(zip(headers, row)))
    return items
