const Express = require('express')
const http = require('http')
const path = require('path')
const serveStatic = require('serve-static')
const compression = require('compression')
const postcss = require('postcss-middleware')
const cssnext = require('postcss-cssnext')
const cssImport = require('postcss-import')
const stripe = require('stripe')
const bodyParser = require('body-parser')
const massive = require('massive')
const browserify = require('browserify-middleware')

require('dotenv').config({ silent: true })

const Routes = require('./routes')

const app = Express()
const server = http.Server(app)
const port = process.env.PORT || 8080
const connectionString = process.env.DATABASE_URL

const massiveInstance = massive.connectSync({ connectionString })

stripe(process.env.STRIPE_TEST_KEY)

app.set('views', './server/views')
app.set('view engine', 'pug')
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(Routes(massiveInstance))

app.use('/css', postcss({
  src: (req) => {
    return 'public/css/styles.css'
  },
  plugins: [
    cssImport,
    cssnext
  ]
}))

app.get('/', (req, res, next) => {
  return res.render('index')
})

const servejs = (src) => {
  return browserify(path.join(__dirname, '..', `public/js/pages/${src}`), {
    transform: [
      'babelify'
    ],
    cache: false
  })
}

app.use('/js', browserify(path.join(__dirname, '..', 'public/js/'), {
  transform: [
    'babelify'
  ],
  cache: false
}))

server.listen(port, (err) => {
  if (err) console.error(err)
  console.info('----\n==> running on port %s', port)
})

process.on('SIGTERM', () => {
  console.log('CLOSING')
  server.close()
  process.exit()
})
