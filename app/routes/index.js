'use strict';

var path = process.cwd();
var StockHandler = require(path + '/app/controllers/stockHandler.server.js');

module.exports = function (app, passport) {

  var stockHandler = new StockHandler();

  app.route('/')
    .get(function (req, res) {
      res.redirect('/search');
    });

  app.route('/search')
    .get(stockHandler.searchBars)
    .post(stockHandler.searchBars);

  app.route('/api/bars/:bar_id/patrons')
    .get(stockHandler.getPatronCount)
    .post(isLoggedIn, stockHandler.togglePatron)

};
