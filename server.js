'use strict';

var express = require('express');
var app = express();

const https = require('https');
const fs = require('fs');

var path = require('path');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const httpServer = https.createServer(options, app);
const expressws = require('express-ws')(app, httpServer);
const wss = expressws.getWss('/socket');

require('dotenv').load();

if(process.env.NODE_ENV == 'TEST')
  mongoose.connect(process.env.TESTDB_URI);
else
  mongoose.connect(process.env.MONGODB_URI);

mongoose.Promise = global.Promise;

app.set('title', 'FCC Stock Chart App');
app.set('view engine', 'pug');
app.set('views',  path.join(__dirname, 'app/views'));

app.use('/common',      express.static(path.join(__dirname, '/app/common')));
app.use('/controllers', express.static(path.join(__dirname, '/app/controllers')));
app.use('/public',      express.static(path.join(__dirname, '/public')));

app.use(session({
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

routes(app, wss);

var port = process.env.PORT || 8080;
httpServer.listen(port,  function () {
  console.log('Node.js listening on port ' + port + '...');
});

module.exports = app;
