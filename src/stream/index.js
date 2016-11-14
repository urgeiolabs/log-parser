'use strict'
const fs = require('fs')
const Transform = require('stream').Transform

const split = require('split')
const es = require('event-stream')
const Filter = require('./filter')
const Alter = require('./alter')
const mongo = require('./mongo')

const filter = new Filter()
const alter = new Alter()

const parseLog = filename => {
  fs.createReadStream(filename)
    .pipe(split())
    .pipe(filter)
    .pipe(alter)
    .pipe(es.map(mongo))
    .on('data', data => { console.log(`${new Date()} ${data.url} saved!`) })
    .on('end', () => {
      process.exit(0)
    })
    .on('error', err => {
      process.exit(1)
    })
}

module.exports = parseLog
