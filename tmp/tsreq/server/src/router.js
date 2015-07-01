/// <reference path="../typings/express/express.d.ts"/>
var express = require('express');
var router = express.Router();
var world = {
    outlet: {
        world: {
            a: {},
            b: {}
        }
    },
    table: {}
};
router.get('/outlet', function (req, res) {
    res.json(world.outlet);
});
router.post('/outlet', function (req, res) {
    world.outlet = req.body;
    res.json({ ok: true });
});
router.get('/face', function (req, res) {
    res.json(['face']);
});
module.exports = router;