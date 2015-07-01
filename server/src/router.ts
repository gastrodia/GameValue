/// <reference path="../typings/express/express.d.ts"/>
import express = require('express');
import db = require('./db');

var router = express.Router();

var world = {
  outlet:{
    world:{
      a:{},
      b:{}
    }

  },
  table :{//outlet中设置为__table的部分将作为data的key

  }
};
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
