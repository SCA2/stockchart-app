'use strict';

const Stock = require('../models/stock');
const https = require('https');
const fs = require('fs');

function stockHandler(app) {

  const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  };
  
  const server = https.createServer(options, app);
  const expressws = require('express-ws')(app, server);
  const wss = expressws.getWss('/socket');

  this.index = (req, res) => {
    Stock.getStocks(stocks => {
      res.render('../views/stocks/index.pug', { stocks: stocks });
    });
  };

  this.createStock = (req, res) => {
    Stock
      .createStock(req.body.ticker, (stock) => {
        stock.getPriceData(apiPriceData => {
          stock.filterPriceData(apiPriceData, prices => {
            stock.updatePrices(prices, stock => {
              console.log('created ' + stock.ticker);
              res.redirect('/index');
              wss.clients.forEach((client) => {
                client.send('createStock');
              });
            })
          })
        });
      });
  };

  this.deleteStock = (req, res) => {
    Stock
      .deleteStock(req.params.stock_id, stock => {
        console.log('deleted ' + stock.ticker);
        res.redirect('/index');
        wss.clients.forEach((client) => {
          client.send('deleteStock');
        });
      });
  };

  this.getStocks = (req, res) => {
    console.log('in getStocks');
    Stock.getStocks(stocks => {
      res.json(stocks);
    });
  };

  this.getPriceData = (req, res) => {
    console.log('in getPriceData');
    Stock.findOne(req.body.ticker, stock => {
      res.json(stock.prices)
    })
  };
}

module.exports = stockHandler;
