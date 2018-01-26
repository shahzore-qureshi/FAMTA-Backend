const mtaGTFS = require('mta-gtfs')
const mta = new mtaGTFS({ key: '3f2afc8d6b42c4ea0ba912d9abe5a28a' })
const mtaMap = require('./mtaMap')
/*
mta.status('subway').then(result => {
  console.log(result);
});
*/
const getSubwayStations =
  mta.stop().then(results => {
    let stationArray = Object.values(results)
    for(station of stationArray) station.service_ids = []
    return stationArray 
  })

const getSubwayServicesByStationId = (stationId) => {
  return mta.schedule(stationId, mtaMap.getFeedIdByStationId(stationId))
    .then(result => {
      let serviceSet = new Set()
      result.schedule[stationId]["N"].forEach(train => serviceSet.add(train.routeId))
      result.schedule[stationId]["S"].forEach(train => serviceSet.add(train.routeId))
      return { stationId, serviceIds: [...serviceSet].sort() }
    })
    .catch(err => { return [] })
}

const getSubwayTimesByStationId = (stationId) => {
  return mta.schedule(stationId, mtaMap.getFeedIdByStationId(stationId))
    .then(result => {
      let serviceSet = new Set()
      result.schedule[stationId]["N"].forEach(train => serviceSet.add(train.routeId))
      result.schedule[stationId]["S"].forEach(train => serviceSet.add(train.routeId))
      return {
        stationId,
        serviceIds: [...serviceSet].sort(),
        N: result.schedule[stationId]["N"],
        S: result.schedule[stationId]["S"]
      }
    })
    .catch(err => { return [] })
}

const getSubwayBounds = (subwayService) => {
  return mta.stop().then(results => {
    let resultsArray = Object.values(results)
    let serviceCode = ""
    switch(subwayService) {
      case "A":
        serviceCode = "A"
        break
      case "C":
        return [
          { name: "Washington Heights - 168 St", direction: "North" },
          { name: "Euclid Avenue", direction: "South" }
        ]
        break
      case "E":
        return [
          { name: "Jamaica Center - Parsons/Archer", direction: "North" },
          { name: "World Trade Center", direction: "South" }
        ]
        break
      case "B":
        return [
          { name: "Bedford Park Boulevard", direction: "North" },
          { name: "Brighton Beach", direction: "South" }
        ]
        break
      case "D":
        serviceCode = "D"
        break
      case "F":
        serviceCode = "F"
        break
      case "M":
        return [
          { name: "Bedford Park Boulevard", direction: "North" },
          { name: "Brighton Beach", direction: "South" }
        ]
        break
      case "G":
        return [
          { name: "Court Sq", direction: "North" },
          { name: "Church Avenue", direction: "South" }
        ]
        break
      case "L":
        serviceCode = "L"
        break
      case "J":
        serviceCode = "J"
        break
      case "Z":
        return [
          { name: "Jamaica Center - Parsons/Archer", direction: "North" },
          { name: "Broad Street", direction: "South" }
        ]
        break
      case "N":
        return [
          { name: "Astoria - Ditmars Boulevard", direction: "North" },
          { name: "Broad Street", direction: "South" }
        ]
        break
      case "Q":
        return [
          { name: "96 Street", direction: "North" },
          { name: "Coney Island - Stillwell Avenue", direction: "South" }
        ]
        break
      case "R":
        serviceCode = "R"
        break
      case "W":
        return [
          { name: "Astoria - Ditmars Boulevard", direction: "North" },
          { name: "Whitehall Street", direction: "South" }
        ]
        break
      case "1":
        serviceCode = "1"
        break
      case "2":
        serviceCode = "2"
        break
      case "3":
        return [
          { name: "Harlem - 148 St", direction: "North" },
          { name: "New Lots Av", direction: "South" }
        ]
        break
      case "4":
        return [
          { name: "Woodlawn", direction: "North" },
          { name: "New Lots Av", direction: "South" }
        ]
        break
      case "5":
        serviceCode = "5"
        break
    }

    let stationArray = resultsArray.filter(station =>
      station.stop_id.startsWith(serviceCode)
      && !station.stop_id.endsWith("N")
      && !station.stop_id.endsWith("S")
    )
    if(stationArray.length == 0) return []

    stationArray = stationArray.sort((a,b) => {
      if(a.stop_id < b.stop_id) return -1
      if(a.stop_id > b.stop_id) return 1
      return 0
    })
    for(station of stationArray) console.log(station.stop_name)
    return [
      { name: stationArray[0].stop_name, direction: "North" },
      { name: stationArray[stationArray.length - 1].stop_name, direction: "South" }
    ]
  })
}

module.exports = {
  getSubwayStations,
  getSubwayServicesByStationId,
  getSubwayTimesByStationId
}
