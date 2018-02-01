const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper');
const Promise = require("bluebird");

(async () => {
  try {
    let client = await mongodb.connect(url)
    console.log("successfully connected to db")

    let stationData = await client.db(dbName).collection('subway_stations').find({})
    let stationArray = await stationData.toArray()

    let stationToServicesMaps = await Promise.map(stationArray, subwayStation => {
        return mtaHelper.getSubwayStationToSubwayServicesMap(subwayStation.id)
    }, { concurrency: 1 })

    let updatedStations = await Promise.map(stationToServicesMaps, stationToServicesMap => {
        if(stationToServicesMap != null) {
          return client.db(dbName).collection('subway_stations').findOneAndUpdate(
            { id: stationToServicesMap.stationId },
            { $set: { service_ids: stationToServicesMap.serviceIds } },
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

    await client.close()
  } catch(err) {
    console.log(err) 
  }
})()
