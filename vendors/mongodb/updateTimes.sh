#!/bin/bash
node ./updateTimes.js
systemctl restart express.service
