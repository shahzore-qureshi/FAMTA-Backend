const mtaGTFS = require('mta-gtfs')
const mta = new mtaGTFS({ key: '3f2afc8d6b42c4ea0ba912d9abe5a28a' })
const mtaMap = require('./mtaMap')

const getSubwayStations = mta.stop().then(results => {
  let stationArray = Object.values(results)
  for(station of stationArray) station.service_ids = []
  return stationArray 
})

const getSubwayStationServicesTimeMap = (station_id) => {
  return mta.schedule(station_id, mtaMap.getFeedIdByStationId(station_id))
    .then(result => {
      if(result.schedule) {
        let serviceSet = new Set()
        result.schedule[station_id]["N"].forEach(train => serviceSet.add(train.routeId))
        result.schedule[station_id]["S"].forEach(train => serviceSet.add(train.routeId))
        return {
          station_id,
          service_ids: [...serviceSet].sort(),
          N: result.schedule[station_id]["N"],
          S: result.schedule[station_id]["S"]
        }
      } else {
        return { station_id, service_ids: [], N: [], S: [] }
      }
    })
    .catch(err => {
      console.log(err);
      return { station_id, service_ids: [], N: [], S: [] } 
    })
}

module.exports = {
  getSubwayStations,
  getSubwayStationServicesTimeMap
}
