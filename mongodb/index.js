let mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

let db = mongoose.connection

db.on('open', () => {
    console.log(`⚡⚡ Connected to database "${db.name}". ⚡⚡`)
})

db.on('error', (error) => {
    console.error(error)
})

module.exports = mongoose
