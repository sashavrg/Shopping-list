const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 3
  },
  checked: Boolean,
})

itemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Item', itemSchema)