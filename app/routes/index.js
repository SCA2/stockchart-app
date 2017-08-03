'use strict';

var path = process.cwd();
var StockHandler = require(path + '/app/controllers/stockHandler.server.js');

module.exports = function (app) {

  var stockHandler = new StockHandler(app);

  app.route('/')
    .get(function (req, res) {
      res.redirect('/index');
    });

  app.route('/index')
    .get(stockHandler.index);

  app.route('/create')
    .post(stockHandler.createStock);

  app.wss('/socket', function(ws, req) {
      console.log('connected');
  });

  app.route('/api/stocks/:stock_id')
    .get(stockHandler.getPriceData)
    .delete(stockHandler.deleteStock)

  app.route('/api/stocks')
    .get(stockHandler.getStocks)
    .post(stockHandler.createStock);

};
