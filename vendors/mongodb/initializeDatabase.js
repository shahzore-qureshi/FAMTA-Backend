const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper');

(async () => {
  try {
    let client = await mongodb.connect(url)
    console.log("successfully connected to db")

    let boundsData = await client.db(dbName).listCollections({ name: 'subway_bounds' })
    let boundsArray = await boundsData.toArray()
    if(boundsArray.length > 0) {
      await client.db(dbName).collection('subway_bounds').drop()
    }
    
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

    let linesData = await client.db(dbName).listCollections({ name: 'subway_lines' })
    let linesArray = await linesData.toArray()
    if(linesArray.length > 0) {
      await client.db(dbName).collection('subway_lines').drop()
    }

    let subwayBounds = [
      { name: "Manhattan: Inwood - 207 Street", direction: "N" }, { name: "Brooklyn: Grant Ave, Queens: Rockaway Boulevard", direction: "S" },
      { name: "Manhattan: Washington Heights - 168 St", direction: "N" }, { name: "Brooklyn: Euclid Avenue", direction: "S" },
      { name: "Queens: Jamaica Center - Parsons", direction: "N" }, { name: "Manhattan: World Trade Center", direction: "S" },
      { name: "Bronx: Bedford Park Boulevard", direction: "N" }, { name: "Manhattan: Grand Street, Brooklyn: Brighton Beach", direction: "S" },
      { name: "Bronx: Norwood - 205 Street", direction: "N" }, { name: "Manhattan: Grand Street, Brooklyn: Coney Island - Stillwell Avenue", direction: "S" },
      { name: "Queens: Jamaica - 179 Street", direction: "N" }, { name: "Manhattan: East Broadway, Brooklyn: Coney Island - Stillwell Avenue", direction: "S" },
      { name: "Queens: Forest Hills - 71 Avenue", direction: "N" }, { name: "Manhattan: Essex Street, Brooklyn: Myrtle - Wyckoff Avenues, Queens: Metropolitan Avenue", direction: "S" },
      { name: "Queens: Court Sq", direction: "N" }, { name: "Brooklyn: Church Avenue", direction: "S" },
      { name: "Manhattan: 8 Avenue", direction: "N" }, { name: "Brooklyn: Canarsie - Rockaway Parkway", direction: "S" },
      { name: "Queens: Jamaica Center - Parsons", direction: "N" }, { name: "Brooklyn: Marcy Avenue, Manhattan: Broad Street", direction: "S" },
      { name: "Queens: Jamaica Center - Parsons", direction: "N" }, { name: "Brooklyn: Marcy Avenue, Manhattan: Broad Street", direction: "S" },
      { name: "Queens: Astoria - Ditmars Boulevard", direction: "N" }, { name: "Manhattan: Whitehall Street - South Ferry, Brooklyn: Coney Island - Stillwell Avenue", direction: "S" },
      { name: "Manhattan: 96 Street", direction: "N" }, { name: "Brooklyn: Coney Island - Stillwell Avenue", direction: "S" },
      { name: "Queens: Forest Hills - 71 Avenue", direction: "N" }, { name: "Manhattan: Whitehall Street - South Ferry, Brooklyn: Bay Ridge - 95 Street", direction: "S" },
      { name: "Queens: Astoria - Ditmars Boulevard", direction: "N" }, { name: "Manhattan: Whitehall Street", direction: "S" },
      { name: "Bronx: Van Cortlandt Park - 242 Street", direction: "N" }, { name: "Manhattan: South Ferry", direction: "S" },
      { name: "Bronx: Wakefield - 241 Street", direction: "N" }, { name: "Manhattan: Wall Street, Brooklyn: Flatbush Avenue - Brooklyn College", direction: "S" },
      { name: "Manhattan: Harlem - 148 Street", direction: "N" }, { name: "Brooklyn: New Lots Avenue", direction: "S" },
      { name: "Bronx: Woodlawn", direction: "N" }, { name: "Manhattan: Bowling Green, Brooklyn: New Lots Avenue", direction: "S" },
      { name: "Bronx: East 180 Street", direction: "N" }, { name: "Manhattan: Bowling Green, Brooklyn: Flatbush Avenue - Brooklyn College", direction: "S" },
      { name: "Bronx: Nereid Av", direction: "N" }, { name: "Bronx: Bronx Park East", direction: "S" },
      { name: "Bronx: Pelham Bay Park", direction: "N" }, { name: "Manhattan: Brooklyn Bridge - City Hall", direction: "S" },
      { name: "Bronx: Pelham Bay Park", direction: "N" }, { name: "Manhattan: Brooklyn Bridge - City Hall", direction: "S" },
      { name: "Queens: Flushing - Main Street", direction: "N" }, { name: "Manhattan: 34 St - Hudson Yards", direction: "S" },
      { name: "Queens: Flushing - Main Street", direction: "N" }, { name: "Manhattan: 34 St - Hudson Yards", direction: "S" },
      { name: "Manhattan: 42 Street - Times Square", direction: "N" }, { name: "Manhattan: 42 St - Grand Central", direction: "S" },
      { name: "Staten Island: St George", direction: "N" }, { name: "Staten Island: Tottenville", direction: "S" },
      { name: "Brooklyn: Franklin Avenue", direction: "N" }, { name: "Brooklyn: Prospect Park", direction: "S" },
      { name: "Queens: Broad Channel", direction: "N" }, { name: "Queens: Rockaway Park - Beach 116 Street", direction: "S" }
    ]

    let insertedBounds = await client.db(dbName).collection('subway_bounds').insertMany(subwayBounds)
    
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

    let serviceCounter = 0
    for(boundCounter = 0; boundCounter < insertedBounds.ops.length; boundCounter++) {
      let bound = insertedBounds.ops[boundCounter]
      if(subwayServices[serviceCounter]["bound_ids"] == null) {
        subwayServices[serviceCounter]["bound_ids"] = []
      }
      subwayServices[serviceCounter]["bound_ids"].push(bound._id)
      if(boundCounter % 2 != 0) {
        serviceCounter++
      }
    }

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
