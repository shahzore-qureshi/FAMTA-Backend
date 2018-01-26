const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper');

var client = null
mongodb.connect(url)
.then(newClient => {
  console.log("successfully connected to db")
  client = newClient
  return client.db(dbName).listCollections({ name: 'subway_times' })
})
.then(data => { return data.toArray() })
.then(subwayTimes => {
  if(subwayTimes.length > 0) {
    return client.db(dbName).collection('subway_times').drop()
  } else {
    return Promise.resolve()
  }
})
.then(() => {
  return client.db(dbName).collection('subway_stations').find({})
})
.then(data => { return data.toArray() })
.then(subwayStations => {
  console.log(subwayStations)
  let promises = []
  for(subwayStation of subwayStations) {
    promises.push(mtaHelper.getSubwayTimesByStationId(subwayStation.stop_id))
  }
  return Promise.all(promises)
})
.then(results => {
  console.log(results)
  let times = []
  for(result of results) {
    if(result.serviceIds) {
      for(serviceId of result.serviceIds) {
        let northBoundTrains = result.N.filter(train => train.routeId == serviceId)
        for(train of northBoundTrains) {
          times.push({
            stationId: result.stationId,
            serviceId,
            boundId: "N",
            arrivalTime: train.arrivalTime
          })
        }
        let southBoundTrains = result.S.filter(train => train.routeId == serviceId)
        for(train of southBoundTrains) {
          times.push({
            stationId: result.stationId,
            serviceId,
            boundId: "S",
            arrivalTime: train.arrivalTime
          })
        }
      }
    }
  }
  return client.db(dbName).collection('subway_times').insertMany(times)
})
.then(() => {
  return client.db(dbName).collection('subway_times').find({})
})
.then(data => { return data.toArray() })
.then(subwayTimes => {
  console.log(subwayTimes)
})
.then(() => {
  client.close() 
})
.catch(err => {
  console.log("error was thrown")
  console.log(err)
})