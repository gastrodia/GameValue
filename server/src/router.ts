/// <reference path="../typings/express/express.d.ts"/>
import express = require('express');
import db = require('./db');
import world = require('./world');
var router = express.Router();

router.get('/outlet',function(req,res){
  res.json(world.outlet);
});

router.get('/data',function(req,res){
  res.json(world.data);
});

export = router;
