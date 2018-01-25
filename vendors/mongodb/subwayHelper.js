const mongodb = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017'
const dbName = 'famta'

const getSubwayLines =
    mongodb.connect(url).then(client => {
      return client.db(dbName).collection('subway_lines').find({})
    }).then(data => {
      return data.toArray()
    })

const getSubwayServices =
    mongodb.connect(url).then(client => {
      return client.db(dbName).collection('subway_services').find({})
    }).then(data => {
      return data.toArray()
    })

module.exports = { getSubwayLines, getSubwayServices }
