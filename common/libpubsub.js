// handles pubsub stuff
const Pubber = require('./pubber');

const libPubSub =  {
  init ({settings}) {
    this.settings = settings
    const details = settings.pubsub
    // initialize a pubsub client
    const pubber = new Pubber({ 
      details,
      gcpCreds: details.gcp.creds,
      forcePush: details.forcePush
    });

    this._clientPack = {
      pubber,
      details, 
    }
    return this
  },
  get idleTime () {
    return this.pubsub.idleTime
  },
  get clientPack () {
    return this._clientPack
  },

  // this handles a push message
  handlePush (pack) {
    return this.clientPack.pubber.handlePush(pack);
  },

  // see if this is a pusher
  get isPusher () {
    return this.clientPack.pubber.pusher
  },
  
  // get topic and subscription details for this mode
  get getDetails (){
    return clientPack && clientPack.details
  },

  // subscribe 
  subscribe (pack) {
    return this.clientPack.pubber.subscribe(pack)
  },
  
  // message handler
  onMessage (pack) {
    return this.clientPack.pubber.onMessage (pack);
  },

  // stop handling the message
  offMessage (pack) {
    return this.clientPack.pubber.offMessage(pack)
  },

  // publish an object data
  publish (pack) {
    return this.clientPack.pubber.publish(pack)
  },

  // set up a push pubsub
  makePusher (pack) {
    clientPack.pubber.makePusher(pack)
  }

}

module.exports = {
	libPubSub
}