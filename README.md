config.yaml
----------------

Create `config.yaml`:

```

braintree:
  server: [Sandbox,  '', '', '']
  client:


spreadsheet:
  login: "mail-of-user-which-has-access-to-config-spreadsheets@gmail.com"
  password: "password-for-that-user"
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
