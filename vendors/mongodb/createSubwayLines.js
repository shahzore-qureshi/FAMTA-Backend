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
})
.then(() => {
  client.close() 
})
.catch(err => {
  console.log("error was thrown")
  console.log(err)
})
