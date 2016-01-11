Spreadsheets
-----------
Duplicate all of the spreadsheets and put docids into the settings spreadsheet

config.yaml
----------------

For service account credentials: https://console.developers.google.com/apis/credentials?project=[your-project-name]
  - Create new service account
  - Download JSON and copy/paste values into config.yaml
  - Share all of the spreadsheets with service account Email address

Create `config.yaml`:

```

spreadsheet:
  config_docid: "config-spreadsheet-docid"
  private_key_id: "values-from-google-developer-service-account"
  private_key: "values-from-google-developer-service-account"
  client_email: "values-from-google-developer-service-account"
  client_id: "values-from-google-developer-service-account"
  type: "service_account"
```

Deployment
-----------

Install pip and virtualenv. For example, on MacOSX:

```
sudo easy_install pip
sudo pip install virtualenv
```

Clone full version of IGE to `ige` directory.

Install Node.js and then IGE deps via NPM:

```
cd ige/server
npm install
```

Deploy:

```
./upload.sh
```

OAuth 2.0
-----------

For OAuth2 2.0 credentials: https://console.developers.google.com/apis/credentials?project=[your-project-name]
Create new OAuth client ID
  - Application type: Web application
  - Authorized JavaScript origins: Deployment or development URL
  - Authorized redirect URIs: Deployment or development URL
Download JSON and copy/paste values into config spreadsheet

App Script
-----------

  - Duplicate App Script
  - Go to Resources -> Developers Console Project... and enter your project number
  - Go to Publish -> Deploy as API Executable select a version select Anyone and hit Update.
  - Go to Publish -> Deploy as API Executable and copy Current API ID and paste it into appsScriptID property of the settings sheet

Important Settings
-----------
Consider updating:
  - editorGroupEmail
  - loginGroupEmail
  - driveFolderID
  - all of the spreadsheet and app script docids