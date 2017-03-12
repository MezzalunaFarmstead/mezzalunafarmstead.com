const Test = require('tape')
const ProductModel = require('../../server/models/product')
const ProductFixture = require('../fixtures/product')

const testRunner = (db, done) => {
  const Model = ProductModel(db)

  db.reset((err) => {
    if (err) throw err
    runTests()
  })

  const runTests = () => {
    Test('Product Model', (t) => {
      const test = t.test
      t.plan(3)

      test('Model.save(product, cb) inserts a new product into the db', (t) => {
        t.plan(4)
        db.reset((err) => {
          t.equal(err, null)
          Model(ProductFixture).save((err, product) => {
            t.equal(err, null)
            t.ok(product.attributes.id)
            t.equal(product.attributes.name, 'Spoon')
          })
        })
      })

      test('Model.get(productId, cb) retrieves a product from the db', (t) => {
        t.plan(7)
        db.reset((err) => {
          t.equal(err, null)
          Model(ProductFixture).save((err, product) => {
            t.equal(err, null)
            t.ok(product.attributes.id)
            t.equal(product.attributes.name, 'Spoon')
            Model.find(product.attributes.id, (err, foundProduct) => {
              t.equal(err, null)
              t.ok(foundProduct.attributes.id)
              t.equal(foundProduct.attributes.name, 'Spoon')
            })
          })
        })
      })

      test('Model.remove(productId, cb) removes a product from the db', (t) => {
        t.plan(7)
        db.reset((err) => {
          t.equal(err, null)
          Model(ProductFixture).save((err, product) => {
            t.equal(err, null)
            t.ok(product.attributes.id)
            t.equal(product.attributes.name, 'Spoon')
            Model.remove(product.attributes.id, (err) => {
              t.equal(err, null)
              Model.find(product.attributes.id, (err, result) => {
                t.equal(err, null)
                t.equal(result, null)
              })
            })
          })
        })
      })
    })

    done()
  }
}

module.exports = testRunner
