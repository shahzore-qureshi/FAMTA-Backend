const mtaGTFS = require('mta-gtfs')
const mta = new mtaGTFS({ key: '3f2afc8d6b42c4ea0ba912d9abe5a28a' })
const mtaMap = require('./mtaMap')

const getSubwayStations =
  mta.stop().then(results => {
    let stationArray = Object.values(results)
    for(station of stationArray) station.service_ids = []
    return stationArray 
  })

const getSubwayStationToSubwayServicesMap = (stationId) => {
  return mta.schedule(stationId, mtaMap.getFeedIdByStationId(stationId))
    .then(result => {
      if(result.schedule) {
        let serviceSet = new Set()
        result.schedule[stationId]["N"].forEach(train => serviceSet.add(train.routeId))
        result.schedule[stationId]["S"].forEach(train => serviceSet.add(train.routeId))
        return { stationId, serviceIds: [...serviceSet].sort() }
      } else {
        return { stationId, serviceIds: [] }
      }
    })
    .catch(err => { return { stationId, serviceIds: [] } })
}

const getSubwayTimesByStationId = (stationId) => {
  return mta.schedule(stationId, mtaMap.getFeedIdByStationId(stationId))
    .then(result => {
      if(result.schedule) {
        let serviceSet = new Set()
        result.schedule[stationId]["N"].forEach(train => serviceSet.add(train.routeId))
        result.schedule[stationId]["S"].forEach(train => serviceSet.add(train.routeId))
        return {
          stationId,
          serviceIds: [...serviceSet].sort(),
          N: result.schedule[stationId]["N"],
          S: result.schedule[stationId]["S"]
        }
      } else {
        return { stationId, serviceIds: [], N: [], S: [] }
      }
    })
    .catch(err => { return [] })
}

module.exports = {
  getSubwayStations,
  getSubwayStationToSubwayServicesMap,
  getSubwayTimesByStationId
}
