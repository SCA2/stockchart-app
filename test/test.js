'use strict';

process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../app/models/user');
const Bar = require('../app/models/bar');

const chai = require('chai');
const chaiHttp = require('chai-http');
const passportStub = require('passport-stub');

const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);
passportStub.install(server);

describe('Bar', () => {

  var bar, patron, patron_2;

  beforeEach(() => {
    bar = new Bar({
      name: 'Firefly',
      id: '1',
      patrons: []
    });

    patron = new User({
      github: {
        id: '1234',
        displayName: 'Joe Tester',
        username: 'username',
      }
    });

    patron_2 = new User({
      github: {
        id: '2345',
        displayName: 'Eric Tester',
        username: 'username2',
      }
    });
  });

  describe('instance', () => {
    it('has a name', done => {
      expect(bar.name).to.eql('Firefly');
      done();
    });

    it('has an id', done => {
      expect(bar.id).to.eql('1');
      done();
    });

    it('has an empty list of patrons', done => {
      expect(bar.patrons).to.eql([]);
      done();
    });

    it('can add a patron', done => {
      bar.addPatron(patron);
      expect(bar.patrons[0].equals(patron._id));
      done();
    });

    it('can remove a patron', done => {
      bar.addPatron(patron);
      bar.removePatron(patron);
      expect(bar.patrons).to.eql([]);
      done();
    });

    it('removes correct patron', done => {
      bar.addPatron(patron);
      bar.addPatron(patron_2);
      bar.removePatron(patron);
      expect(bar.patronCount()).to.eql(1);
      expect(bar.patrons[0].equals(patron_2._id)).to.be.true;
      done();
    });

    it('can return number of patrons', done => {
      expect(bar.patronCount()).to.eql(0);
      bar.addPatron(patron);
      expect(bar.patronCount()).to.eql(1);
      done();
    });
  });

  // describe('class', () => {
  //   it.only('can find local bars', done => {
  //     var barCount = 0;
  //     Bar.findLocalBars('oakland, ca', () => {
  //       Bar.count({}, (err, count) => {
  //         barCount = count;
  //         console.log(barCount);
  //       });
  //       expect(barCount).to.be.gt(0);
  //       done();
  //     });
  //   });
  // });
});

describe('API', () => {

  var bar, patron, patron_2;

  beforeEach(() => {
    bar = new Bar({
      name: 'Firefly',
      id: '1',
      image: 'url',
      patrons: []
    });

    patron = new User({
      github: {
        id: '1234',
        displayName: 'Joe Tester',
        username: 'username'
      }
    });

    patron_2 = new User({
      github: {
        id: '2345',
        displayName: 'Eric Tester',
        username: 'username2'
      }
    });

    bar.addPatron(patron, () => {});
  });

  afterEach(() => {
    patron.remove();
    patron_2.remove();
    bar.remove();
    passportStub.logout();
  });

  describe('/profile', () => {
    it('redirects to /login if user not logged in', (done) => {
      chai.request(server)
      .get('/profile')
      .redirects(0)
      .end((err, res) => {
        expect(res).to.redirect;
        expect(res.header.location).to.eql('/login');
        done();
      });
    });

    it('GETs a logged-in user profile', (done) => {
      passportStub.login( patron );
      chai.request(server)
      .get('/profile')
      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.type).to.eql('text/html');
        done();
      });
    });
  });

  describe('/api/bars', () => {
    it('GETs all of the bars', (done) => {
      chai.request(server)
      .get('/api/bars')
      .end((err, res) => {
        expect(res.text).to.include('Firefly');
        done();
      });
    });
  });

  describe('/api/bars/:bar_id/patrons', () => {
    it('gets patron count for bar_id', (done) => {
      chai.request(server)
      .get('/api/bars/' + bar._id + '/patrons')
      .end((err, res) => {
        expect(res.body).to.equal(1);
        expect(bar.getPatronCount()).to.equal(1);
        done();
      });
    });

    it.only('adds a patron to :bar_id', (done) => {
      passportStub.login(patron_2);
      chai.request(server)
      .post('/api/bars/' + bar._id + '/patrons')
      .end((err, res) => {
        expect(res.body).to.equal(2);
        done();
      });
    });

    it('removes a patron from :bar_id', (done) => {
      passportStub.login(patron);
      chai.request(server)
      .delete('/api/bars/' + bar._id + '/patrons')
      .end((err, res) => {
        expect(bar.getPatronCount()).to.equal(1);
        done();
      });
    });
  });
});