require('dotenv').config({ silent: true })
const ProductModelTests = require('./model-product')
const massive = require('massive')

const connectionString = process.env.DATABASE_URL
const massiveInstance = massive.connectSync({ connectionString, scripts: 'server/db' })

const done = () => {
  setTimeout(() => {
    massiveInstance.end()
    process.exit()
  }, 2000)
}

ProductModelTests(massiveInstance, done)
