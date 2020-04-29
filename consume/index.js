
const { server } = require('./src/server')
const { libPubSub } = require ('../common/libpubsub')
const { settings:sa } = require ('../common/secrets')

const {env} = process
const runmode = env.RUNMODE || 'tl'
const defaultSettings = sa[runmode]

// pick up any env modifiable settings and replace defaults
const settings = {
  runmode,
  version:'1.0.0',
  ...defaultSettings
}
console.log(`${new Date().getTime()}:starting consume ${settings.runmode}-${settings.version}`)

// initialize pubsub
libPubSub.init ({settings})

// intialize server to run in spectified runmode
server.init ({settings})

// wait for messages and do something with them
server.listen()










