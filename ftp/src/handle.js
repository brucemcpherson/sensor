
const { GcpFileSystem } = require ('./gcpfilesystem')
const handle = {

  login ({settings, data, resolve, reject,...customHandlers}) {
    const {connection, username, password} = data

    // see if we need to stream directly to cloud
    const gcp = settings.ftp.gcp

    // check username/password  - needs a proper approach eventually
    const ob = settings.ftp.users.find(f=>f.name === username && f.password === password )
    if (!ob) {
      console.debug(username,'failed to log in')
      reject ('bad username/password')
    } else {
      // which file system to use can be by user if necessary
      const fileSystem = gcp.use ? new GcpFileSystem(connection, {
        settings,
        ...customHandlers
      }) : null
      console.debug(ob.name, 'Logged in as ', ob.role)
      resolve ({connection, fs:fileSystem })
    }
  },
  
  clientError ({connection, context, error}) {
    console.debug('client error', {connection,context,error})
  }

}

module.exports = {
	handle
}