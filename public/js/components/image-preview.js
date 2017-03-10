/*global FileReader*/

const imagePreview = (element, gallery) => {
  clearGallery(gallery)

  element.addEventListener('change', (event) => {
    clearGallery(gallery)
    const files = Array.from(event.target.files)
    files.forEach((file) => {
      const thumb = document.createElement('li')
      const img = document.createElement('img')
      img.file = file
      img.style.width = '50px'
      img.style.height = '50px'
      thumb.appendChild(img)
      gallery.appendChild(thumb)

      const reader = new FileReader()
      reader.onload = setImage(img)
      reader.readAsDataURL(file)
    })
  })
}

const setImage = (img) => {
  return (event) => {
    img.src = event.target.result
  }
}

const clearGallery = (gallery) => {
  while (gallery.hasChildNodes()) {
    gallery.removeChild(gallery.lastChild)
  }
}

module.exports = imagePreview
