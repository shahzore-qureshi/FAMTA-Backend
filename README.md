# How To Start Server (locally)
Run this command to start the web server:

```
DEBUG=app:\* PORT=80 npm start
```

Press ```Ctrl + C``` to stop the web server.

Run this command to start the database:

```
mongod --dbpath=/home/mongodb
```

Press ```Ctrl + C``` to stop the web server.

# How To Start Server (production)
Run this command to start the web server:

```systemctl start express.service```

Run this command to stop the web server:

```systemctl stop express.service```

Run this command to check the current status of the web server:

```systemctl status express.service -l```

Run this command to start the web server:

```service mongodb start```

Run this command to stop the web server:

```service mongodb stop```
