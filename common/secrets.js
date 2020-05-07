// all this stuff needs to move to secrets handling finally
// minimize the whitelist to ftp commands required just to do an upload
const whitelist = [
  'STOR',
  'PASS',
  'PASV',
  'USER',
  'TYPE',
  'QUIT',
  'ABOR',
  'FEAT'
]
const td =   {
  pubsub: {
    use: true,
    includeData: true,
    forcePush: false,
    dataArrived: 'sensor-data-nl-td',
    dataReady: 'sensor-data-nl-td',
    pusher: false,
    idleTime: 60000,
    gcp: {
      info: {
        serviceAccountFile: './private/sensorgcpupload.json'
      },
      get creds () {
        return {
          credentials: require(this.info.serviceAccountFile)
        }
      }
    }
  },
  ftp: {
    tmp: '/tmp/',
    users: require('./private/users.json').td,
    // change level to trace for all messages
    // useful when digging into what needs to be whitelisted
    logging: {name: 'td', level: 'warn'},
    gcp: {
      use: true,
      info: {
        serviceAccountFile: './private/sensorgcpupload.json',
        bucketName: 'sensor-data-nl',
        folderName: 'ftp-dev'
      },
      get creds () {
        return {
          credentials: require(this.info.serviceAccountFile),
          bucketName: this.info.bucketName,
          folderName: this.info.folderName
        }
      }
    },
    instance: {  
      anonymous: false, 
      url: 'ftp://127.0.0.1:170021',
      pasv_url: 'ftp://127.0.0.1',
      pasv_min: 18101,
      pasv_max: 18104,
      greeting: 'dev runmode',
      whitelist
    }
  }
}
const tp = {

  pubsub: {
    use: true,
    includeData: true,
    dataArrived: 'sensor-data-nl-tp',
    dataReady: 'sensor-data-nl-tp',
    pusher: false,
    idleTime: 60000,
    gcp: {
      info: {
        serviceAccountFile: './private/sensorgcpupload.json'
      },
      get creds () {
        return {
          credentials: require(this.info.serviceAccountFile)
        }
      }
    }
  },
  ftp: {
    tmp: '/tmp/',
    users: require('./private/users.json').tp,
    logging: {name: 'tp', level: 'warn'},
    gcp: {
      use: true,
      info: {
        serviceAccountFile: './private/sensorgcpupload.json',
        bucketName: 'sensor-data-nl',
        folderName: 'ftp'
      },
      get creds () {
        return {
          credentials: require(this.info.serviceAccountFile),
          bucketName: this.info.bucketName,
          folderName: this.info.folderName
        }
      }
    },
    instance: {  
      anonymous: false, 
      url: 'ftp://127.0.0.1:40021',
      pasv_url: 'ftp://127.0.0.1',
      pasv_min: 19001,
      pasv_max: 19999,
      greeting: 'prod runmode',
      whitelist
    }
  }
}
const tl = {
  ...td,
  ftp: {
    ...td.ftp,
    logging: {name: 'tl', level: 'info'},
    instance: {
      ...td.ftp.instance,
      url: 'ftp://127.0.0.1:18021',
      pasv_url: 'ftp://127.0.0.1',
      greeting: 'local runmode'
    }
  }
}
const settings = {
  tp,
  td,
  tl
}

module.exports = {
	settings
}