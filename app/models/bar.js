'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Bar = new Schema({
  name: String,
  id: String,
  url: String,
  image_url: String,
  location: {
    address1: String,
    address2: String,
    address3: String,
    city: String,
    zip_code: String,
    country: String,
    state: String
  },
  patrons: [Schema.Types.ObjectId]
});

Bar.methods.togglePatron = function(patron, cb) {
  if(this.patrons.indexOf(patron._id) == -1) {
    this.addPatron(patron, cb);
  } else {
    this.removePatron(patron, cb);
  }
}

Bar.methods.addPatron = function(patron, cb) {
  const model = this;
  model.patrons.addToSet(patron._id);
  model.save(function(err) {
    if(err) throw err;
    cb(model.patrons.length);
  });
}

Bar.methods.removePatron = function(patron, cb) {
  const model = this;
  model.patrons.pull({ _id: patron._id});
  model.save(function(err) {
    if(err) throw err;
    cb(model.patrons.length);
  });
}

Bar.methods.getPatronCount = function() {
  return this.patrons.length;
}

Bar.statics.searchBars = function(location, cb) {
  const yelp = require('yelp-fusion');
  const clientId = process.env.YELP_KEY;
  const clientSecret = process.env.YELP_SECRET;
  const model = this;

  const searchRequest = {
    term: 'bar',
    location: location
  };

  function compare(a, b) {
    a = a.name.toUpperCase(); // ignore upper and lowercase
    b = b.name.toUpperCase(); // ignore upper and lowercase
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
  };

  yelp.accessToken(clientId, clientSecret).then(response => {
    const client = yelp.client(response.jsonBody.access_token);
    let bars = [];
    client.search(searchRequest).then(response => {
      response.jsonBody.businesses.forEach((business, index, array) => {
        model.findOneAndUpdate(
          { 'id': business.id },
          { $set: {
            'id'        : business.id,
            'name'      : business.name,
            'url'       : business.url,
            'image_url' : business.image_url,
            'location'  : {
              'address1': business.location.address1,
              'address2': business.location.address2,
              'address3': business.location.address3,
              'city'    : business.location.city,
              'zip_code': business.location.zip_code,
              'country' : business.location.country,
              'state'   : business.location.state
            }
          } },
          { upsert: true, new: true },
          (err, bar) => {
            if(err) { console.log('mongoose error: ' + e) }
            bars.push(bar);
            if(index == (array.length - 1)) {
              bars = bars.sort(compare);
              cb(bars);
            }
          }
        );
      });
    });
  }).catch(e => {
    console.log('yelp error: ' + e);
  });
}

Bar.statics.getBars = function(location, cb) {
  location = location.trim();
  let city = location.split(/,\s*|\s+/)[0];
  let state = location.split(/,\s*|\s+/)[1];
  if(state === undefined) {
    Bar
      .find({ 'location.zip_code': '15217'})
      .exec(function (err, bars) {
        if (err) { throw err; }
        cb(bars);
      });
  } else {
    Bar
      .find({ 'location.city': city, 'location.state': state })
      .exec(function (err, bars) {
        if (err) { throw err; }
        cb(bars);
      });
  }
}

module.exports = mongoose.model('Bar', Bar);


