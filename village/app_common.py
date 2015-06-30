import yaml
import os
import braintree
from .config import get_config

config = yaml.safe_load(
    open(os.path.dirname(__file__) + '/../config.yaml'))

sheet_config = get_config()

_braintree_conf = sheet_config['braintreeServer']
_braintree_conf = _braintree_conf.split(',')

braintree.Configuration.configure(
    getattr(braintree.Environment, _braintree_conf[0]), # TODO
    *_braintree_conf[1:]
)
