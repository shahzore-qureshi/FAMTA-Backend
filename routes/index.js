const express = require('express'),
      router = express.Router(),
      subwayHelper = require('../vendors/mongodb/subwayHelper')

router.get('/api/subway/lines', function(req, res, next) {
  subwayHelper.getSubwayLines.then(subwayLines => {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(subwayLines))
  })
})

router.get('/api/subway/services', function(req, res, next) {
  subwayHelper.getSubwayServices.then(subwayServices => {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify(subwayServices))
  })
})

module.exports = router;
