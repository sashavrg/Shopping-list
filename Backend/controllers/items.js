const itemsRouter = require('express').Router()
const Item = require('../models/item')
const logger = require('../utils/logger')

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
  logger.info('🏓 Ping! Router is alive!')
  res.send('Hello World!')
})

itemsRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const item = new Item({
    content: body.content,
    important: body.important || false,
  })

  item.save()
    .then(savedItem => {
      response.json(savedItem)
    })
    .catch(error => next(error))
})


module.exports = itemsRouter