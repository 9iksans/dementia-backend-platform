const mongo = require('mongodb')
const monk = require('monk')

const db = monk("iksans:lulus3325@localhost:27017/dementiaClassification", {authSource: "admin"})

module.exports = db