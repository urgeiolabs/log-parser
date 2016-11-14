'use strict'
const Log = require('../models/Log')
const mongoConfig = require('../config').mongo

module.exports = (doc, next) => {
  const data = {
    url: doc.url,
    database: Number(doc.databaseTime),
    compare: Number(doc.compareTime),
    render: Number(doc.renderTime),
    dateTime: doc.time
  }

  data.type = /^\/de\//.test(data.url)
    ? 'neo'
    : 'legacy'

  Log.create(data, next)
}
