const mtaGTFS = require('mta-gtfs')
const mta = new mtaGTFS({ key: '3f2afc8d6b42c4ea0ba912d9abe5a28a' })
const mtaMap = require('./mtaMap')
const Promise = require('bluebird')

const getSubwayStations = mta.stop().then(results => {
  let stationArray = Object.values(results)
  for(station of stationArray) station.service_ids = []
  return stationArray 
})

async function getSubwayStationServicesTimeMap(station_id) {
  let newMap = { station_id, service_ids: new Set(), N: [], S: [] }
  for(feed_id of mtaMap.getFeedIds) {
    let feedResult = await getMapForOneStation(station_id, feed_id)
    feedResult.service_ids.forEach(service_id => newMap.service_ids.add(service_id))
    feedResult.N.forEach(train => newMap.N.push(train))
    feedResult.S.forEach(train => newMap.S.push(train))
  }
  //Convert set to array.
  newMap.service_ids = [...newMap.service_ids].sort()
  return newMap
}

async function getMapForOneStation(station_id, feed_id) {
  try {
    let result = await mta.schedule(station_id, feed_id)
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
  } catch(err) {
    console.log(err);
    return { station_id, service_ids: [], N: [], S: [] } 
  }
}

module.exports = {
  getSubwayStations,
  getSubwayStationServicesTimeMap
}
