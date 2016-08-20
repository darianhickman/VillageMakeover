# -*- mode: python; eval: (elpy-mode 0) -*-
from google.appengine.ext import ndb

from .config import get_config

import json

sheet_config = get_config()

INIT_STATE = {
    'first': 'true',
    'coins': int(sheet_config['startCoins']),
    'cash': int(sheet_config['startCash']),
    'water': int(sheet_config['startWater'])
}

class State(ndb.Model):
    userid = ndb.StringProperty()
    data = ndb.TextProperty()
    customer_id = ndb.StringProperty()
    customer_id_once = ndb.BooleanProperty()
    name = ndb.StringProperty()
    email = ndb.StringProperty()
    provider = ndb.StringProperty()

#TODO: @ndb.transctional
def get_state_model(userid):
    state = State.query().filter(State.userid == userid).get()
    if not state:
        state = State(userid=userid, data=json.dumps(INIT_STATE))
    return state

def get_state(userid):
    return json.loads(get_state_model(userid).data)

def save_state(userid, state):
    model = get_state_model(userid)
    model.data = json.dumps(state)
    model.put()

def get_state_data(key_id):
    try:
        state = State.get_by_id(int(key_id))
        if state:
            return json.loads(state.data)
        return None
    except ValueError:
        return None

class Villages(ndb.Model):
    village_id = ndb.StringProperty()
    spreadsheet_docid = ndb.StringProperty()
    title = ndb.StringProperty()
    organization = ndb.StringProperty()
    last_saved_by = ndb.StringProperty()
    viewable = ndb.BooleanProperty()

#TODO: @ndb.transctional
def get_village_model(village_id):
    village = Villages.query().filter(Villages.village_id == village_id).get()
    if not village:
        village = Villages(village_id=village_id)
    return village

def get_villages():
    return Villages.query().fetch()

def save_village(village_id,spreadsheet_docid,title,organization,last_saved_by,viewable):
    model = get_village_model(village_id)
    model.spreadsheet_docid = spreadsheet_docid
    model.title = title
    model.organization = organization
    model.last_saved_by = last_saved_by
    model.viewable = viewable
    model.put()