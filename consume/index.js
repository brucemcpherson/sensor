
const { server } = require('./src/server')
const { libPubSub } = require ('../common/libpubsub')
const { settings:sa } = require ('../common/secrets')
// eventually pick this up from env
const runmode = 'td'
const settings = sa[runmode]

// initialize pubsub
libPubSub.init ({settings})

// intialize server to run in spectified runmode
server.init ({settings})

// wait for messages
server.listen()










