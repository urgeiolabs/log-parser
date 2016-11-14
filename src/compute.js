'use strict'
const _ = require('lodash')
const async = require('asyncawait/async')
const await = require('asyncawait/await')
const AsciiTable = require('ascii-table')

const Log = require('./models/Log')

const aggregate = Log.aggregate({
    $group: {
      _id: '$type',
      database: { $avg: '$database' },
      render: { $avg: '$render' },
      compare: { $avg: '$compare' }
    }
  }).exec()

const getCount = type => {
  return Log.find({ type }).count().exec()
}

const getMedian = (count, kind, type) => {
  const sort = {}
  sort[kind] = 1

  const promise = Log
    .find({ type }, {
      _id: 0,
      database: 1,
      compare: 1,
      render: 1
    })
    .sort(sort)
    .skip(count/2-1)
    .limit(1)

  return promise
}

const getStd = Log.aggregate({
    $group: {
      _id: '$type',
      database: { $stdDevPop: '$database' },
      render: { $stdDevPop: '$render' },
      compare: { $stdDevPop: '$compare' }
    }
  }).exec()

const requestAverage = (seconds = false) => {
  const groupPipeline = {
    $group: {
      _id: {
        dayOfYear: { $dayOfYear: '$dateTime' },
        hour: { $hour: '$dateTime' },
        minutes: { $minute: '$dateTime' },
        type: '$type'  
      },
      count: { $sum: 1 }
    }
  }

  if (seconds) groupPipeline['$group']['_id'].seconds = { $second: '$dateTime' }

  const promise = Log.aggregate(
    groupPipeline,
    { $group: { _id: '$_id.type', average: { $avg: '$count' }}}
  )
  return promise
}

const titles = {
  averageMs: 'Average MS',
  dbMedian: 'Database Median',
  renderMedian: 'Render Median',
  compareMedian: 'Compare Median',
  std: 'Standard Deviation',
  reqPerMin: 'Request Per Minute',
  reqPerSec: 'Request Per Second'
}

const getData = async (() => {
  const averageMs           = await (aggregate)
  const legacyCount         = await (getCount('legacy'))
  const neoCount            = await (getCount('neo'))
  const dbMedianLegacy      = await (getMedian(legacyCount, 'database', 'legacy'))
  const dbMedianNeo         = await (getMedian(neoCount, 'database', 'neo'))
  const renderMedianLegacy  = await (getMedian(legacyCount, 'render', 'legacy'))
  const renderMedianNeo     = await (getMedian(neoCount, 'render', 'neo'))
  const compareMedianLegacy = await (getMedian(legacyCount, 'compare', 'legacy'))
  const compareMedianNeo    = await (getMedian(neoCount, 'compare', 'neo'))
  const standardDeviation   = await (getStd)
  const reqPerMin           = await (requestAverage())
  const reqPerSec           = await (requestAverage(true))

  const obj = {
    averageMs: _.keyBy(averageMs, '_id'),
    dbMedian: {
      legacy: dbMedianLegacy[0],
      neo: dbMedianNeo[0]
    },
    renderMedian: {
      legacy: renderMedianLegacy[0],
      neo: renderMedianNeo[0]
    },
    compareMedian: {
      legacy: compareMedianLegacy[0],
      neo: compareMedianNeo[0]
    },
    std: _.keyBy(standardDeviation, '_id'),
    reqPerMin: _.keyBy(reqPerMin, '_id'),
    reqPerSec: _.keyBy(reqPerSec, '_id')
  }

  return obj
})

const makeTable = (obj, title) => {
  const rows = []
  const keys = ['database', 'render', 'compare']

  if (title.indexOf('reqPer') > -1) {
    rows.push(['average', obj.legacy.average, obj.neo.average])
  } else {
    keys.forEach(key => {
      rows.push([key, obj.legacy[key], obj.neo[key]])
    })
  }

  const table = AsciiTable.factory({
    title: titles[title],
    heading: ['', 'legacy', 'neo'],
    rows
  })

  return table.toString()
}

module.exports = () => {
  getData()
    .then(data => {
      console.log('--------------------------')
      console.log('| Data derived from logs |')
      console.log('--------------------------')

      for (const key in data) {
        console.log(makeTable(data[key], key))
      }
      process.exit(0)
    })
    .catch(err => {
      console.log(`Something went wrong in parsing the data: ${err}`)
      process.exit(1)
    })
}
