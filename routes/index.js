const express = require('express'),
      router = express.Router(),
      subwayHelper = require('../vendors/mongodb/subwayHelper')

router.get('/api/subway/stations', function(req, res, next) {
  subwayHelper.getSubwayStations.then(subwayStations => {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(subwayStations))
  })
})

router.get('/api/subway/stations/:lat/:lon', function(req, res, next) {
  if(req.params == null || req.params.lat == null || req.params.lon == null) {
    let err = { error: "Please provide latitude and longitude (ex. /stations/40.12/-74.15)." }
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(err))
    return
  }
  subwayHelper.getSubwayStationsByLatLon(req.params.lat, req.params.lon).then(subwayStations => {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(subwayStations))
  })
})

router.get('/api/subway/services', function(req, res, next) {
  subwayHelper.getSubwayServices.then(subwayServices => {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(subwayServices))
  })
})

router.get('/api/subway/times', function(req, res, next) {
  subwayHelper.getSubwayTimes.then(subwayTimes => {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(subwayTimes))
  })
})

router.get('/api/subway/times/:stationId/:serviceId/:boundId', function(req, res, next) {
  if(req.params == null
      || req.params.stationId == null
      || req.params.serviceId == null
      || req.params.boundId == null) {
    let err = { error: "Please provide station ID, service ID, and bound ID (ex. /stations/A02/A/N)." }
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(err))
    return
  }
  subwayHelper.getSubwayTimesByStationServiceBound(
    req.params.stationId, req.params.serviceId, req.params.boundId
  ).then(subwayTimes => {
    let timeArray = []
    subwayTimes.forEach(time => timeArray.push(time.arrivalTime))
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(timeArray))
  })
})

module.exports = router;
