'use strict';

var Stock = require('../models/stock');

function stockHandler() {
  this.index = (req, res) => {
    Stock.getStocks(stocks => {
      res.render('../views/stocks/index.pug', { stocks: stocks });
    });
  };

  this.createStock = (req, res) => {
    console.log(req.body.ticker);
    Stock
      .createStock(req.body.ticker, (stock) => {
        stock.getPriceData(apiPriceData => {
          stock.filterPriceData(apiPriceData, prices => {
            stock.updatePrices(prices, stock => {
              // console.log(stock.prices)
              res.redirect('/index');
            })
          })
        });
      });
  };

  this.deleteStock = (req, res) => {
    console.log('in deleteStock');
    Stock
      .deleteStock(req.params.stock_id, stock => {
        console.log('deleted ' + stock.ticker);
        res.redirect('/index');
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
