import yaml
import os
import braintree

config = yaml.safe_load(
    open(os.path.dirname(__file__) + '/../config.yaml'))

_braintree_conf = config['braintree']['server']

braintree.Configuration.configure(
    getattr(braintree.Environment, _braintree_conf[0]), # TODO
    *_braintree_conf[1:]
)
