config.yaml
----------------

Create `config.yaml`:

```

braintree:
  server: [Sandbox,  'merchant_id', 'public_key', 'private_key']

spreadsheet:
  login: "mail-of-user-which-has-access-to-config-spreadsheets@gmail.com"
  password: "password-for-that-user"

facebook:
  FB_APP_ID: 'facebook APP ID'
  FB_APP_SECRET: 'facebook APP Secret'
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
