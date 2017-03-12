const Joi = require('joi')

const imageSchema = Joi.object().keys({
  id: Joi.number().empty(null),
  product_id: Joi.number(),
  filename: Joi.string().required()
})

const ProductSchema = Joi.object().keys({
  id: Joi.number().empty(null),
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  images: Joi.array().items(imageSchema),
  created_at: Joi.date().empty(null),
  updated_at: Joi.date().empty(null)
})

const defaultState = {
  id: null,
  name: null,
  description: null,
  price: null,
  created_at: null,
  updated_at: null,
  images: null
}

const defaultImageState = {
  product_id: null,
  filename: null
}

const Image = (data) => {
  const attributes = Object.assign({}, defaultImageState, data)
  if (data.id) attributes.id = data.id
  return attributes
}

const ProductModel = (db) => {
  const Product = (data) => {
    const attributes = Object.assign({}, defaultState, data)

    if (data.images && data.images.length) {
      attributes.images = data.images.map((image) => {
        const attrs = {
          filename: image.filename
        }

        image.id ? attrs.id = image.id : null
        image.product_id ? attrs.product_id = image.product_id : null

        return attrs
      })
    }

    const save = (cb) => {
      validate((err) => {
        if (err) return cb(err)

        const values = {
          name: attributes.name,
          description: attributes.description,
          price: attributes.price
        }

        attributes.id ? values.id = attributes.id : null

        db.products.save(values, (err, result) => {
          if (err) return cb(err)
          Object.assign(attributes, result)
          const newImages = attributes.images.filter((image) => { return !image.id })

          if (!newImages.length) {
            return cb(null, cb)
          }

          addImage(newImages, (err, result) => {
            if (err) return cb(err)
            attributes.images = result
            return cb(null, Product(attributes))
          })
        })
      })
    }

    const addImage = (image, cb) => {
      if (Array.isArray(image)) {
        image = image.map((file) => {
          file = Image(file)
          file.product_id = attributes.id
          return file
        })
      } else {
        image = Image(image)
        image.product_id = attributes.id
      }

      db.product_images.save(image, (err, result) => {
        if (err) return cb(err)
        return cb(null, result)
      })
    }

    const removeImage = (imageId, cb) => {
      db.product_images.destroy({ id: imageId }, { cascade: true }, (err, result) => {
        if (err) return cb(err)
        return cb(null, result)
      })
    }

    const remove = (cb) => {
      const id = attributes.id
      db.products.destroy({ id }, (err, result) => {
        if (err) return cb(err)
        return cb(null, result)
      })
    }

    const validate = (cb) => {
      Joi.validate(attributes, ProductSchema, (err) => {
        if (err) return cb(err)
        return cb(null)
      })
    }

    return {
      save,
      remove,
      addImage,
      removeImage,
      attributes,
      validate
    }
  }

  Product.find = (id, cb) => {
    db.findProduct(id, (err, results) => {
      if (!results.length) return cb(null, null)

      const data = {
        id: results[0].id,
        name: results[0].name,
        price: results[0].price,
        description: results[0].description,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        images: []
      }

      results.forEach((row) => {
        if (!row.filename) return
        data.images.push({ filename: row.filename })
      })

      if (err) return cb(err)
      return cb(null, Product(data))
    })
  }

  Product.findAll = (cb) => {
    db.products.find((err, result) => {
      if (err) return cb(err)
      return cb(null, result)
    })
  }

  Product.remove = (id, cb) => {
    db.products.destroy({ id }, (err, result) => {
      if (err) return cb(err)
      return cb(null, result)
    })
  }

  return Product
}

module.exports = ProductModel
