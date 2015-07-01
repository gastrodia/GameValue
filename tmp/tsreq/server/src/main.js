/// <reference path="../typings/express/express.d.ts"/>
var express = require('express');
var router = require('./router');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
var static_path = path.join(__dirname, '../..');
var staticRouter = express.static(static_path);
app.use('/', staticRouter);
app.use('/api', router);
var port = 8010;
app.listen(port, function () {
    console.log('server is listening on port ' + port);
});
