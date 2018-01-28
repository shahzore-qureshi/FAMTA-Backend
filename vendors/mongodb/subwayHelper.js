const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'

const getSubwayLines =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_lines').find({})
  }).then(data => {
    return data.toArray()
  })

const getSubwayServices =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_services').find({})
  }).then(data => {
    return data.toArray()
  })

const getSubwayStations =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  })

const getSubwayStationsByLatLon = (lat, lon) => {
  return mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  }).then(results => {
    let resultsArray = Object.values(results)
    let filteredArray = resultsArray.filter(station =>
      !station.stop_id.endsWith("N") && !station.stop_id.endsWith("S"))
    let sortedArray = filteredArray.sort((a,b) => {
      let distA = Math.sqrt(Math.pow(a.stop_lat - lat, 2)
                    + Math.pow(a.stop_lon - lon, 2))
      let distB = Math.sqrt(Math.pow(b.stop_lat - lat, 2)
                    + Math.pow(b.stop_lon - lon, 2))
      if(distA < distB) return -1
      if(distA > distB) return 1
      return 0
    })
    return sortedArray.slice(0, 10)
  })
}

const getSubwayTimes =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_times').find({})
  }).then(data => {
    return data.toArray()
  })

const getSubwayTimesByStationServiceBound = (stationId, serviceId, boundId) =>
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_times').find({
      stationId, serviceId, boundId
    })
  }).then(data => {
    return data.toArray()
  })

module.exports = {
  getSubwayLines, getSubwayServices,
  getSubwayStations, getSubwayStationsByLatLon,
  getSubwayTimes, getSubwayTimesByStationServiceBound
}
