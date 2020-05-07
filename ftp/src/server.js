const { handle } = require('./handle')
const {FtpSrv} = require('ftp-srv')
const bunyan = require('bunyan')
const { libPubSub } = require ('../../common/libpubsub')

const server = {
	// the server instance
	instance: null,

	// call this to kick everything off
	init ({settings}) {
    this.settings = settings
		const options = this.settings.ftp
		
		const instance = new FtpSrv({ 
			...options.instance,
			log: options.logging ? bunyan.createLogger(options.logging) : null
    })
    this.instance = instance
    console.log(`listening for ftp on ${options.instance.url} (active) ${options.instance.pasv_url} (passive)`)
    
    // cusotm event handlers 
		this.handlers({
      onStorageError ({connection, error, fileName, settings}) {
        // handle a failure uploading
        console.error('failed on upload ', error, fileName)
        // TODO - passive runs out of ports
        // in a container, the port is not being released - how to fix ?
        // maybe we can do something with the connection
        // console.log(connection)
      
      },
      onStorageFinished ({connection, storageName, settings, fileName, data}) {
        // if we're pubsubbing, now is the time
        const now = new Date().getTime()
        if (settings.pubsub.use) {
          /// the data is a stream buffer, so we'll encode to base64
          libPubSub.publish({
            ob: {
              sentAt: now,
              fileName,
              storageName,
              data: data.toString('base64')
            },
            name: 'dataArrived'
          })
        }
        console.log(`${now}:upload completion detected ${fileName} uploaded to ${storageName}`)
        // TODO - passive runs out of ports
        // in a container, the port is not being released - how to fix ?
        // maybe we can do something with the connection
        // see...
        // https://github.com/trs/ftp-srv/issues/197
      }
    })
      
	},
	// setup event handlers
	handlers (customHandlers) {
		this.instance.on('login',(data, resolve, reject) =>
			handle.login({settings: this.settings, data, resolve, reject,...customHandlers}))

		this.instance.on('client-error', (connection, context, error) =>
			handle.clientError({settings: this.settings, connection, context, error})
		)
	}
}

module.exports = {
	server
}