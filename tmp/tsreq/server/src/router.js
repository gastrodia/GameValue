/// <reference path="../typings/express/express.d.ts"/>
var express = require('express');
var world = require('./world');
var router = express.Router();
router.get('/outlet', function (req, res) {
    res.json(world.outlet);
});
router.get('/data', function (req, res) {
    res.json(world.data);
});
module.exports = router;
