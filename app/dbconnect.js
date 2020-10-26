const mongo = require('mongodb')
const monk = require('monk')

const db = monk("iksans:lulus3325@mongodb:27017/dementiaClassification", {authSource: "admin"})

module.exports = db