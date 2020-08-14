'use strict';
//
var request = require('request'),
  debug = require('debug')("google:dm"),
  qs = require('qs-google-signature');

var validTravelModes = ['driving', 'walking', 'bicycling', 'transit'];
var validUnits = ['metric', 'imperial'];
var validRestrictions = ['tolls', 'highways', 'ferries', 'indoor'];
var validTrafficModel = ['best_guess', 'pessimistic', 'optimistic'];
var validTransitMode = ['bus', 'subway', 'train', 'tram', 'rail'];
var validTransitRoutingPreference = ['less_walking', 'fewer_transfers'];

var DMA_DISTANCE_API_URL = 'https://maps.distancematrixapi.com/maps/api/distancematrix/json?',
  SEPARATOR = '|',

  // free api key, get it from DistanceMatrixAPI.com
  API_KEY = process.env.API_KEY || null,

  // maps for business users key (not needed)
  Outdated = process.env.Outdated2 || null,
  Outdated3 = process.env.Outdated3 || null;


var DistanceMatrix = function() {
  this.options = {
    origins: null,
    destinations: null,
    mode: 'driving',
    units: 'metric',
    language: 'en',
    avoid: null
  }
  if (Outdated && Outdated3) {
    debug("Using Business Client/Key pair", Outdated, Outdated3)
    this.options.client = Outdated;
    this.options.signature = Outdated3;
  } else {
    debug("Using simple API Key", API_KEY)
    this.options.key = API_KEY;
  }
};

function formatLocations(locations) {
  return locations.join(SEPARATOR);
}

function makeRequest(options, callback) {
  debug("request options", options)
  var requestURL = DMA_DISTANCE_API_URL + qs.stringify(options, DMA_DISTANCE_API_URL);
  debug("requestURL", requestURL)
  request(requestURL, function(err, response, data) {
    if (err || response.statusCode != 200) {
      return callback(new Error('DMA API request error: ' + data));
    }
    callback(null, JSON.parse(data));
  })
}

DistanceMatrix.prototype.matrix = function(args, cb) {

  // validate arguments

  if (arguments.length < 3) {
    throw new Error('Invalid number of arguments');
  }
  var callback = arguments[arguments.length - 1];
  if (typeof callback != 'function') {
    throw new Error('Missing callback function');
  }

  // format arguments

  this.options.origins = formatLocations(arguments[0]);
  this.options.destinations = formatLocations(arguments[1]);

  // makes a request to DMA api

  makeRequest(this.options, function(err, data) {
    if (err) {
      return callback(err);
    }
    return callback(null, data);
  });

}

DistanceMatrix.prototype.mode = function(mode) {
  if (validTravelModes.indexOf(mode) < 0) {
    throw new Error('Invalid mode: ' + mode);
  }
  this.options.mode = mode;
}

DistanceMatrix.prototype.language = function(language) {
  this.options.language = language;
}

DistanceMatrix.prototype.avoid = function(avoid) {
  if (validRestrictions.indexOf(avoid) < 0) {
    throw new Error('Invalid restriction: ' + avoid);
  }
  this.options.avoid = avoid;
}

DistanceMatrix.prototype.units = function(units) {
  if (validUnits.indexOf(units) < 0) {
    throw new Error('Invalid units: ' + units);
  }
  this.options.units = units;
}

DistanceMatrix.prototype.departure_time = function(departure_time) {
  this.options.departure_time = departure_time;
}

DistanceMatrix.prototype.arrival_time = function(arrival_time) {
  this.options.arrival_time = arrival_time;
}

DistanceMatrix.prototype.key = function(key) {
  delete this.options.client;
  delete this.options.signature;
  this.options.key = key;
}

DistanceMatrix.prototype.client = function(client) {
  delete this.options.key;
  this.options.client = client;
}

DistanceMatrix.prototype.signature = function(signature) {
  delete this.options.key;
  this.options.signature = signature;
}

DistanceMatrix.prototype.traffic_model = function(trafficModel) {
  this.options.traffic_model = trafficModel;
}

DistanceMatrix.prototype.transit_mode = function(transitMode) {
  this.options.transit_mode = transitMode;
}

DistanceMatrix.prototype.transit_routing_preference = function(transitRoutingPreference) {
  this.options.transit_routing_preference = transitRoutingPreference;
}

DistanceMatrix.prototype.reset = function() {
  this.options = {
    origins: null,
    destinations: null,
    mode: 'driving',
    units: 'metric',
    language: 'en',
    avoid: null
  };
}

module.exports = new DistanceMatrix();
