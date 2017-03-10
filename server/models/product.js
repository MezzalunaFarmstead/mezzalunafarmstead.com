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

    return {
      save,
      remove,
      addImage,
      removeImage,
      attributes
    }
  }

  Product.find = (id, cb) => {
    db.products.find({ id }, (err, results) => {
      if (err) return cb(err)
      return cb(null, results[0] ? Product(results[0]) : null)
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
