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

  router.get('/store/product/:productId', (req, res, next) => {
    const productId = req.params.productId

    Product.find(productId, (err, product) => {
      if (err) return next(err)
      return res.render('store/product', { product: product.attributes })
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
        return res.redirect(`/store/product/${id}`)
      })
    }
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
