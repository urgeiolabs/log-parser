'use strict'
const devConfig = require('./devConfig')
const prodConfig = require('./prodConfig')

const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  module.exports = devConfig
} else {
  module.exports = prodConfig
}
