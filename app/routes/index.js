'use strict';

var path = process.cwd();
var BarHandler = require(path + '/app/controllers/barHandler.server.js');

module.exports = function (app, passport) {

  function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  }

  var barHandler = new BarHandler();

  app.route('/')
    .get(function (req, res) {
      res.redirect('/search');
    });

  app.route('/login')
    .get(function (req, res) {
      res.redirect('/auth/twitter');
    });

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/search');
    });

  app.route('/profile')
    .get(isLoggedIn, function (req, res) {
      res.render(path + '/app/views/users/profile.pug');
    });

  app.route('/search')
    .get(barHandler.searchBars)
    .post(barHandler.searchBars);

  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

  app.route('/auth/twitter')
    .get(passport.authenticate('twitter'));

  app.route('/api/bars/:bar_id/patrons')
    .get(barHandler.getPatronCount)
    .post(isLoggedIn, barHandler.togglePatron)

};
