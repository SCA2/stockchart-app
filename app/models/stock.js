'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({
  name: String,
  ticker: String,
  prices: [[Schema.Types.Number, Schema.Types.Number]]
});

Stock.statics.getStocks = function(cb) {
  function compare(a, b) {
    a = a.ticker.toUpperCase();
    b = b.ticker.toUpperCase();
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
  };

  this
    .find({})
    .exec(function (err, stocks) {
      if (err) { throw err; }
      cb(stocks);
    });
}

Stock.statics.createStock = function(ticker, cb) {
  console.log('create ticker: ' + ticker)
  this.create({ticker: ticker}, (err, stock) => {
    if(err) throw err;
    cb(stock);
  });
}

Stock.statics.deleteStock = function(id, cb) {
  console.log('delete id: ' + id)
  this.findOneAndRemove({_id: id}, (err, stock) => {
    if(err) throw err;
    cb(stock);
  });
}

Stock.methods.updatePrices = function(prices, cb) {
  this.model(this.constructor.modelName).findOneAndUpdate(
    { ticker: this.ticker },
    { $set: { prices: prices } },
    { new: true },
    (err, doc) => {
      if(err) { console.log('mongoose error: ' + err) }
      cb(doc);
    }
  );
}

Stock.methods.filterPriceData = function(apiPriceData, cb) {
  let filtered = apiPriceData.map(price => {
    return [new Date(price.date).getTime(), price.close]
  });
  cb(filtered);
}

Stock.methods.getPriceData = function(cb) {
  const model = this;
  const https = require("https");

  const username = process.env.INTRINIO_USERNAME;
  const password = process.env.INTRINIO_PASSWORD;
  const auth = "Basic " + new Buffer(username + ':' + password).toString('base64');

  let date = new Date(Date.now());
  date.setFullYear(date.getFullYear() - 1);
  let startDate = date.toISOString().substr(0, 10);

  let path = "/prices?identifier=" + this.ticker + '&start_date=' + startDate + '&sort_order=asc';

  function intrinioRequest(page, cb) {
    var request = https.request(
      {
        method: "GET",
        host: "api.intrinio.com",
        path: path + '&page_number=' + page,
        headers: { "Authorization": auth }
      },
      function(response) {
        var json = "";
        response.on('data', chunk => { json += chunk });
        response.on('end', () => {
          var data = JSON.parse(json);
          cb(data);
        });
      }
    );
    request.end();
  }
  
  let pageCount = 0;
  let apiPriceData = [];

  [1,2,3].forEach(page => {
    intrinioRequest(page, chunk => {
      pageCount += 1;
      apiPriceData = apiPriceData.concat(chunk.data);
      if(pageCount == 3) {
        apiPriceData = apiPriceData.sort(
          (a, b) => { return new Date(a.date) - new Date(b.date) }
        );
        cb(apiPriceData)
      }
    })
  });
}

module.exports = mongoose.model('Stock', Stock);


