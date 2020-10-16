const monk = require('monk')

const db = monk(process.env.MONGO_URI || "localhost/dementiaClassification")

module.exports = db