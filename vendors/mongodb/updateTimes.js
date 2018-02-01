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
    let updatedStations = await Promise.map(stationMaps, stationMap => {
        if(stationMap != null) {
          return client.db(dbName).collection('subway_stations').findOneAndUpdate(
            { id: stationMap.stationId },
            { $set: { service_ids: stationMap.serviceIds } },
            { returnOriginal: false }
          )
        } else { return Promise.resolve() }
    }, { concurrency: 1 })

    let stationsWithAtLeastOneService = []
    updatedStations.forEach(subwayStation => {
      if(subwayStation.value.service_ids.length > 0) {
        stationsWithAtLeastOneService.push(subwayStation.value)
      }
    })

    await client.db(dbName).collection('subway_stations_temp').insertMany(stationsWithAtLeastOneService)
    await client.db(dbName).collection('subway_stations').drop()
    await client.db(dbName).collection('subway_stations_temp').rename('subway_stations')

    let checkStationData = await client.db(dbName).collection('subway_stations').find({})
    let checkStationArray = await checkStationData.toArray()
    console.log(checkStationArray)


    //UPDATE TIMES

    let times = []
    for(stationMap of stationMaps) {
      if(stationMap.serviceIds) {
        for(serviceId of stationMap.serviceIds) {
          let northBoundTrains = stationMap.N.filter(train => train.routeId == serviceId)
          for(train of northBoundTrains) {
            if(train.arrivalTime == null) train.arrivalTime = 1516957620
            train.arrivalTime *= 1000
            times.push({
              station_id: stationMap.stationId,
              service_id: serviceId,
              bound_id: "N",
              arrival_time: train.arrivalTime
            })
          }
          let southBoundTrains = stationMap.S.filter(train => train.routeId == serviceId)
          for(train of southBoundTrains) {
            if(train.arrivalTime == null) train.arrivalTime = 1516957620
            train.arrivalTime *= 1000
            times.push({
              station_id: stationMap.stationId,
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
