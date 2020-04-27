const { libPubSub } = require ('../../common/libpubsub')
const server = {

	init ({settings}) {
    this.settings = settings

  },

  listen () {
    const name = 'dataReady'
    const subscription = libPubSub.subscribe({name})

    libPubSub.onMessage({subscription, callback: (message) => {
      const now = new Date().getTime()
      const {data: ob} = message
      const {data, fileName,storageName, sentAt} = ob
      // need to rebuf the encoded data that was streamed from the file
      const buf = Buffer.from(data, 'base64')
      console.log(`${now}: received message ${message.id} (sent ${now-sentAt} ago) with ${buf.length} bytes from ${storageName}`)
      
      // now do something with 'buf' - it's the data that was uploaded
      console.log(`content was ${buf.toString()}`)
      // consume the message as we're done
      message.consumed()
      
    }})
  }

	
}

module.exports = {
	server
}