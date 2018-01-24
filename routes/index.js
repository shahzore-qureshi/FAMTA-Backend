var express = require('express');
var router = express.Router();
var toLowerCase = require('lower-case');
var ajax = require('request-promise');

router.get('/api/lines', function(req, res, next) {
  let response = { website: { status: "in progress" } }
  res.setHeader('content-type', 'application/json')
  res.status(200).send(JSON.stringify(response))
});

router.post('/flights', function(req, res, next) {
  console.log(req.body);
  var googleAPIKey = 'AIzaSyCCa8KMMaipuM55IcW63hu5-y21pOD9-SE';
  var ajaxParams = {
    method: 'POST',
    uri: 'https://www.googleapis.com/qpxExpress/v1/trips/search?key='
      + googleAPIKey,
    body: {
      request: {
        slice: [
          {
            origin: req.body.from,
            destination: req.body.to,
            date: req.body.dateRangeStart
          },
          {
            origin: req.body.to,
            destination: req.body.from,
            date: req.body.dateRangeEnd
          }
        ],
        passengers: {
          adultCount: 1,
          infantInLapCount: 0,
          infantInSeatCount: 0,
          childCount: 0,
          seniorCount: 0
        },
        solutions: 3,
        refundable: false
      }
    },
    json: true
  };

  ajax(ajaxParams)
    .then(function(body) {
      var response = [];

      var labels = body.trips.data;
      var trips = body.trips.tripOption;

      for(var i = 0; i < trips.length; i++) {
        var tripPrice = trips[i].saleTotal;

        var flightsToWedding = {
          duration: trips[i].slice[0].duration,
          airline: trips[i].slice[0].segment[0].flight.carrier, 
          departureFrom: req.body.from,
          departureTime: trips[i].slice[0].segment[0].leg[0].departureTime,
          arrivalTo: req.body.to,
          arrivalTime: trips[i].slice[0].segment[trips[i].slice[0].segment.length-1]
            .leg[0].arrivalTime
        };
        flightsToWedding.airline = labels.carrier.find(function(carrier) { 
          return carrier.code == flightsToWedding.airline
        });
        if(flightsToWedding.airline != null) {
          flightsToWedding.airline = flightsToWedding.airline.name;
        }

        var flightsBackHome = {
          duration: trips[i].slice[1].duration,
          airline: trips[i].slice[1].segment[0].flight.carrier, 
          departureFrom: req.body.to,
          departureTime: trips[i].slice[1].segment[0].leg[0].departureTime,
          arrivalTo: req.body.from,
          arrivalTime: trips[i].slice[1].segment[trips[i].slice[1].segment.length-1]
            .leg[0].arrivalTime
        };
        flightsBackHome.airline = labels.carrier.find(function(carrier) { 
          return carrier.code == flightsBackHome.airline
        });
        if(flightsBackHome.airline != null) {
          flightsBackHome.airline = flightsBackHome.airline.name;
        }

        var tripInfo = {
          price: tripPrice,
          flightsToWedding: flightsToWedding,
          flightsBackHome: flightsBackHome
        };

        response.push(tripInfo);
      }

      res.setHeader('content-type', 'application/json');
      res.status(200).send(JSON.stringify(response));
    })
    .catch(function(err) {
      console.log(err);
      res.setHeader('content-type', 'application/json');
      res.status(500).send(JSON.stringify(err));
    });
});

module.exports = router;
