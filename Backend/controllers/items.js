const itemsRouter = require('express').Router()
const Item = require('../models/item')
const logger = require('../utils/logger')

//GET
itemsRouter.get('/:id', (request, response, next) => {
  Item.findById(request.params.id)
    .then(item => {
      if (item) {
        response.json(item)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

itemsRouter.get('/', (req, res) => {
  Item.find({})
  .then(notes => {{
    res.json(notes)
  }})
})

//POST
itemsRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const item = new Item({
    content: body.content,
    checked: body.checked || false,
  })

  item.save()
    .then(savedItem => {
      response.json(savedItem)
    })
    .catch(error => next(error))
})

//DELETE
itemsRouter.delete('/:id', (request, response, next) => {
  Item.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch (error => next(error))
})

//PUT
itemsRouter.put('/:id', (request, response, next) => {
  const body = request.body
  const item = {
    content: body.content,
    checked: body.checked
  }

  Item.findByIdAndUpdate(request.params.id, item, { new: true })
    .then(updateItem => {
      if (updateItem) {
        response.json(updateItem)
      } else {
        response.status(404).end()
      }
    })
    .catch (error => next(error))
})

module.exports = itemsRouter