const mockRouter = require('./mock')
const readerRouter = require('./reader')

const routes = (app) => {
    app.use('/mock', mockRouter)
    app.use('/reader', readerRouter)
}

module.exports = routes
