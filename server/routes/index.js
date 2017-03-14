const stripeTestKey = process.env.STRIPE_TEST_KEY
//const stripePublishableKey = process
const stripe = require('stripe')(stripeTestKey)
const express = require('express')
const multer = require('multer')
const uuid = require('node-uuid')
const router = express.Router()
const upload = multer()
const sharp = require('sharp')
const ProductModel = require('../models/product')

const Routes = (db) => {
  const Product = ProductModel(db)

  router.get('/login', (req, res, next) => {
    return res.render('login')
  })

  router.post('/login', (req, res, next) => {
    const password = req.body.password
    if (password === process.env.ADMIN_PASSWORD) {
      req.session.authorized = true
    }
  })

  router.get('/store/add', (req, res, next) => {
    res.render('store/add')
  })

  router.get('/store/empty_cart', (req, res, next) => {
    req.session.cart = []
    return res.redirect('/store/cart')
  })

  router.get('/store/cart', (req, res, next) => {
    console.log(req.session)
    console.log('here')
    const cart = req.session.cart || []
    console.log(cart)
    let products = []

    if (!cart.length) return res.render('store/cart', { products })

    Product.find(cart, (err, results) => {
      if (err) return next(err)
      if (!results) return res.render('store/cart', { products })

      products = products.map((product) => {
        return product.attributes
      })
      res.render('store/cart', { products })
    })
  })

  router.post('/store/add', upload.array('images'), (req, res, next) => {
    const data = req.body
    data.images = req.files

    if (!req.files.length) return saveData()

    let i = 0

    req.files.forEach((file) => {
      file.filename = uuid()
      resizeImage(file, (err) => {
        if (err) return next(err)
        return done()
      })
    })

    const done = () => {
      i++
      if (i !== req.files.length) return
      return saveData()
    }

    const saveData = () => {
      const model = Product(data)
      model.save((err, product) => {
        if (err) return next(err)
        const id = product.attributes.id
        return res.redirect(`/store/${id}`)
      })
    }
  })

  router.get('/store/:productId', (req, res, next) => {
    const productId = req.params.productId

    Product.find(productId, (err, product) => {
      if (err) return next(err)
      return res.render('store/product', { product: product.attributes })
    })
  })

  router.get('/store/:productId/charge', (req, res, next) => {
    const productId = req.params.productId

    Product.find(productId, (err, product) => {
      if (err) return next(err)
      return res.render('store/charge', { product: product.attributes })
    })
  })

  router.post('/store/:productId/charge', (req, res, next) => {
    const productId = req.params.productId

    Product.find(productId, (err, product) => {
      if (err) return next(err)
      stripe.customers.create({

      })
    })
  })

  router.get('/store/:productId/add_to_cart', (req, res, next) => {
    const productId = req.params.productId
    if (!req.session.cart) req.session.cart = []

    let alreadyExists = req.session.cart.find((id) => {
      return id === productId
    })

    if (alreadyExists) return res.redirect('/store/cart')

    Product.find(productId, (err, product) => {
      if (err) return next(err)
      req.session.cart.push(productId)
      return res.redirect('/store/cart')
    })
  })

  return router
}

const resizeImage = (file, cb) => {
  sharp(file.buffer)
    .resize(300, 300)
    .max()
    .toFormat('jpeg')
    .toFile(`${__dirname}/../../uploads/${file.filename}`, (err, info) => {
      if (err) return cb(err)

      sharp(file.buffer)
        .resize(50, 50)
        .ignoreAspectRatio()
        .toFormat('jpeg')
        .toFile(`${__dirname}/../../uploads/thumbs/${file.filename}`, (err, info) => {
          if (err) return cb(err)
          return cb(null)
        })
    })
}

module.exports = Routes
