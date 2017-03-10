const imagePreview = require('../../components/image-preview')

const imageInputEl = document.body.querySelector('#image-input')
const imageGalleryEl = document.body.querySelector('#image-gallery')

imagePreview(imageInputEl, imageGalleryEl)
