
const { server } = require('./src/server')
const { libPubSub } = require ('../common/libpubsub')
const { settings:sa } = require ('../common/secrets')
// dev, prod etc..
const {env} = process
const runmode = env.RUNMODE || 'tl'
const defaultSettings = sa[runmode]
const defaultFtp = defaultSettings.ftp
const defaultInstance = defaultFtp.instance

// pick up any env modifiable settings and replace defaults
const settings = {
  runmode,
  version:'1.0.0',
  ...defaultSettings,
  ftp: {
    ...defaultFtp,
    instance: {
      ...defaultInstance,
      url: env.URL || defaultInstance.url,
      pasv_url: env.PASVURL || defaultInstance.pasv_url,
      pasv_min: env.PASVMIN || defaultInstance.pasv_min,
      pasv_max: env.PASVMAX || defaultInstance.pasv_max
    }
  }
}
const instance = settings.ftp.instance

console.log(`${new Date().getTime()}:starting ftp server ${settings.runmode}-${settings.version} on ${instance.url}`)
console.log(`${new Date().getTime()}:passive ports ${instance.pasv_min}-${instance.pasv_max} on ${instance.pasv_url}`)
// initialize pubsub
libPubSub.init ({settings})

// intialize server to run in spectified runmode
server.init ({settings})

// kick it off
server.instance.listen()










