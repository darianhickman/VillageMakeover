import gspread
import yaml
import os

local_config = yaml.load(open(os.path.join(os.path.dirname(__file__), '../config.yaml')))

innovations_name = 'Innovations Catalog Village Social OPERATIONAL DATA Devel'
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

def get_config():
    data = get_session().open(config_name).sheet1.get_all_values()
    d = {}
    for row in data[1:]:
        d[row[0]] = row[1]
    return d
