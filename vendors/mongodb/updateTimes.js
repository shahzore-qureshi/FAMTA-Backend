const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper')
const Promise = require("bluebird");

(async () => {
  try {
    let client = await mongodb.connect(url)
    console.log("successfully connected to db")

    let timeData = await client.db(dbName).listCollections({ name: 'subway_times' })
    let timeArray = await timeData.toArray()
    if(timeArray.length > 0) {
      await client.db(dbName).collection('subway_times').drop()
    }
     
    let stationData = await client.db(dbName).collection('subway_stations').find({})
    let stationArray = await stationData.toArray()
    let stationMaps = await Promise.map(stationArray, subwayStation => {
      return mtaHelper.getSubwayStationServicesTimeMap(subwayStation.id)
    }, { concurrency: 1 })

    //UPDATE STATIONS WITH SERVICES
    await Promise.map(stationMaps, stationMap => {
        if(stationMap != null) {
          return client.db(dbName).collection('subway_stations').findOneAndUpdate(
            { id: stationMap.station_id },
            { $set: { service_ids: stationMap.service_ids } },
            { returnOriginal: false }
          )
        } else { return Promise.resolve() }
    }, { concurrency: 1 })

    //UPDATE TIMES
    let times = []

    //Remove maps that have no services.
    stationMaps = stationMaps.filter(stationMap => stationMap.service_ids.length > 0)

    for(stationMap of stationMaps) {
      for(service_id of stationMap.service_ids) {
        let northBoundTrains = stationMap.N.filter(train => train.routeId == service_id)
        for(train of northBoundTrains) {
          if(train.arrivalTime == null) train.arrivalTime = 1516957620
          train.arrivalTime *= 1000
          times.push({
            station_id: stationMap.station_id,
            service_id, 
            bound_id: "N",
            arrival_time: train.arrivalTime
          })
        }
        let southBoundTrains = stationMap.S.filter(train => train.routeId == service_id)
        for(train of southBoundTrains) {
          if(train.arrivalTime == null) train.arrivalTime = 1516957620
          train.arrivalTime *= 1000
          times.push({
            station_id: stationMap.station_id,
            service_id,
            bound_id: "S",
            arrival_time: train.arrivalTime
          })
        }
      }
    }
    await client.db(dbName).collection('subway_times').insertMany(times)

    let testTimeData = await client.db(dbName).collection('subway_times').find({})
    let testTimeArray = await testTimeData.toArray()
    console.log(testTimeArray)

    await client.close()
  } catch(err) {
    console.log(err)
  }
})()
