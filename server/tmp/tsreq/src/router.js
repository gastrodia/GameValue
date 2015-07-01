/// <reference path="../typings/express/express.d.ts"/>
var express = require('express');
var router = express.Router();
router.get('/user', function (req, res) {
    res.json(['user']);
});
router.get('/face', function (req, res) {
    res.json(['face']);
});
module.exports = router;
