// all this stuff needs to move to secrets handling finally
const settings = {

  tp: {
    runmode: 'tp',
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
      get  logging () {
        return {name: 'tp', level: 'warn'}
      },
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
      get instance () {  
        return {
          anonymous: false, 
          url: 'ftp://127.0.0.1:30021',
          pasv_url: 'ftp://127.0.0.1',
          pasv_min: 19001,
          pasv_max: 19999,
          greeting: 'prod runmode',
          whitelist: []
        }
      }
    }
  },

  td: {
    runmode: 'td',
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
      get  logging () {
        return {name: 'td', level: 'info'}
      },
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
      get instance () {
        return {
          anonymous: false, 
          url: 'ftp://127.0.0.1:30021',
          pasv_url: 'ftp://127.0.0.1',
          pasv_min: 8881,
          pasv_max: 9999,
          greeting: 'prod runmode',
          whitelist: [],
          greeting: 'dev runmode',
          blacklist: ['MDTM']
        }
      }
    }
  },

  ftp (runmode) {
    return  this[m].ftp
  }

}

module.exports = {
	settings
}