const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper');
const Promise = require("bluebird");

let client = null
mongodb.connect(url)
.then(newClient => {
  console.log("successfully connected to db")
  client = newClient
  return client.db(dbName).collection('subway_stations').find({})
})
.then(data => data.toArray())
.then(subwayStations => {
  return Promise.map(subwayStations, (subwayStation) => {
    return mtaHelper.getSubwayServicesByStationId(subwayStation.stop_id)
  }, { concurrency: 1 })
})
.then(subwayStations => {
  return Promise.map(subwayStations, (subwayStation) => {
    if(subwayStation != null) {
      return client.db(dbName).collection('subway_stations').findOneAndUpdate(
        { stop_id: subwayStation.stationId },
        { $set: { service_ids: subwayStation.serviceIds } },
        { returnOriginal: false }
      )
    } else { return Promise.resolve() }
  }, { concurrency: 1 })
})
.then(subwayStations => {
  let copyArray = []
  subwayStations.forEach(subwayStation => {
    if(subwayStation.value.service_ids.length > 0) {
      copyArray.push(subwayStation.value)
    }
  })
  return client.db(dbName).collection('subway_stations_temp').insertMany(copyArray)
})
.then(() => client.db(dbName).collection('subway_stations').drop())
.then(() => client.db(dbName).collection('subway_stations_temp').rename('subway_stations'))
.then(() => client.db(dbName).collection('subway_stations').find({}))
.then(data => data.toArray())
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
