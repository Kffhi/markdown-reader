const express = require('express')

const app = express()
const hostname = 'localhost'
const port = process.env.PORT || 3000

require('./middleWare/config')(app)

module.exports = app.listen(port, () => {
    console.log(`Server listening on http://${hostname}:${port}, Ctrl+C to stop`)
})
