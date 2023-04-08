const mockRouter = require('./mock')

const routes = (app) => {
    app.use('/mock', mockRouter)
}

module.exports = routes
