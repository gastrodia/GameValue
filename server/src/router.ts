/// <reference path="../typings/express/express.d.ts"/>
import express = require('express');
import db = require('./db');
import world = require('./world');
var router = express.Router();

router.get('/outlet',function(req,res){
  res.json(world.outlet);
});

router.post('/outlet',function(req,res){
  world.outlet = req.body;
  res.json({ok:true});
});

router.get('/face',function(req,res){
  res.json(['face']);
});

export = router;
