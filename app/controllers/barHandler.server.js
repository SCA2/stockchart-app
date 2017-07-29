'use strict';

var User = require('../models/user');
var Bar = require('../models/bar');

function barHandler() {
  this.searchBars = (req, res) => {
    let location = '94612';
    if(req.body.location) { location = req.body.location }
    else if(req.session.lastLocation) { location = req.session.lastLocation };
    req.session.lastLocation = location;
    Bar.searchBars(location, (bars) => {
      res.render('../views/bars/index.pug', { bars: bars });
    });
  };

  this.getPatronCount = (req, res) => {
    Bar
      .findById(req.params.bar_id, (err, bar) => {
        if(err) throw err;
        res.json(bar.getPatronCount());
      })
  };

  this.togglePatron = (req, res) => {
    Bar
      .findById(req.params.bar_id, (err, bar) => {
        if(err) throw err;
        bar.togglePatron(req.user, patronCount => {
          res.json(patronCount);
        });
      });
  };

  this.addPatron = (req, res) => {
    Bar
      .findById(req.params.bar_id, (err, bar) => {
        if(err) throw err;
        bar.addPatron(req.user, patronCount => {
          res.json(patronCount);
        });
      });
  };

  this.removePatron = (req, res) => {
    if(!req.user) { res.end(); return; }
    Bar
      .findById(req.params.bar_id, (err, bar) => {
        if(err) throw err;
        bar.removePatron(req.user);
        bar.save(err => {
          if(err) throw err;
          res.json(bar.getPatronCount());
        });
      });
  };
}

module.exports = barHandler;
