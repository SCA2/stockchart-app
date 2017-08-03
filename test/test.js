'use strict';

process.env.NODE_ENV = 'TEST';

const mongoose = require('mongoose');
const Stock = require('../app/models/stock');

const apiTestData = require('./apiTestData.json');
const apiTestPrices = require('./apiTestPrices.json');

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Stock', () => {

  var stock;

  beforeEach(done => {
    Stock.count({}, (err, count) => {
      if(count > 0) {
        console.log('Deleting ' + count + ' stocks...');
        Stock.remove({}, (err, raw) => {
          console.log('Mongo: ' + raw);
          Stock.count({}, (err, count) => {
            console.log('Stocks at start: ' + count);
          });
        });
      }

      stock = new Stock({
        name: 'Apple',
        ticker: 'AAPL',
        prices: []
      });

      stock.save();
      done();         
    });
  });

  describe('instance', () => {
    it('starts with one stock in the database', done => {
      Stock.count({}, (err, count) => {
        expect(count).to.eql(1);
        done();         
      })
    });

    it('has a name', done => {
      expect(stock.name).to.eql('Apple');
      done();
    });

    it('has a ticker', done => {
      expect(stock.ticker).to.eql('AAPL');
      done();
    });

    it('has an empty list of prices', done => {
      expect(stock.prices).to.eql([]);
      done();
    });

    it('can update prices', done => {
      stock.updatePrices(apiTestPrices, doc => {
        expect(doc.prices[0]).to.eql(apiTestPrices[0]);
        done();
      });
    });

    it.skip('can get price data from intrinio', done => {
      stock.getPrices(apiData => {
        expect(apiData[0].close).to.eql(apiTestData[0].close);
        done();
      });
    });
  });


  describe('class', () => {
    it('starts with one stock in the database', done => {
      Stock.count({}, (err, count) => {
        expect(count).to.eql(1);
        done();
      })
    });

    it('can create a stock', done => {
      Stock.createStock('FNSR', stock => {
        expect(stock.ticker).to.eql('FNSR');
        Stock.count({}, (err, count) => {
          expect(count).to.eql(2)
          done();
        });
      });
    });

    it('can delete a stock', done => {
      Stock.deleteStock(stock, stock => {
        expect(stock.ticker).to.eql('AAPL');
        Stock.count({}, (err, count) => {
          expect(count).to.eql(0)
          done();
        });
      });
    });
  });
});

// describe('API', () => {

//   var stock, patron, patron_2;

//   beforeEach(() => {
//     stock = new Stock({
//       name: 'Microsoft',
//       ticker: 'MSFT',
//       prices: [1, 2, 3]
//     });
//   });

//   afterEach(() => {
//     stock.remove();
//   });

//   describe('/profile', () => {
//     it('redirects to /login if user not logged in', (done) => {
//       chai.request(server)
//       .get('/profile')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('GETs a logged-in user profile', (done) => {
//       passportStub.login( patron );
//       chai.request(server)
//       .get('/profile')
//       .end((err, res) => {
//         expect(res.status).to.eql(200);
//         expect(res.type).to.eql('text/html');
//         done();
//       });
//     });
//   });

//   describe('/api/bars', () => {
//     it('GETs all of the bars', (done) => {
//       chai.request(server)
//       .get('/api/bars')
//       .end((err, res) => {
//         expect(res.text).to.include('Firefly');
//         done();
//       });
//     });
//   });

//   describe('/api/bars/:bar_id/prices', () => {
//     it('gets patron count for bar_id', (done) => {
//       chai.request(server)
//       .get('/api/bars/' + stock._id + '/prices')
//       .end((err, res) => {
//         expect(res.body).to.equal(1);
//         expect(stock.getPatronCount()).to.equal(1);
//         done();
//       });
//     });

//     it('adds a patron to :bar_id', (done) => {
//       passportStub.login(patron_2);
//       chai.request(server)
//       .post('/api/bars/' + stock._id + '/prices')
//       .end((err, res) => {
//         expect(res.body).to.equal(2);
//         done();
//       });
//     });

//     it('removes a patron from :bar_id', (done) => {
//       passportStub.login(patron);
//       chai.request(server)
//       .delete('/api/bars/' + stock._id + '/prices')
//       .end((err, res) => {
//         expect(stock.getPatronCount()).to.equal(1);
//         done();
//       });
//     });
//   });
// });