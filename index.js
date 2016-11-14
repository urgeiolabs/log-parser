#!/usr/bin/env node
'use strict'
const yargs = require('yargs')
const mongoose = require('mongoose')

const stream = require('./src/stream')
const compute = require('./src/compute')
const database = require('./src/database')
const mongoConfig = require('./src/config').mongo

const url = `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.db}`

mongoose.connect(url)

const argv = yargs
  .usage('Usage: $0 <command>')
  .command(['save <filename>', 's'], 'Save the data from the logs to the database', {}, argv => {
    const filename = argv.filename
    stream(filename)
  })
  .example('$0 save <filename>')
  .command(['compute', 'c'], 'Compute data derived from the logs', {}, () => {
    compute()
  })
  .example('$0 compute')
  .command(['clean', 'delete', 'remove'], 'Clean the database', {}, () => {
    database.remove()
  })
  .example('$0 clean')
  .demand(1)
  .help()
  .version()
  .argv
