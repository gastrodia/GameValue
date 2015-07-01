/// <reference path="../typings/express/express.d.ts"/>
var express = require('express');
var router = require('./router');
var path = require('path');
var app = express();
var static_path = path.join(__dirname, '../../client-code');
var staticRouter = express.static(static_path);
app.use('/', staticRouter);
app.use('/api', router);
var port = 8010;
app.listen(port, function () {
    console.log('server is listening on port ' + port);
});
