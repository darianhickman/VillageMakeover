import gspread
import yaml
import os

local_config = yaml.load(open(os.path.join(os.path.dirname(__file__), '../config.yaml')))

innovations = 'Innovations Catalog Village Social OPERATIONAL DATA'

def login():
    conf = local_config['spreadsheet']
    return gspread.login(conf['login'], conf['password'])
