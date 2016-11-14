'use strict'
const Log = require('./models/Log')

module.exports = {
  remove: () => {
    Log.remove({}, (err) => {
      if (err) {
        console.error(`Something went wrong in removing data ${err}`)
        process.exit(1)
      }

      console.info('Data has been cleaned! No clues left behind boss!')
      process.exit(0)
    })
  } 
}
