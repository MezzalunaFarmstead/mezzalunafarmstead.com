const express = require('express')
const multer = require('multer')
const router = express.Router()
const upload = multer({ dest: 'uploads/' })
const ProductModel = require('../models/product')

const Routes = (db) => {
  const Product = ProductModel(db)

  router.get('/store/add', (req, res, next) => {
    res.render('store/add')
  })

  router.post('/store/add', upload.array('images'), (req, res, next) => {
    const data = req.body
    data.images = req.files

    const model = Product(data)
    model.save((err, product) => {
      if (err) return next(err)
      const id = product.attributes.id
      return res.redirect(`/product/${id}`)
    })
  })

  return router
}

module.exports = Routes
