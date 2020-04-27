// handles pubsub stuff
// can silently handle both push and pull without needing to worry too much about it in the caller
const {PubSub} = require('@google-cloud/pubsub');
const pluckdeep = require('pluck-deep');

/**
 * 
 * @param {object} details the package with the pubsub params
 * @param {object} gcpCreds gcp creds
 * @param {Boolean} [forcePush] override the default push type
 *  
 */
module.exports  = function ({ details, gcpCreds, forcePush }) {
  const ns = this;
  const psDetails =  details;
  // this is used to remember messageHandlers to be able to treat push subscriptions the same as pull
  const messageHandlers = {};

  ns.pusher =  forcePush;
  console.log(`....making pubber pusher: ${ns.pusher}`);

  // initialize
  const pubber = new PubSub({
    credentials: gcpCreds.credentials,
    projectId: gcpCreds.credentials.project_id
  });

  // this is how long before a republish happens
  ns.getIdleTime = () => psDetails.idleTime;

  // subscribe 
  ns.subscribe = ({ name }) => { 
    const subscription = pubber.subscription(pluckdeep(psDetails, name));
    console.log('....subscribed to ', subscription.name);
    return subscription;
  }

  // ack a message
  ns.ack = ({message, res, pack, error}) => {
    // if its a push then we need to push a response
    if (ns.pusher) {
      if(!res) throw new Error('express res is required for push acks');
      if (error) {
        res.status(200).send(`Bad Request: ${error}`);
      } else if (pack) {
        res.status(204).json(pack);
      } else {
        res.status(204).send();
      }
    } else {
      message.ack();
    }
    console.debug('....acked message', message.id);
  }

  ns.nack = ({message, res, error}) => {
    if (ns.pusher) {
      if(!res) throw new Error('express res is required for push nacks');
      res.status(400);
      if (error) {
        res.send(`Bad Request: ${error}`);
      } else {
        res.send()
      }

    } else {
      message.nack();
    }
    console.debug('....nacked message', message.id);
  }

  // handle a pushed body
  ns.handlePush = ({req, res, subscription}) => {
    if(!req.body) {
      // never want to see this again so consume it
      console.error('....received message with no body- consumed it anyway')
      ns.ack({res})
    }
    const {message} = req.body;
    if (!message) {
      console.error('....missing message- consumed it anyway')
      ns.ack({res})
    }
    console.debug('....received message', message.messageId);
    const {data} = message;
    if (!data) {
      console.error('....no data in message- consumed it anyway')
      ns.ack({res})
    }
    // now simulate an on event
    console.log('....handling push for', subscription.name);
    return messageHandlers[subscription.name]({
      id:message.messageId, 
      data: Buffer.from(data, 'base64')
    }, res);

  }
  
  // message handler
  ns.onMessage = ({ subscription , callback }) => {
    const messageHandler = (message, res) => {
      console.log('....handling message', message.id);
      callback({
        id: message.id,
        data: JSON.parse(message.data.toString()),
        consumed: () => ns.ack({message, res}),
        nacked: () => ns.nack({message, res})
      });
    };
    // for use with pull subs.
    messageHandlers[subscription.name] = messageHandler;
    if (!ns.pusher) {
      subscription.on('message', messageHandler);
    }
    return {
      subscription,
      messageHandler
    }
  };

  // stop handling the message
  // meesageHandler pack is what was returned from onMessage
  ns.offMessage = ({ messageHandlerPack }) => {
    const { subscription, messageHandler } = messageHandlerPack;
    subscription.removeListener('message', messageHandler);
    messageHandlers[messageHandlerPack.subscription.name] = null;
    return messageHandlerPack;
  };

  // publish an object data
  ns.publish = ({ name , ob}) => {
    const topic = pubber.topic(pluckdeep(psDetails, name));
    const data = JSON.stringify(ob);
    console.log(`${new Date().getTime()}:publishing message to topic ${topic.name}`);
    const dataBuffer = Buffer.from(data);
    return topic.publish(dataBuffer);
  };

  // required if this is  a pushmode thing
  // if app is specified then, no need to create it or start listening
  ns.makePusher = ({app, endPoint, ps, port, subscription}) => {
    // this will probably be this
    endPoint = endPoint || '/'
    console.log(`....making endpoint ${endPoint} on port ${port} for ${subscription.name}`)
    // express will be global
    if(!app) {
      const express = require('express');
      app = express();
      const bodyParser = require('body-parser');
      app.use(bodyParser.json());
      app.listen(port, () => {
        console.log('....Manage pipeline in push mode started on  port', port);
      });
      console.log('....Starting express server for push mode pubsub')
    }
    app.post(endPoint, (req,res)=> ps.handlePush ({req, res, subscription}));
    console.log('....Listening for push mode to ', subscription.name);
    return {
      app
    };
  };

};