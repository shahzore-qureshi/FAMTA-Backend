const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'
const mtaHelper = require('../mta-gtfs/mtaHelper');

(async () => {
  try {
    let client = await mongodb.connect(url)
    console.log("successfully connected to db")

    let lineData = await client.db(dbName).listCollections({ name: 'subway_lines' })
    let lineArray = await lineData.toArray()
    if(lineArray.length > 0) {
      await client.db(dbName).collection('subway_lines').drop()
    }

    let lines = await mtaHelper.getSubwayLines()
    await client.db(dbName).collection('subway_lines').insertMany(lines)

    let testLineData = await client.db(dbName).collection('subway_lines').find({})
    let testLineArray = await testLineData.toArray()
    console.log("SUBWAY LINE DATA INSERTED INTO DB")
    console.log(testLineArray)

    await client.close()
  } catch(err) {
    console.log(err)
  }
})()
