/// <reference path="../typings/express/express.d.ts"/>
import express = require('express');
import router = require('./router');
import path = require('path');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var multer = require('multer');



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data


var static_path = path.join(__dirname,'../..');
var staticRouter  = express.static(static_path);
app.use('/',staticRouter);

app.use('/api',router);


var io = require('socket.io')(server);
var socket = require('./socket');
io.on('connection', socket);

var port:number = 8010;

server.listen(port,function(){
  console.log('server is listening on port ' + port);
});
