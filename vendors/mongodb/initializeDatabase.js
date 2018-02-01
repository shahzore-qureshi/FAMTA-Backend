const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper');

(async () => {
  try {
    let client = await mongodb.connect(url)
    console.log("successfully connected to db")

    let servicesData = await client.db(dbName).listCollections({ name: 'subway_services' })
    let servicesArray = await servicesData.toArray()
    if(servicesArray.length > 0) {
      await client.db(dbName).collection('subway_services').drop()
    }

    let stationsData = await client.db(dbName).listCollections({ name: 'subway_stations' })
    let stationsArray = await stationsData.toArray()
    if(stationsArray.length > 0) {
      await client.db(dbName).collection('subway_stations').drop()
    }

    let subwayServices = [
      { id: "A", name: "A" }, { id: "C", name: "C" }, { id: "E", name: "E" },
      { id: "B", name: "B" }, { id: "D", name: "D" }, { id: "F", name: "F" }, { id: "M", name: "M" },
      { id: "G", name: "G" }, { id: "L", name: "L" }, { id: "J", name: "J" }, { id: "Z", name: "Z" },
      { id: "N", name: "N" }, { id: "Q", name: "Q" }, { id: "R", name: "R" }, { id: "W", name: "W" },
      { id: "1", name: "1" }, { id: "2", name: "2" }, { id: "3", name: "3" }, { id: "4", name: "4" },
      { id: "5", name: "5" }, { id: "5X", name: "5X" }, { id: "6", name: "6" }, { id: "6X", name: "6X" },
      { id: "7", name: "7" }, { id: "7X", name: "7X" }, { id: "GS", name: "S" }, { id: "SI", name: "SIR" },
      { id: "FS", name: "S" }, { id: "H", name: "S" }
    ]

    await client.db(dbName).collection('subway_services').insertMany(subwayServices)

    let testServicesData = await client.db(dbName).collection('subway_services').find({})
    let testServicesArray = await testServicesData.toArray()
    console.log(testServicesArray)

    let newStations = await mtaHelper.getSubwayStations
    newStations = newStations.map(subwayStation => {
      return {
        id: subwayStation.stop_id, name: subwayStation.stop_name,
        latitude: subwayStation.stop_lat, longitude: subwayStation.stop_lon,
        service_ids: subwayStation.service_ids
      }
    })
    newStations = newStations.filter(subwayStation => !subwayStation.id.endsWith("N") && !subwayStation.id.endsWith("S"))
    await client.db(dbName).collection('subway_stations').insertMany(newStations)

    let testStationsData = await client.db(dbName).collection('subway_stations').find({})
    let testStationsArray = await testStationsData.toArray()
    console.log(testStationsArray)

    await client.close()
  } catch(err) {
    console.log(err)
  }
})()
