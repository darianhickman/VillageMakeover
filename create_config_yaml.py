import sys
import json

config_docid_name = sys.argv[1]

with open('client-secret.json') as client_secret_file:
    client_secret_data = json.load(client_secret_file)

with open('config2.yaml', 'w') as outfile:
    outfile.write('spreadsheet:\n')
    outfile.write('  config_docid: "' + config_docid_name + '"\n')
    outfile.write('  private_key_id: ' + json.dumps(client_secret_data["private_key_id"]) + '\n')
    outfile.write('  private_key: ' + json.dumps(client_secret_data["private_key"]) + '\n')
    outfile.write('  client_email: ' + json.dumps(client_secret_data["client_email"]) + '\n')
    outfile.write('  client_id: ' + json.dumps(client_secret_data["client_id"]) + '\n')
    outfile.write('  type: "service_account"')