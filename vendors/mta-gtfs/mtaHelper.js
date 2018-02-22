const mtaGTFS = require('mta-gtfs'),
      mta = new mtaGTFS({ key: '3f2afc8d6b42c4ea0ba912d9abe5a28a' }),
      mtaMap = require('./mtaMap'),
      Promise = require('bluebird'),
      htmlparser = require("htmlparser2")

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

const getSubwayLines = mta.status('subway').then(lines => {
  console.log(lines)
  let parsedLines = []
  lines.forEach(line => {
    let parsedLine = { status: line.status }
    if(line.status == "GOOD SERVICE") {
      parsedLine.events = []
    } else {
      parsedLine.events = getEventsFromStatus(line.text)
    }
    parsedLine.name = line.name
    parsedLines.push(parsedLine)
  })
  console.log(JSON.stringify(parsedLines))
})

const getEventsFromStatus = status => {
  let events = []
  let eventCounter = -1

  //Remove any HTML that styles the text.
  status = status.replace(/<STRONG>/g, "")
                 .replace(/<\/STRONG>/g, "")
                 .replace(/<b>/g, "")
                 .replace(/<\/b>/g, "")
                 .replace(/<i>/g, "")
                 .replace(/<\/i>/g, "")
                 .replace("&bull;", "")
  console.log("PARSED STATUS (no extra characters)")
  console.log(status)
  let htmlParser = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      if(name === "span" && (
           attribs.class === "TitlePlannedWork" ||
           attribs.class === "TitleServiceChange" ||
           attribs.class === "TitleDelay"
      )) {
        eventCounter++
        events[eventCounter] = { title: "", body: "" }
        switch(attribs.class) {
          case "TitlePlannedWork":
            events[eventCounter].title = "Planned Work"
            break
          case "TitleServiceChange":
            events[eventCounter].title = "Service Change"
            break
          case "TitleDelay":
            events[eventCounter].title = "Delays"
            break
        }
      }
    },
    ontext: function(text) {
      text = text.trim()
      if(text != '' && text.length > 30 && !text.includes("following guide")) {
        !text.endsWith('.') ? text += "." : text

        //If text is lowercase, that means it is a continuation
        //of the previous sentence. Let's remove the last period.
        let firstLetter = text.charAt(0)
        if(firstLetter === firstLetter.toLowerCase()
          && firstLetter !== firstLetter.toUpperCase()) {
            //Remove period and space.
            events[eventCounter].body = events[eventCounter].body.substring(0, events[eventCounter].body.length - 2)
            events[eventCounter].body += " "
        }

        events[eventCounter].body += text + " "
      }
    }
  }, {decodeEntities: true})

  htmlParser.write(status)
  htmlParser.end()

  //Remove extra spaces.
  events.forEach(event => { event.title = event.title.trim(); event.body = event.body.trim(); })
  return events 
}

module.exports = {
  getSubwayStations,
  getSubwayStationServicesTimeMap,
  getSubwayLines
}
