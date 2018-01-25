const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'

var client = null

mongodb.connect(url)
.then(newClient => {
  console.log("successfully connected to db")
  client = newClient
  return client.db(dbName).listCollections({ name: 'subway_lines' })
})
.then(data => { return data.toArray() })
.then(subwayLines => {
  if(subwayLines.length > 0) {
    return client.db(dbName).collection('subway_lines').drop()
  } else {
    return Promise.resolve()
  }
})
.then(() => {
  return client.db(dbName).listCollections({ name: 'subway_services' })
})
.then(data => { return data.toArray() })
.then(subwayServices => {
  if(subwayServices.length > 0) {
    return client.db(dbName).collection('subway_services').drop()
  } else {
    return Promise.resolve()
  }
})
.then(() => {
  let subwayLines = [
    { name: "blue" },
    { name: "orange" },
    { name: "lime green" },
    { name: "light gray" },
    { name: "brown" },
    { name: "yellow" },
    { name: "red" },
    { name: "green" },
    { name: "raspberry" },
    { name: "gray" },
    { name: "dark blue" }
  ]
  return client.db(dbName).collection('subway_lines').insertMany(subwayLines)
})
.then(() => {
  return client.db(dbName).collection('subway_lines').find({})
})
.then(data => { return data.toArray() })
.then(subwayLines => {
  console.log(subwayLines)
  console.log("==========")
  let subwayServices = [
    { name: "A", lineId: subwayLines.find((subwayLine) => subwayLine.name == "blue")._id },
    { name: "C", lineId: subwayLines.find((subwayLine) => subwayLine.name == "blue")._id },
    { name: "E", lineId: subwayLines.find((subwayLine) => subwayLine.name == "blue")._id },
    { name: "B", lineId: subwayLines.find((subwayLine) => subwayLine.name == "orange")._id },
    { name: "D", lineId: subwayLines.find((subwayLine) => subwayLine.name == "orange")._id },
    { name: "F", lineId: subwayLines.find((subwayLine) => subwayLine.name == "orange")._id },
    { name: "M", lineId: subwayLines.find((subwayLine) => subwayLine.name == "orange")._id },
    { name: "G", lineId: subwayLines.find((subwayLine) => subwayLine.name == "lime green")._id },
    { name: "L", lineId: subwayLines.find((subwayLine) => subwayLine.name == "light gray")._id },
    { name: "J", lineId: subwayLines.find((subwayLine) => subwayLine.name == "brown")._id },
    { name: "Z", lineId: subwayLines.find((subwayLine) => subwayLine.name == "brown")._id },
    { name: "N", lineId: subwayLines.find((subwayLine) => subwayLine.name == "yellow")._id },
    { name: "Q", lineId: subwayLines.find((subwayLine) => subwayLine.name == "yellow")._id },
    { name: "R", lineId: subwayLines.find((subwayLine) => subwayLine.name == "yellow")._id },
    { name: "W", lineId: subwayLines.find((subwayLine) => subwayLine.name == "yellow")._id },
    { name: "1", lineId: subwayLines.find((subwayLine) => subwayLine.name == "red")._id },
    { name: "2", lineId: subwayLines.find((subwayLine) => subwayLine.name == "red")._id },
    { name: "3", lineId: subwayLines.find((subwayLine) => subwayLine.name == "red")._id },
    { name: "4", lineId: subwayLines.find((subwayLine) => subwayLine.name == "green")._id },
    { name: "5", lineId: subwayLines.find((subwayLine) => subwayLine.name == "green")._id },
    { name: "6", lineId: subwayLines.find((subwayLine) => subwayLine.name == "green")._id },
    { name: "6e", lineId: subwayLines.find((subwayLine) => subwayLine.name == "green")._id },
    { name: "7", lineId: subwayLines.find((subwayLine) => subwayLine.name == "raspberry")._id },
    { name: "7e", lineId: subwayLines.find((subwayLine) => subwayLine.name == "raspberry")._id },
    { name: "S", lineId: subwayLines.find((subwayLine) => subwayLine.name == "gray")._id },
    { name: "SIR", lineId: subwayLines.find((subwayLine) => subwayLine.name == "dark blue")._id }
  ]
  return client.db(dbName).collection('subway_services').insertMany(subwayServices)
})
.then(() => {
  return client.db(dbName).collection('subway_services').find({})
})
.then(data => { return data.toArray() })
.then(subwayServices => {
  console.log(subwayServices)
})
.then(() => {
  client.close() 
})
.catch(err => {
  console.log("error was thrown")
  console.log(err)
})
