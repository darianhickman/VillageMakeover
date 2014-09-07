# -*- mode: python; eval: (elpy-mode 0) -*-
import load_libs; load_libs.do()
import flask
import jwt
import time

from .app_common import config

root = flask.Flask(__name__)

@root.route('/')
def index():
    return flask.redirect('/client/')

@root.route('/api/buy')
def api_buy():
    token = jwt.encode(
        {
            "iss" : config['wallet']['ident'],
            "aud" : "Google",
            "typ" : "google/payments/inapp/item/v1",
            "exp" : int(time.time() + 3600),
            "iat" : int(time.time()),
            "request" :{
                "name" : "Piece of Cake",
                "description" : "Virtual chocolate cake to fill your virtual tummy",
                "price" : "10.50",
                "currencyCode" : "USD",
                "sellerData" : "user_id:1224245,offer_code:3098576987,affiliate:aksdfbovu9j"
            }
        },
        config['wallet']['secret'])
    return {'token': token}
