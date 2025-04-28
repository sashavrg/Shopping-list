const itemsRouter = require('express').Router()
const Item = require('../models/item')
const logger = require('../utils/logger')

itemsRouter.get('/', (req, res) => {
  logger.info('🏓 Ping! Router is alive!')
  res.send('Hello World!')
})

module.exports = itemsRouter