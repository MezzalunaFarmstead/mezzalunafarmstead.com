const Express = require('express')
const http = require('http')
const serveStatic = require('serve-static')
const compression = require('compression')

const app = Express()
const server = http.Server(app)
const port = process.env.PORT || 8080

app.set('views', './server/views')
app.set('view engine', 'pug')
app.use(compression())

app.get('/', (req, res, next) => {
  return res.render('index')
})

server.listen(port, (err) => {
  if (err) console.error(err)
  console.info('----\n==> running on port %s', port)
})

process.on('SIGTERM', () => {
  console.log('CLOSING')
  server.close()
  process.exit()
})

