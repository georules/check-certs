const fs = require('fs')
const commander = require('commander')
const ssl = require('get-ssl-certificate')
const moment = require('moment')

const getObjectFromFile = (path) => JSON.parse(fs.readFileSync(path))

const version = getObjectFromFile('./package.json').version

commander.version(version)
  .option('-i, --input [file]', 'Input file, see example.json')
  .parse(process.argv)

if (typeof commander.input === 'undefined') {
  commander.outputHelp()
  process.exit(-1)
}

const servers = getObjectFromFile(commander.input)
const proms = servers.map(server => ssl.get(server).then(d => {
  d.server = server
  return d
}))
Promise.all(proms).then((data) => {
  data.forEach((d) => {
    console.log(d.server, d.subject.CN, d.issuer.CN)
    console.log(d.fingerprint)
    console.log(d.valid_to)
    console.log(`${d.server} expires ${moment(d.valid_to, 'MMM D HH:mm:ss YYYY').fromNow()}`)
    console.log()
  })
})
