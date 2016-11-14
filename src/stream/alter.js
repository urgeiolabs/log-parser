'use strict'
const Transform = require('stream').Transform
const inherits = require('util').inherits

const grok = require('node-grok').loadDefaultSync()

const p = '\\[%{GREEDYDATA:time}\\] HTTP %{WORD:method} %{URIPATHPARAM:url} DB: %{INT:databaseTime}ms ' +
  '\\(%{GREEDYDATA:depth}\\) Geolocate: %{INT:geoTime}ms Caching: %{INT:cacheTime}ms ' +
  'Compare: %{INT:compareTime}ms Render: %{INT:renderTime}ms'

const Alter = function (options) {
  if (!(this instanceof Alter)) {
    return new Alter(options)
  }

  if (!options) options = {}

  options.objectMode = true
  Transform.call(this, options)
}

inherits(Alter, Transform)

Alter.prototype._transform = function (buffer, encoding, cb) {
  const pattern = grok.createPattern(p)
  const obj = pattern.parseSync(buffer)

  if (obj) this.push(obj)

  cb()
}

module.exports = Alter
