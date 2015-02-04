import yaml
import os
import braintree

config = yaml.safe_load(
    open(os.path.dirname(__file__) + '/../config.yaml'))

braintree.Configuration.configure(
    braintree.Environment.Sandbox, # TODO
    *config['braintree']['server'][1:]
)
