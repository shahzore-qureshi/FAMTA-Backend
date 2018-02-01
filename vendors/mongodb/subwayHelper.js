const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'

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

const getSubwayStationsWithServices =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  }).then(results => {
    return results.filter(station => station.service_ids.length > 0)
  })

const getSubwayStationsByLatLon = (lat, lon) => {
  return mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  }).then(results => {
    let filteredArray = results.filter(station =>
      !station.id.endsWith("N") && !station.id.endsWith("S"))
    let sortedArray = filteredArray.sort((a,b) => {
      let distA = Math.sqrt(Math.pow(a.latitude - lat, 2)
                    + Math.pow(a.longitude - lon, 2))
      let distB = Math.sqrt(Math.pow(b.latitude - lat, 2)
                    + Math.pow(b.longitude - lon, 2))
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
      station_id: stationId, service_id: serviceId, bound_id: boundId
    })
  }).then(data => {
    return data.toArray()
  })

module.exports = {
  getSubwayServices, getSubwayStations,
  getSubwayStationsWithServices, getSubwayStationsByLatLon,
  getSubwayTimes, getSubwayTimesByStationServiceBound
}
