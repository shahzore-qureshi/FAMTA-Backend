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
    let stationToTimeMaps = await Promise.map(stationArray, subwayStation => {
      return mtaHelper.getSubwayStationToSubwayTimeMap(subwayStation.id)
    }, { concurrency: 1 })

    let times = []
    for(stationToTimeMap of stationToTimeMaps) {
      if(stationToTimeMap.serviceIds) {
        for(serviceId of stationToTimeMap.serviceIds) {
          let northBoundTrains = stationToTimeMap.N.filter(train => train.routeId == serviceId)
          for(train of northBoundTrains) {
            if(train.arrivalTime == null) train.arrivalTime = 1516957620
            train.arrivalTime *= 1000
            times.push({
              station_id: stationToTimeMap.stationId,
              service_id: serviceId,
              bound_id: "N",
              arrival_time: train.arrivalTime
            })
          }
          let southBoundTrains = stationToTimeMap.S.filter(train => train.routeId == serviceId)
          for(train of southBoundTrains) {
            if(train.arrivalTime == null) train.arrivalTime = 1516957620
            train.arrivalTime *= 1000
            times.push({
              station_id: stationToTimeMap.stationId,
              service_id: serviceId,
              bound_id: "S",
              arrival_time: train.arrivalTime
            })
          }
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
