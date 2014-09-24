import sys
import os

def do():
    # Appengine dev appserver won't import module
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/../libs'))
    print sys.path
