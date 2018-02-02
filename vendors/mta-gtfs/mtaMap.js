const getFeedIds = [1, 26, 16, 21, 2, 11, 31, 36, 51]

const getFeedIdByStationId = (stationId) => {
  if(stationId == null) return 1

  let feedId = 1
  switch(stationId[0]) {
    case "A":
    case "C":
    case "E":
      feedId = 26
      break
    case "B":
    case "D":
    case "F":
    case "M":
      feedId = 21
      break
    case "G":
      feedId = 31
      break
    case "L":
      feedId = 2
      break
    case "J":
    case "Z":
      feedId = 36
      break
    case "N":
    case "Q":
    case "R":
    case "W":
      feedId = 16
      break
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "S":
      feedId = 1
      break
  }
  return feedId
}

module.exports = { getFeedIds, getFeedIdByStationId }
