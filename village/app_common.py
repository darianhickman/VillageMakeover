import yaml
import os

config = yaml.safe_load(
    open(os.path.dirname(__file__) + '/../config.yaml'))
