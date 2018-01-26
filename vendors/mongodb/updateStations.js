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
  return client.db(dbName).collection('subway_stations').find({})
})
.then(data => { return data.toArray() })
.then(subwayStations => {
  console.log(subwayStations)
  let promises = []
  for(subwayStation of subwayStations) {
    promises.push(mtaHelper.getSubwayServicesByStationId(subwayStation.stop_id))
  }
  return Promise.all(promises)
})
.then(stations => {
  console.log(stations)
  let promises = []
  for(station of stations) {
    promises.push(
      client.db(dbName).collection('subway_stations').findOneAndUpdate(
        { stop_id: station.stationId },
        { $set: { service_ids: station.serviceIds } }
      )
    )
  }
  return Promise.all(promises)
})
.then(() => {
  return client.db(dbName).collection('subway_stations').find({})
})
.then(data => { return data.toArray() })
.then(subwayStations => {
  console.log(subwayStations)
})
.then(() => {
  client.close() 
})
.catch(err => {
  console.log("error was thrown")
  console.log(err)
})
