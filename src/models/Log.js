'use strict'
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

const opts = require('./opts')

const Schema = mongoose.Schema

opts.collection = 'log'

const logSchema = new Schema({
  url: String,
  database: Number,
  compare: Number,
  render: Number,
  dateTime: Date,
  type: String
}, opts)

module.exports = mongoose.model('log', logSchema)
