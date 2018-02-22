#!/bin/bash
node ./updateTimes.js
node ./updateLines.js
systemctl restart express.service
