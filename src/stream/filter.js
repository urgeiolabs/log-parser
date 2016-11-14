'use strict'
const Transform = require('stream').Transform
const inherits = require('util').inherits

const Filter = function (options) {
  if (!(this instanceof Filter)) {
    return new Filter(options)
  }

  if (!options) options = {}

  options.objectMode = true
  Transform.call(this, options)
}

inherits(Filter, Transform)

Filter.prototype._transform = function (buffer, encoding, cb) {
  let str

  try {
    str = JSON.stringify(buffer)
  } catch (err) {
    return cb(err)
  }

  if (str.indexOf('DB') > -1) {
    const idx = str.indexOf('HTTP') - 1
    const dateTime = str.substr(1, idx).trim()
    const rest = str.substr(idx).trim()
    const data = `[${dateTime}] ${rest}`
    this.push(data)
  }
  cb()
}

module.exports = Filter
