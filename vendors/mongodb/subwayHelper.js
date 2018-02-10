const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'

const getSubwayServices =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_services').find({})
  }).then(data => {
    return data.toArray()
  }).then(array => array.map(service => {
    return {
      id: service.id,
      name: service.name,
      northbound_id: service.northbound_id,
      southbound_id: service.southbound_id
    }
  }))

const getSubwayBounds =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_bounds').find({})
  }).then(data => {
    return data.toArray()
  }).then(array => array.map(bound => {
    return {
      id: bound._id,
      name: bound.name,
      direction: bound.direction
    }
  }))

const getSubwayStations =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  }).then(array => array.map(station => {
    return {
      id: station.id,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      service_ids: station.service_ids 
    }
  }))

const getSubwayStationsWithServices =
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  }).then(results => {
    return results.reduce((filteredArray, station) => {
              if(station.service_ids.length > 0) {
                filteredArray.push({
                  id: station.id,
                  name: station.name,
                  latitude: station.latitude,
                  longitude: station.longitude,
                  service_ids: station.service_ids 
                })
              }
              return filteredArray
            }, [])
  })

const getSubwayStationsByLatLon = (lat, lon) => {
  return mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_stations').find({})
  }).then(data => {
    return data.toArray()
  }).then(results => {
    let filteredArray = results.reduce((filteredArray, station) => {
              if(!station.id.endsWith("N") && !station.id.endsWith("S")) {
                filteredArray.push({
                  id: station.id,
                  name: station.name,
                  latitude: station.latitude,
                  longitude: station.longitude,
                  service_ids: station.service_ids 
                })
              }
              return filteredArray
    }, [])
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
  }).then(array => array.map(time => {
    return {
      station_id: time.station_id,
      service_id: time.service_id,
      bound_id: time.bound_id,
      arrival_time: time.arrival_time
    }
  }))

const getSubwayTimesByStationServiceBound = (stationId, serviceId, boundId) =>
  mongodb.connect(url).then(client => {
    return client.db(dbName).collection('subway_times').find({
      station_id: stationId, service_id: serviceId, bound_id: boundId
    })
  }).then(data => {
    return data.toArray()
  }).then(array => array.map(time => {
    return {
      station_id: time.station_id,
      service_id: time.service_id,
      bound_id: time.bound_id,
      arrival_time: time.arrival_time
    }
  }))

module.exports = {
  getSubwayServices, getSubwayBounds, getSubwayStations,
  getSubwayStationsWithServices, getSubwayStationsByLatLon,
  getSubwayTimes, getSubwayTimesByStationServiceBound
}
